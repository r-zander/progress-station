@echo off
cd /d "%~dp0"

echo Starting Progress Station...
start https://localhost:8000
start http://localhost:8000
start "Progress Station Server" tools\local-server\caddy_windows_amd64.exe run --config tools\local-server\Caddyfile
