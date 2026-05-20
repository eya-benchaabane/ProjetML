# ci/run.ps1 — Lance le pipeline CI/CD local (Windows PowerShell)
# Usage:
#   .\ci\run.ps1              # pipeline complet
#   .\ci\run.ps1 -Quick       # rapide (~1 min)
#   .\ci\run.ps1 -WithCD      # CI + déploiement local (retrain)

param(
    [switch]$Quick,
    [switch]$WithCD,
    [switch]$SkipSetup,
    [string]$Stage = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$env:PYTHONIOENCODING = "utf-8"

$argsList = @("ci/local_pipeline.py")
if ($Quick)      { $argsList += "--quick" }
if ($WithCD)     { $argsList += "--with-cd" }
if ($SkipSetup)  { $argsList += "--skip-setup" }
if ($Stage)      { $argsList += @("--stage", $Stage) }

Write-Host ""
Write-Host "Lancement CI/CD local..." -ForegroundColor Cyan
python @argsList
exit $LASTEXITCODE
