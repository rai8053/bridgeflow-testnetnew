How to push this workspace to GitHub

Options
- Monorepo: one GitHub repository containing both `interceptor-backend` and `interceptor-frontend` in one repo.
- Split repos: separate GitHub repositories for backend and frontend folders.

Quick manual steps (PowerShell)

1) Monorepo — manual:

```powershell
cd "C:\Users\Raihan Hazra\OneDrive\Desktop\fullstack bridgeflow - Copy"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

2) Split repos — manual (backend then frontend):

```powershell
cd "C:\Users\Raihan Hazra\OneDrive\Desktop\fullstack bridgeflow - Copy\interceptor-backend"
git init
git add .
git commit -m "Initial commit - backend"
git branch -M main
git remote add origin https://github.com/USERNAME/BACKEND_REPO.git
git push -u origin main

cd "C:\Users\Raihan Hazra\OneDrive\Desktop\fullstack bridgeflow - Copy\interceptor-frontend"
git init
git add .
git commit -m "Initial commit - frontend"
git branch -M main
git remote add origin https://github.com/USERNAME/FRONTEND_REPO.git
git push -u origin main
```

Using the included PowerShell helper script

1) Monorepo:

```powershell
powershell -ExecutionPolicy Bypass -File .\create_and_push.ps1 -RepoUrl "https://github.com/USERNAME/REPO.git"
```

2) Split repos:

```powershell
powershell -ExecutionPolicy Bypass -File .\create_and_push.ps1 -Split -BackendRepoUrl "https://github.com/USERNAME/BACKEND_REPO.git" -FrontendRepoUrl "https://github.com/USERNAME/FRONTEND_REPO.git"
```

Notes
- Replace `USERNAME` and `REPO` names with your GitHub username and chosen repo names.
- If you haven't created the remote repo on GitHub yet, create it on github.com/new and copy the HTTPS URL into the commands above.
- If you prefer the `gh` CLI, you can create repos from the terminal (example):

```powershell
gh repo create USERNAME/REPO --public --source=. --remote=origin --push
```

- The helper script checks for `git` and will abort if it's not installed.
