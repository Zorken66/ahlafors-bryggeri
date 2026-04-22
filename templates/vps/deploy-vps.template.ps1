param(
    [string]$Server = "example-vps",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\example_vps",
    [string]$RemoteRoot = "/var/www/example-app",
    [string]$AppSubdir = "",
    [string]$Pm2Process = "example-app",
    [string]$HealthcheckUrl = "http://127.0.0.1:3000/",
    [switch]$SkipInstall,
    [switch]$SkipMigrate,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = if ($AppSubdir) { Join-Path $repoRoot $AppSubdir } else { $repoRoot }

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
}

Assert-Path $appRoot
Assert-Path $KeyPath

$filesToUpload = @(
    "package.json",
    "package-lock.json",
    ".env.example",
    ".gitignore",
    "README.md"
)

$dirsToUpload = @()

Push-Location $appRoot
try {
    Invoke-Step "Ensuring remote project directory exists" {
        Invoke-Ssh "mkdir -p '$RemoteRoot'"
    }

    foreach ($file in $filesToUpload) {
        $fullPath = Join-Path $appRoot $file
        if (Test-Path $fullPath) {
            Invoke-Step "Uploading file $file" {
                scp -i $KeyPath $fullPath "${User}@${Server}:${RemoteRoot}/$file"
            }
        }
    }

    foreach ($dir in $dirsToUpload) {
        $fullPath = Join-Path $appRoot $dir
        if (Test-Path $fullPath) {
            Invoke-Step "Replacing remote directory $dir" {
                Invoke-Ssh "rm -rf '$RemoteRoot/$dir'"
                scp -i $KeyPath -r $fullPath "${User}@${Server}:${RemoteRoot}/"
            }
        }
    }

    if (-not $SkipInstall) {
        Invoke-Step "Installing remote dependencies" {
            Invoke-Ssh "cd '$RemoteRoot' && npm install"
        }
    }

    Invoke-Step "Refreshing .env for CLI tools" {
        Invoke-Ssh "cd '$RemoteRoot' && if [ -f .env.local ]; then cp .env.local .env; fi"
    }

    if (-not $SkipMigrate) {
        Invoke-Step "Running database migrations" {
            Invoke-Ssh "cd '$RemoteRoot' && if [ -f prisma/schema.prisma ]; then npx prisma migrate deploy; fi"
        }
    }

    if (-not $SkipBuild) {
        Invoke-Step "Building app" {
            Invoke-Ssh "cd '$RemoteRoot' && npm run build"
        }
    }

    Invoke-Step "Reloading PM2 process" {
        Invoke-Ssh "cd '$RemoteRoot' && pm2 reload '$Pm2Process' --update-env || pm2 start server.js --name '$Pm2Process' --update-env && pm2 save"
    }

    Invoke-Step "Smoke test from VPS" {
        Invoke-Ssh "for i in 1 2 3 4 5; do if curl -fsS -o /dev/null --max-time 10 '$HealthcheckUrl' 2>/dev/null; then echo 'Smoke test OK'; exit 0; fi; sleep 2; done; echo 'Smoke test failed'; exit 1"
    }

    Write-Host ""
    Write-Host "VPS deploy complete." -ForegroundColor Green
}
finally {
    Pop-Location
}
