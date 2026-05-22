param(
    [string]$Server = "185.189.49.123",
    [string]$User = "deploy",
    [string]$KeyPath = "$HOME\.ssh\ahlafors_vps",
    [string[]]$Domains = @(
        "https://ahlaforsfabriker.se/",
        "https://ahlaforsgym.se/",
        "https://ahlaforsbryggerier.se/"
    ),
    [int[]]$Ports = @(3000, 3001, 3002)
)

$ErrorActionPreference = "Stop"

function Assert-Path {
    param([string]$PathToCheck)

    if (-not (Test-Path $PathToCheck)) {
        throw "Missing path: $PathToCheck"
    }
}

function Write-Check {
    param(
        [string]$Name,
        [bool]$Ok,
        [string]$Details = ""
    )

    $status = if ($Ok) { "OK" } else { "FAIL" }
    $color = if ($Ok) { "Green" } else { "Red" }
    $line = "{0,-6} {1}" -f $status, $Name

    if (-not [string]::IsNullOrWhiteSpace($Details)) {
        $line = "$line - $Details"
    }

    Write-Host $line -ForegroundColor $color
}

function Invoke-SshCapture {
    param([string]$Command)

    $output = ssh -i $KeyPath -o BatchMode=yes -o ConnectTimeout=10 "${User}@${Server}" $Command 2>&1
    return @{
        ExitCode = $LASTEXITCODE
        Output = ($output -join "`n")
    }
}

Assert-Path $KeyPath

$failed = 0

Write-Host ""
Write-Host "==> Public domains" -ForegroundColor Cyan

foreach ($domain in $Domains) {
    try {
        $response = Invoke-WebRequest -Uri $domain -Method Head -TimeoutSec 15 -MaximumRedirection 0 -SkipHttpErrorCheck
        $ok = [int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 400
        Write-Check $domain $ok "HTTP $($response.StatusCode)"
        if (-not $ok) {
            $failed++
        }
    }
    catch {
        Write-Check $domain $false $_.Exception.Message
        $failed++
    }
}

Write-Host ""
Write-Host "==> PM2 and systemd" -ForegroundColor Cyan

$service = Invoke-SshCapture "systemctl is-active pm2-deploy"
$serviceOk = $service.ExitCode -eq 0 -and $service.Output.Trim() -eq "active"
Write-Check "pm2-deploy.service" $serviceOk $service.Output.Trim()
if (-not $serviceOk) {
    $failed++
}

$pm2 = Invoke-SshCapture "pm2 ls"
$pm2Ok = $pm2.ExitCode -eq 0 -and
    $pm2.Output.Contains("ahlafors") -and
    $pm2.Output.Contains("ahlafors-gym") -and
    $pm2.Output.Contains("ahlafors-bryggerier") -and
    -not $pm2.Output.Contains("errored")
Write-Check "pm2 process list" $pm2Ok
if (-not $pm2Ok) {
    $failed++
}
$pm2.Output | Write-Host

Write-Host ""
Write-Host "==> Internal ports" -ForegroundColor Cyan

foreach ($port in $Ports) {
    $result = Invoke-SshCapture "curl -fsS -I --max-time 8 http://127.0.0.1:$port/ >/dev/null && echo ok"
    $ok = $result.ExitCode -eq 0 -and $result.Output.Trim().EndsWith("ok")
    Write-Check "127.0.0.1:$port" $ok
    if (-not $ok) {
        $failed++
    }
}

Write-Host ""
if ($failed -eq 0) {
    Write-Host "VPS health check OK." -ForegroundColor Green
    exit 0
}

Write-Host "VPS health check failed: $failed check(s)." -ForegroundColor Red
exit 1
