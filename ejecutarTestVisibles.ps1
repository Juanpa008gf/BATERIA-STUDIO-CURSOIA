# Corre los tests mostrando cada uno con su nombre y resultado.
# Uso:  .\ejecutarTestVisibles.ps1          (una sola vez)
#       .\ejecutarTestVisibles.ps1 -Watch   (queda abierto y re-ejecuta al guardar)
param([switch]$Watch)

Set-Location $PSScriptRoot

if (-not (Test-Path node_modules)) {
    Write-Host 'Instalando dependencias...' -ForegroundColor Yellow
    npm install
}

if ($Watch) {
    npx vitest --reporter=verbose
} else {
    npx vitest run --reporter=verbose
    $codigo = $LASTEXITCODE
    Write-Host ''
    if ($codigo -eq 0) {
        Write-Host 'Todos los tests pasaron.' -ForegroundColor Green
    } else {
        Write-Host 'Hay tests que fallaron.' -ForegroundColor Red
    }
    Read-Host 'Enter para cerrar'
    exit $codigo
}
