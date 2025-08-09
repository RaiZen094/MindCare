# MindCare Connect - Full Stack Startup Script
# This script starts both backend and frontend in separate terminals

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "MindCare Connect - Full Stack Application" -ForegroundColor Magenta  
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "backend\start-backend.ps1"

Write-Host "Waiting 10 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "frontend\start-frontend.ps1"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "MindCare Connect is starting up!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Yellow
Write-Host "H2 Database Console: http://localhost:8080/api/h2-console" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Red
Write-Host "Email: admin@mindcareconnect.bd" -ForegroundColor Red
Write-Host "Password: MindCare@Admin2025" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
