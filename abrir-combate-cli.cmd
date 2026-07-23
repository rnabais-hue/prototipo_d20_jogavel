@echo off
setlocal
cd /d "%~dp0"

set "CODEX_NODE_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

if exist "%CODEX_NODE_BIN%\node.exe" (
  set "PATH=%CODEX_NODE_BIN%;%PATH%"
)

echo Starting Combat CLI Harness v0...
echo Type help inside the prompt to see commands.
echo.

if exist "node_modules\.bin\vite-node.CMD" (
  call "node_modules\.bin\vite-node.CMD" src/cli/combatCli.ts
) else (
  echo Local vite-node executable was not found. Trying pnpm combat:cli...
  call pnpm combat:cli
)

if errorlevel 1 (
  echo.
  echo Combat CLI failed to start. Review the message above.
  pause
)
