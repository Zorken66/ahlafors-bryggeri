param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string]$RemoteRoot = "/var/www/ahlafors-bryggerier",
    [string]$LocalContentFile = "frontend/content/site-content.json",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$resolvedContentFile = Join-Path $repoRoot $LocalContentFile

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

Assert-Path $repoRoot
Assert-Path $KeyPath
Assert-Path $resolvedContentFile

$remoteJson = "/tmp/ahlafors-site-content.json"
$remoteScript = "$RemoteRoot/current/.promote-site-content.js"

Write-Host ""
Write-Host "WARNING: This script overwrites CMS content in the VPS database with the content from:" -ForegroundColor Yellow
Write-Host "  $resolvedContentFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Use this only when you explicitly want to promote content to production." -ForegroundColor Yellow
Write-Host "Do not use this as part of normal code deploys." -ForegroundColor Yellow

if (-not $Force) {
    Write-Host ""
    Write-Host "Aborted. Re-run with -Force if you explicitly want to overwrite the VPS CMS content." -ForegroundColor Yellow
    exit 1
}

Push-Location $repoRoot
try {
    Write-Host ""
    Write-Host "==> Uploading content file" -ForegroundColor Cyan
    scp -i $KeyPath $resolvedContentFile "${User}@${Server}:$remoteJson"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed: $resolvedContentFile"
    }

    $remoteNodeScript = @'
const fs = require("fs");
const { Client } = require("pg");

(async () => {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error("Missing input JSON path.");
  }

  const content = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const client = new Client({
    host: process.env.CMS_DB_HOST || "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT || "5432"),
    database: process.env.CMS_DB_NAME,
    user: process.env.CMS_DB_USER,
    password: process.env.CMS_DB_PASSWORD,
  });

  await client.connect();
  await client.query(
    "UPDATE cms_content SET content_json = $1, updated_at = CURRENT_TIMESTAMP WHERE content_key = 'site'",
    [JSON.stringify(content)],
  );
  const { rows } = await client.query(
    "SELECT content_json::jsonb->'homepage'->>'heroBackgroundImage' AS hero_image FROM cms_content WHERE content_key = 'site' LIMIT 1",
  );
  console.log(JSON.stringify({ ok: true, heroImage: rows[0]?.hero_image ?? null }));
  await client.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

    Write-Host ""
    Write-Host "==> Writing remote promotion script" -ForegroundColor Cyan
    Invoke-Ssh "cat > '$remoteScript' <<'EOF'
$remoteNodeScript
EOF"

    Write-Host ""
    Write-Host "==> Promoting content into VPS database" -ForegroundColor Cyan
    Invoke-Ssh "cd '$RemoteRoot/current' && set -a && . '$RemoteRoot/shared/.env.local' && set +a && node '$remoteScript' '$remoteJson'"

    Write-Host ""
    Write-Host "==> Cleaning temporary files" -ForegroundColor Cyan
    Invoke-Ssh "rm -f '$remoteScript' '$remoteJson'"

    Write-Host ""
    Write-Host "Content promotion complete." -ForegroundColor Green
}
finally {
    Pop-Location
}
