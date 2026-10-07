# Levanta Drum Sync en desarrollo y lo abre en el navegador.
# Uso:  .\Ejecutar.ps1        (Ctrl+C en esta ventana para detenerlo)
$url = 'http://localhost:5174'

Set-Location $PSScriptRoot

if (-not (Test-Path node_modules)) {
    Write-Host 'Instalando dependencias...' -ForegroundColor Yellow
    npm install
}

# Abre el navegador apenas Vite responde, sin bloquear la terminal donde corre el servidor.
Start-Job -ArgumentList $url -ScriptBlock {
    param($url)
    for ($i = 0; $i -lt 60; $i++) {
        try { Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 1 | Out-Null; break } catch { Start-Sleep -Milliseconds 500 }
    }
    Start-Process $url
} | Out-Null

Write-Host "Drum Sync en $url (Ctrl+C para detener)" -ForegroundColor Green
npm run dev
