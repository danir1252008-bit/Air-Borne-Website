$gitDir = "C:\Users\kunal\.gemini\mingit"
$gitExe = "$gitDir\cmd\git.exe"

Set-Location "c:\Users\kunal\Downloads\ezgif-1f850248cb1344e4-png-split"

Write-Host "Configuring Git Identity..."
& $gitExe config user.email "danir1252008-bit@users.noreply.github.com"
& $gitExe config user.name "danir1252008-bit"

if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git Repository..."
    & $gitExe init
}

Write-Host "Configuring Remote Origin..."
& $gitExe remote remove origin 2>$null
& $gitExe remote add origin "https://github.com/danir1252008-bit/Air-Borne-Website.git"

Write-Host "Setting Branch to main..."
& $gitExe branch -M main

Write-Host "Staging Files..."
& $gitExe add .

Write-Host "Creating Commit..."
& $gitExe commit -m "Airborne website codebase prepared for Vercel & Hostinger deployment"

Write-Host "Pushing to GitHub..."
& $gitExe push -u origin main
