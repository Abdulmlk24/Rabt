$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
node test-rabt.cjs
if ($LASTEXITCODE -ne 0) { throw 'Rabt checks failed.' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'rabt.html') -Destination (Join-Path $PSScriptRoot 'index.html')
Write-Output 'GitHub Pages entry point updated: index.html'
