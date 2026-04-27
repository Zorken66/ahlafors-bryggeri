param(
    [string]$InputBundle,
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$Mode = "merge-sections",
    [switch]$VerifyOnly,
    [switch]$SkipBackup,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$currentRoot = "$RemoteRoot/current"
$sharedRoot = "$RemoteRoot/shared"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$remotePromotionRoot = "/tmp/ahlafors-cms-promotion-$timestamp"
$remoteBundleRoot = "$remotePromotionRoot/bundle"
$remoteBackupRoot = "$sharedRoot/content-backups/$timestamp"
$healthcheckUrl = "http://127.0.0.1:3002/api/health"

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

function Invoke-Step {
    param(
        [string]$Message,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
    & $Action
}

Assert-Path $repoRoot
Assert-Path $KeyPath

if (-not $InputBundle) {
    throw "Ange -InputBundle <path>."
}

$resolvedBundle = Resolve-Path $InputBundle
$bundleRoot = $resolvedBundle.Path

Assert-Path $bundleRoot
Assert-Path (Join-Path $bundleRoot "manifest.json")
Assert-Path (Join-Path $bundleRoot "content.json")
Assert-Path (Join-Path $bundleRoot "media.json")

$bundleHasMediaFiles = Test-Path (Join-Path $bundleRoot "media")

if (-not $VerifyOnly -and -not $Force) {
    Write-Host ""
    Write-Host "WARNING: This script imports CMS content into production." -ForegroundColor Yellow
    Write-Host "Use -Force to continue after preflight and backup." -ForegroundColor Yellow
    exit 1
}

Push-Location $repoRoot
try {
    Invoke-Step "Preparing remote promotion directories" {
        Invoke-Ssh "mkdir -p '$remoteBundleRoot' '$sharedRoot/content-backups'"
    }

    Invoke-Step "Uploading content bundle" {
        scp -i $KeyPath -r (Join-Path $bundleRoot "*") "${User}@${Server}:$remoteBundleRoot/"
        if ($LASTEXITCODE -ne 0) {
            throw "SCP upload failed: $bundleRoot"
        }
    }

    if (-not $SkipBackup -and -not $VerifyOnly) {
        Invoke-Step "Creating rollback bundle on VPS" {
            Invoke-Ssh "mkdir -p '$remoteBackupRoot' && cd '$currentRoot' && npm run cms:export-content -- --output '$remoteBackupRoot' --include-media-files --source production-pre-import-$timestamp"
        }
    }

    Invoke-Step "Running remote preflight verification" {
        $preflightFlags = @("--mode", $Mode)
        if ($bundleHasMediaFiles) {
            $preflightFlags += "--copy-media-files"
        }
        $preflightFlags += "--verify-only"
        $preflightFlagsText = ($preflightFlags | ForEach-Object { "'$_'" }) -join " "
        Invoke-Ssh "cd '$currentRoot' && npm run cms:import-content -- --input '$remoteBundleRoot' $preflightFlagsText"
    }

    if ($VerifyOnly) {
        Write-Host ""
        Write-Host "Verify-only complete." -ForegroundColor Green
        Write-Host "Remote bundle path: $remoteBundleRoot"
        exit 0
    }

    Invoke-Step "Running production content import" {
        $importFlags = @("--mode", $Mode)
        if ($bundleHasMediaFiles) {
            $importFlags += "--copy-media-files"
        }

        $importFlagsText = ($importFlags | ForEach-Object { "'$_'" }) -join " "
        Invoke-Ssh "cd '$currentRoot' && npm run cms:import-content -- --input '$remoteBundleRoot' $importFlagsText"
    }

    Invoke-Step "Smoke test from VPS" {
        Invoke-Ssh "for i in 1 2 3 4 5 6; do if curl -fsS -o /dev/null --max-time 10 '$healthcheckUrl' 2>/dev/null; then echo 'Smoke test OK'; exit 0; fi; sleep 2; done; echo 'Smoke test failed'; exit 1"
    }

    Write-Host ""
    Write-Host "Content promotion complete." -ForegroundColor Green
    Write-Host "Rollback bundle: $remoteBackupRoot" -ForegroundColor Green
}
finally {
    Pop-Location
}
