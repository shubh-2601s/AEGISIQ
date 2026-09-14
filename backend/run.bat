@echo off
cd /d "%~dp0"
echo ========================================================
echo AegisIQ — Portable Spring Boot Launcher
echo ========================================================

if not exist "mvn-bin\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Downloading portable Maven 3.9.6...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip', 'mvn.zip')"
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path mvn.zip -DestinationPath mvn-bin -Force"
    if exist "mvn.zip" del "mvn.zip"
    echo Maven ready!
)

echo Starting AegisIQ Backend with Supabase PostgreSQL...
mvn-bin\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
