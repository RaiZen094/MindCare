# MindCare Connect Backend Startup Script (PowerShell)
# This script sets JAVA_HOME and starts the Spring Boot application

Write-Host "Starting MindCare Connect Backend..." -ForegroundColor Green
Write-Host "Setting JAVA_HOME to: C:\Program Files\Java\jdk-21" -ForegroundColor Yellow

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host "Starting Spring Boot application..." -ForegroundColor Green

.\mvnw.cmd spring-boot:run
