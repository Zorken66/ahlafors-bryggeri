param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$Pm2Process = "ahlafors-bryggerier",
    [int]$AppPort = 3002,
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$currentRoot = "$RemoteRoot/current"
$sharedRoot = "$RemoteRoot/shared"
$healthcheckUrl = "http://127.0.0.1:$AppPort/api/health"

function Invoke-Step {
    param(
        [string]$Message,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
    & $Action
}

function Assert-Path {
    param([string]$PathToCheck)

    if (-not (Test-Path $PathToCheck)) {
        throw "Missing path: $PathToCheck"
    }
}

function Invoke-Ssh {
    param([string]$Command)

    ssh -i $KeyPath "${User}@${Server}" $Command
    if ($LASTEXITCODE -ne 0) {
        throw "SSH command failed: $Command"
    }
}

function Upload-FileIfPresent {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )

    if (Test-Path $LocalPath) {
        scp -i $KeyPath $LocalPath "${User}@${Server}:$RemotePath"
        if ($LASTEXITCODE -ne 0) {
            throw "SCP upload failed: $LocalPath"
        }
    }
}

function Upload-DirectoryIfPresent {
    param(
        [string]$LocalPath,
        [string]$RemoteParent
    )

    if (Test-Path $LocalPath) {
        scp -i $KeyPath -r $LocalPath "${User}@${Server}:$RemoteParent"
        if ($LASTEXITCODE -ne 0) {
            throw "SCP upload failed: $LocalPath"
        }
    }
}

Assert-Path $repoRoot
Assert-Path $KeyPath

Push-Location $repoRoot
try {
    Invoke-Step "Preparing remote directories" {
        Invoke-Ssh "mkdir -p '$currentRoot' '$sharedRoot/uploads' '$currentRoot/frontend'"
    }

    Invoke-Step "Clearing previous release files" {
        Invoke-Ssh "find '$currentRoot' -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
    }

    Invoke-Step "Recreating release directories" {
        Invoke-Ssh "mkdir -p '$currentRoot/frontend'"
    }

    Invoke-Step "Uploading root files" {
        Upload-FileIfPresent (Join-Path $repoRoot "package.json") "$currentRoot/package.json"
        Upload-FileIfPresent (Join-Path $repoRoot "package-lock.json") "$currentRoot/package-lock.json"
        Upload-FileIfPresent (Join-Path $repoRoot "DEPLOY.md") "$currentRoot/DEPLOY.md"
        Upload-FileIfPresent (Join-Path $repoRoot "DEPLOYMENT.md") "$currentRoot/DEPLOYMENT.md"
        Upload-FileIfPresent (Join-Path $repoRoot "PRODUCTION-CUTOVER.md") "$currentRoot/PRODUCTION-CUTOVER.md"
    }

    Invoke-Step "Uploading frontend files" {
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\package.json") "$currentRoot/frontend/package.json"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\next.config.ts") "$currentRoot/frontend/next.config.ts"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\next-env.d.ts") "$currentRoot/frontend/next-env.d.ts"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\postcss.config.mjs") "$currentRoot/frontend/postcss.config.mjs"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\tsconfig.json") "$currentRoot/frontend/tsconfig.json"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\README.md") "$currentRoot/frontend/README.md"
        Upload-FileIfPresent (Join-Path $repoRoot "frontend\proxy.ts") "$currentRoot/frontend/proxy.ts"

        Upload-DirectoryIfPresent (Join-Path $repoRoot "frontend\app") "$currentRoot/frontend"
        Upload-DirectoryIfPresent (Join-Path $repoRoot "frontend\components") "$currentRoot/frontend"
        Upload-DirectoryIfPresent (Join-Path $repoRoot "frontend\content") "$currentRoot/frontend"
        Upload-DirectoryIfPresent (Join-Path $repoRoot "frontend\lib") "$currentRoot/frontend"
        Upload-DirectoryIfPresent (Join-Path $repoRoot "frontend\public") "$currentRoot/frontend"
    }

    Invoke-Step "Uploading scripts" {
        Upload-DirectoryIfPresent (Join-Path $repoRoot "scripts") "$currentRoot"
    }

    Invoke-Step "Linking shared environment and uploads" {
        Invoke-Ssh "mkdir -p '$currentRoot/frontend/public' && ln -sfn '$sharedRoot/uploads' '$currentRoot/frontend/public/uploads' && if [ -f '$sharedRoot/.env.local' ]; then ln -sfn '$sharedRoot/.env.local' '$currentRoot/frontend/.env.local'; fi"
    }

    if (-not $SkipInstall) {
        Invoke-Step "Installing dependencies" {
            Invoke-Ssh "cd '$currentRoot' && npm ci"
        }
    }

    if (-not $SkipBuild) {
        Invoke-Step "Building app" {
            Invoke-Ssh "cd '$currentRoot' && npm run build --workspace=frontend"
        }
    }

    if (-not $SkipRestart) {
        Invoke-Step "Reloading PM2 process" {
            Invoke-Ssh "if pm2 describe '$Pm2Process' >/dev/null 2>&1; then pm2 reload '$Pm2Process' --update-env; else pm2 start /usr/bin/npm --name '$Pm2Process' --cwd '$currentRoot/frontend' -- start -- --hostname 127.0.0.1 --port $AppPort; fi && pm2 save"
        }
    }

    Invoke-Step "Smoke test from VPS" {
        Invoke-Ssh "for i in 1 2 3 4 5 6 7 8; do if curl -fsS -o /dev/null --max-time 10 '$healthcheckUrl' 2>/dev/null; then echo 'Smoke test OK'; exit 0; fi; sleep 2; done; echo 'Smoke test failed'; exit 1"
    }

    Write-Host ""
    Write-Host "VPS deploy complete." -ForegroundColor Green
}
finally {
    Pop-Location
}
