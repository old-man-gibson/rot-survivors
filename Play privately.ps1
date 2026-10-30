$ErrorActionPreference = 'Stop'
$tailscaleExe = 'C:\Program Files\Tailscale\tailscale.exe'
if (!(Test-Path $tailscaleExe)) { throw 'Install Tailscale from https://tailscale.com/download/windows and sign in first.' }
$nodeExe = (Get-Command node -ErrorAction Stop).Source
Push-Location $PSScriptRoot
try {
    $missing = @('actor-art.js', 'front-end.js') | Where-Object { !(Test-Path $_) }
    if ($missing) { throw ('Game files are missing: ' + ($missing -join ', ') + '. Restore them before starting.') }
    & $tailscaleExe status
    if ($LASTEXITCODE -ne 0) { throw 'Connect Tailscale and sign in first.' }
    # Foreground Serve is removed automatically when this script stops.
    $server = Start-Process -FilePath $nodeExe -ArgumentList 'private-server.cjs' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 1
    if ($server.HasExited) { throw 'Game server could not start. Check whether port 8765 is already in use.' }
    Write-Host 'Open the Tailscale URL below on your phone. Keep this window open. Press Ctrl+C to stop.'
    & $tailscaleExe serve --https=8443 http://127.0.0.1:8765
} finally {
    if ($server -and !$server.HasExited) { Stop-Process -Id $server.Id }
    Pop-Location
}
