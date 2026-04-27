param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$Schedule = "15 3 * * *",
    [int]$RetainLast = 14
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sharedRoot = "$RemoteRoot/shared"
$remoteBinRoot = "$sharedRoot/bin"
$remoteScriptPath = "$remoteBinRoot/backup-cms-nightly.sh"
$remoteLogPath = "$sharedRoot/logs/backup-cms-nightly.log"
$localTempScript = Join-Path $env:TEMP "ahlafors-bryggerier-backup-nightly.sh"

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

    ssh -i $KeyPath "${User}@${Server}" $Command
    if ($LASTEXITCODE -ne 0) {
        throw "SSH command failed: $Command"
    }
}

Assert-Path $repoRoot
Assert-Path $KeyPath

$remoteScript = @"
#!/usr/bin/env bash
set -euo pipefail

remote_root='$RemoteRoot'
shared_root='$sharedRoot'
backup_base='$sharedRoot/cms-backups'
retain_last='$RetainLast'
timestamp=`$(date +"%Y%m%d-%H%M%S")
backup_root="`$backup_base/`$timestamp"
env_file="`$shared_root/.env.local"

mkdir -p "`$backup_root/uploads" '$sharedRoot/logs'

set -a
. "`$env_file"
set +a

: "`${CMS_DB_HOST:=127.0.0.1}"
: "`${CMS_DB_PORT:=5432}"
: "`${CMS_DB_NAME:=ahlafors_bryggerier_cms}"
: "`${CMS_DB_USER:=ahlafors_bryggerier_user}"

export PGPASSWORD="`${CMS_DB_PASSWORD:-}"

pg_dump \
  -h "`$CMS_DB_HOST" \
  -p "`$CMS_DB_PORT" \
  -U "`$CMS_DB_USER" \
  -d "`$CMS_DB_NAME" \
  -Fc \
  -f "`$backup_root/postgres.dump"

cp -a "`$shared_root/uploads/." "`$backup_root/uploads/"

uploads_count=`$(find "`$backup_root/uploads" -type f | wc -l | tr -d ' ')
uploads_bytes=`$(du -sb "`$backup_root/uploads" | awk '{print `$1}')
created_at=`$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "`$backup_root/manifest.json" <<EOF
{
  "format": "ahlafors-cms-vps-backup",
  "version": 1,
  "createdAt": "`$created_at",
  "database": {
    "engine": "postgres",
    "databaseName": "`$CMS_DB_NAME",
    "dumpFile": "postgres.dump"
  },
  "uploads": {
    "sourceDir": "`$shared_root/uploads",
    "snapshotDir": "uploads",
    "fileCount": `$uploads_count,
    "totalBytes": `$uploads_bytes
  }
}
EOF

if [ "`$retain_last" -gt 0 ]; then
  find "`$backup_base" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"`${retain_last}" | xargs -r rm -rf
fi
"@

Invoke-Step "Uploading nightly backup script" {
    [System.IO.File]::WriteAllText($localTempScript, $remoteScript.Replace("`r`n", "`n"), [System.Text.Encoding]::ASCII)
    Invoke-Ssh "mkdir -p '$remoteBinRoot' '$sharedRoot/logs' '$sharedRoot/cms-backups'"
    scp -i $KeyPath $localTempScript "${User}@${Server}:$remoteScriptPath"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed: $localTempScript"
    }
    Invoke-Ssh "chmod +x '$remoteScriptPath'"
}

Invoke-Step "Printing cron line to install" {
    $cronLine = "$Schedule $remoteScriptPath >> $remoteLogPath 2>&1"
    Write-Host $cronLine
}

Write-Host ""
Write-Host "Nightly backup script prepared on VPS." -ForegroundColor Green
Write-Host "Cron was not installed automatically." -ForegroundColor Yellow
Write-Host "Reason: verify and sanitize current crontab before adding new jobs." -ForegroundColor Yellow

if (Test-Path $localTempScript) {
    Remove-Item $localTempScript -Force -ErrorAction SilentlyContinue
}
