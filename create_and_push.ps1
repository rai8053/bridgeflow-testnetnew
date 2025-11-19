<#
create_and_push.ps1

Usage examples:
1) Monorepo (push entire workspace to one GitHub repo):
   powershell -ExecutionPolicy Bypass -File .\create_and_push.ps1 -RepoUrl "https://github.com/USERNAME/REPO.git"

2) Split repos (backend and frontend separately):
   powershell -ExecutionPolicy Bypass -File .\create_and_push.ps1 -Split -BackendRepoUrl "https://github.com/USERNAME/backend-repo.git" -FrontendRepoUrl "https://github.com/USERNAME/frontend-repo.git"

This script will:
- verify `git` is available
- initialize a git repo if needed
- create an initial commit (if none)
- set branch to `main` (changeable via -Branch)
- add `origin` remote and push

#>

param(
    [string]$RepoUrl,
    [string]$BackendRepoUrl,
    [string]$FrontendRepoUrl,
    [string]$Branch = "main",
    [switch]$Split
)

function Abort([string]$msg) {
    Write-Error $msg
    exit 1
}

function Ensure-Git {
    try {
        & git --version > $null 2>&1
    } catch {
        Abort "git is not installed or not in PATH. Please install Git: https://git-scm.com/downloads"
    }
}

function Init-And-Push($path, $remoteUrl, $commitMessage) {
    Write-Host ""
    Write-Host "--- Processing $path ---"
    Push-Location $path
    try {
        $inside = $false
        try { $r = git rev-parse --is-inside-work-tree 2>$null; if ($LASTEXITCODE -eq 0) { $inside = $true } } catch {}

        if (-not $inside) {
            Write-Host "Initializing git repository in $path"
            git init
        } else {
            Write-Host "Already inside a git repo: $path"
        }

        # Stage everything
        git add --all

        # Commit if no commits exist
        $hasCommits = $false
        try { git rev-parse --verify HEAD > $null 2>&1; if ($LASTEXITCODE -eq 0) { $hasCommits = $true } } catch {}
        if (-not $hasCommits) {
            git commit -m $commitMessage 2>$null
            if ($LASTEXITCODE -ne 0) { Write-Host "No changes to commit or commit failed." }
        } else {
            Write-Host "Repository already has commits. Creating a new commit with any unstaged changes."
            git commit -m $commitMessage 2>$null
            if ($LASTEXITCODE -ne 0) { Write-Host "No changes to commit." }
        }

        # Set main branch name
        git branch -M $Branch

        # Add/override origin remote
        if ($remoteUrl) {
            try { git remote remove origin 2>$null } catch {}
            git remote add origin $remoteUrl
            Write-Host "Pushing to $remoteUrl (branch $Branch)"
            git push -u origin $Branch
        } else {
            Write-Host "No remote URL provided for $path — skip pushing."
        }
    } finally {
        Pop-Location
    }
}

Ensure-Git

if ($Split) {
    if (-not $BackendRepoUrl -or -not $FrontendRepoUrl) {
        Abort "For -Split you must provide -BackendRepoUrl and -FrontendRepoUrl"
    }

    $root = Get-Location

    $backendPath = Join-Path $root 'interceptor-backend'
    $frontendPath = Join-Path $root 'interceptor-frontend'

    if (-not (Test-Path $backendPath)) { Abort "Backend path not found: $backendPath" }
    if (-not (Test-Path $frontendPath)) { Abort "Frontend path not found: $frontendPath" }

    Init-And-Push $backendPath $BackendRepoUrl "Initial commit - backend"
    Init-And-Push $frontendPath $FrontendRepoUrl "Initial commit - frontend"

    Write-Host ""
    Write-Host "Done. Backend and Frontend pushed (or set up)."
} else {
    if (-not $RepoUrl) {
        $RepoUrl = Read-Host "Enter the remote repo URL for the whole workspace (e.g. https://github.com/USER/REPO.git)"
    }
    Init-And-Push (Get-Location) $RepoUrl "Initial commit - workspace"
    Write-Host ""
    Write-Host "Done. Workspace pushed to $RepoUrl (or set up locally)."
}
