@echo off
setlocal
cd /d "%~dp0"

set "PROTOTYPE_URL=http://127.0.0.1:5173/"
set "CODEX_NODE_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

if exist "%CODEX_NODE_BIN%\node.exe" (
  set "PATH=%CODEX_NODE_BIN%;%PATH%"
)

echo Starting prototype review server...
echo URL: %PROTOTYPE_URL%
echo.

if exist "node_modules\.bin\vite.CMD" (
  call "node_modules\.bin\vite.CMD" --host 127.0.0.1 --port 5173 --strictPort --open "%PROTOTYPE_URL%"
) else (
  echo Local Vite executable was not found. Trying npm run dev...
  call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort --open "%PROTOTYPE_URL%"
)

if errorlevel 1 (
  echo.
  echo Prototype server failed to start. Review the message above.
  pause
)
