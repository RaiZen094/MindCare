@echo off
REM MindCare Connect Backend Startup Script
REM This script sets JAVA_HOME and starts the Spring Boot application

echo Starting MindCare Connect Backend...
echo Setting JAVA_HOME to: C:\Program Files\Java\jdk-21

set JAVA_HOME=C:\Program Files\Java\jdk-21

echo JAVA_HOME set to: %JAVA_HOME%
echo Starting Spring Boot application...

.\mvnw.cmd spring-boot:run

pause
