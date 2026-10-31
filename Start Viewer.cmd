@echo off
cd /d "%~dp0"
start "" http://localhost:5174/
node serve.mjs
pause
