# PowerShell script to start development server with proper environment
$env:NODE_ENV = "development"
$env:PATH += ";C:\Program Files\nodejs"

Set-Location "d:\Software\Kinjar Frontend\kinjar-frontend"

Write-Host "Starting development server with NODE_ENV=development..."
Write-Host "Current directory: $(Get-Location)"

& "C:\Program Files\nodejs\npm.cmd" run dev