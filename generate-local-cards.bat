@echo off
setlocal

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\generate-local-cards.ps1"

if errorlevel 1 (
  echo.
  echo Failed to generate cards/local-cards.js
  pause
  exit /b 1
)

echo.
echo Done. Refresh index.html in your browser.
pause
