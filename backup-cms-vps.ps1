param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$RemoteBackupBase = "",
    [string]$DownloadTo = "",
    [int]$RetainLast = 0,
    [switch]$ListOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sharedRoot = "$RemoteRoot/shared"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$localTempScript = Join-Path $env:TEMP "ahlafors-bryggerier-vps-backup-$timestamp.sh"
$remoteTempScript = "/tmp/ahlafors-bryggerier-vps-backup-$timestamp.sh"

if ([string]::IsNullOrWhiteSpace($RemoteBackupBase)) {
    $RemoteBackupBase = "$sharedRoot/cms-backups"
}

$remoteBackupRoot = "$RemoteBackupBase/$timestamp"

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

if ($ListOnly) {
    Invoke-Step "Listing existing VPS backups" {
        Invoke-Ssh "if [ -d '$RemoteBackupBase' ]; then find '$RemoteBackupBase' -mindepth 1 -maxdepth 1 -type d | sort; else echo 'No backup directory found.'; fi"
    }
    exit 0
}

$remoteScript = @"
#!/usr/bin/env bash
set -euo pipefail
backup_root='$remoteBackupRoot'
shared_root='$sharedRoot'
env_file='$sharedRoot/.env.local'

if [ ! -f "`$env_file" ]; then
  echo "Missing env file: `$env_file" >&2
  exit 1
fi

mkdir -p "`$backup_root/uploads"

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

echo "Backup root: `$backup_root"
echo "Uploads files: `$uploads_count"
"@

Invoke-Step "Creating VPS CMS backup" {
    [System.IO.File]::WriteAllText($localTempScript, $remoteScript.Replace("`r`n", "`n"), [System.Text.Encoding]::ASCII)
    scp -i $KeyPath $localTempScript "${User}@${Server}:$remoteTempScript"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed: $localTempScript"
    }

    Invoke-Ssh "mkdir -p '$RemoteBackupBase' && chmod +x '$remoteTempScript' && '$remoteTempScript' && rm -f '$remoteTempScript'"
}

if ($RetainLast -gt 0) {
    Invoke-Step "Pruning old VPS backups" {
        Invoke-Ssh "if [ -d '$RemoteBackupBase' ]; then find '$RemoteBackupBase' -mindepth 1 -maxdepth 1 -type d | sort | head -n -$RetainLast | xargs -r rm -rf; fi"
    }
}

if (-not [string]::IsNullOrWhiteSpace($DownloadTo)) {
    $downloadRoot = [System.IO.Path]::GetFullPath($DownloadTo)

    if (-not (Test-Path $downloadRoot)) {
        New-Item -ItemType Directory -Force -Path $downloadRoot | Out-Null
    }

    Invoke-Step "Downloading VPS backup" {
        scp -i $KeyPath -r "${User}@${Server}:$remoteBackupRoot" "$downloadRoot"
        if ($LASTEXITCODE -ne 0) {
            throw "SCP download failed: $remoteBackupRoot"
        }
    }
}

Write-Host ""
Write-Host "VPS CMS backup complete." -ForegroundColor Green
Write-Host "Remote backup: $remoteBackupRoot" -ForegroundColor Green

if (Test-Path $localTempScript) {
    Remove-Item $localTempScript -Force -ErrorAction SilentlyContinue
}
