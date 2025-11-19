@echo off
REM push_monorepo.bat
REM Usage: push_monorepo.bat <remote-repo-https-url>

SETLOCAL
if "%~1"=="" (
  set /p REPOURL=Enter remote repo URL (e.g. https://github.com/rai8053/fullstack-bridgeflow.git): 
) else (
  set REPOURL=%~1
)

cd /d "%~dp0"

git --version >nul 2>&1
if ERRORLEVEL 1 (
  echo Git not found in PATH. Install Git and try again: https://git-scm.com/downloads
  exit /b 1
)

if not exist .git (
  echo Initializing git repository in %CD%
  git init
) else (
  echo Repository already initialized.
)

echo Staging files...
git add .

echo Committing...
git commit -m "Initial commit" 2>nul || echo No changes to commit or commit already exists.

echo Setting branch to main...
git branch -M main 2>nul

if not "%REPOURL%"=="" (
  echo Setting remote origin to %REPOURL%
  git remote remove origin 2>nul
  git remote add origin %REPOURL%
  echo Pushing to origin main...
  git push -u origin main
) else (
  echo No remote URL provided; repository created locally only.
)

ENDLOCAL
echo Done.
