param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$Schedule = "*/5 * * * *",
    [switch]$SkipCronInstall
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$localScriptPath = Join-Path $repoRoot "infra\vps\pm2-watchdog.sh"
$sharedRoot = "$RemoteRoot/shared"
$remoteBinRoot = "$sharedRoot/bin"
$remoteScriptPath = "$remoteBinRoot/pm2-watchdog.sh"
$remoteLogPath = "$sharedRoot/logs/pm2-watchdog.log"

function Assert-Path {
    param([string]$PathToCheck)

    if (-not (Test-Path $PathToCheck)) {
        throw "Missing path: $PathToCheck"
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

function Invoke-Ssh {
    param([string]$Command)

    ssh -i $KeyPath -o BatchMode=yes "${User}@${Server}" $Command
    if ($LASTEXITCODE -ne 0) {
        throw "SSH command failed: $Command"
    }
}

Assert-Path $repoRoot
Assert-Path $KeyPath
Assert-Path $localScriptPath

Invoke-Step "Uploading PM2 watchdog script" {
    Invoke-Ssh "mkdir -p '$remoteBinRoot' '$sharedRoot/logs'"
    scp -i $KeyPath $localScriptPath "${User}@${Server}:$remoteScriptPath"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed: $localScriptPath"
    }
    Invoke-Ssh "chmod +x '$remoteScriptPath'"
}

$cronMarker = "# ahlafors-pm2-watchdog"
$cronLine = "$Schedule $remoteScriptPath >> $remoteLogPath 2>&1 $cronMarker"

if ($SkipCronInstall) {
    Invoke-Step "Printing cron line" {
        Write-Host $cronLine
    }
}
else {
    Invoke-Step "Installing cron line" {
        $escapedMarker = $cronMarker.Replace("'", "'\''")
        $escapedLine = $cronLine.Replace("'", "'\''")
        Invoke-Ssh "(crontab -l 2>/dev/null | grep -v '$escapedMarker'; echo '$escapedLine') | crontab -"
    }
}

Invoke-Step "Running watchdog once" {
    Invoke-Ssh "'$remoteScriptPath'"
}

Write-Host ""
Write-Host "PM2 watchdog prepared on VPS." -ForegroundColor Green
Write-Host "Script: $remoteScriptPath" -ForegroundColor Green
Write-Host "Log: $remoteLogPath" -ForegroundColor Green
