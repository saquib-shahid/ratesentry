# 📦 npm ↔ GitHub: Complete Publishing Guide

A personal reference for connecting an npm package to a GitHub repo and setting up auto-publish via GitHub Actions.

---

## Overview

There are **two separate things** you can do:

| Goal | What it means |
|---|---|
| **Link package to GitHub repo** | Adds a "Repository" link on the npmjs.com package page |
| **Auto-publish via GitHub Actions** | Runs `npm publish` automatically on every push |
| **Show in GitHub Packages** | Package appears in the "Packages" section of your GitHub repo |

---

## Step 1 — Link the npm Package to Your GitHub Repo

Add these fields to your `package.json`. This is what makes the GitHub link appear on your npmjs.com package page.

```json
{
  "name": "your-package-name",
  "version": "1.0.0",
  "keywords": ["tag1", "tag2"],
  "author": "your-github-username",
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/YOUR_REPO#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/issues"
  }
}
```

---

## Step 2 — Get an npm Automation Token

> **Why Automation token?** It bypasses 2FA, so GitHub Actions can publish without needing a OTP.

1. Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Click **Generate New Token** → choose **"Automation"**
3. Copy the token

---

## Step 3 — Add Token to GitHub Secrets

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN` | Value: *(paste the token)*

---

## Step 4 — Create the GitHub Actions Workflow

Create this file at `.github/workflows/publish.yml`:

```yaml
name: Publish to npm and GitHub Packages

on:
  push:
    branches:
      - main
    paths:
      - 'package.json'   # adjust path if package.json is in a subdirectory

jobs:
  # ── Job 1: Publish to npmjs.com ─────────────────────────────────────────────
  publish-npm:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build   # remove if no build step
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  # ── Job 2: Publish to GitHub Packages (shows in repo sidebar) ───────────────
  publish-gpr:
    runs-on: ubuntu-latest
    needs: publish-npm          # runs only after npm publish succeeds
    permissions:
      packages: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@YOUR_USERNAME'

      - run: npm ci
      - run: npm run build   # remove if no build step

      # GitHub Packages requires scoped name: @username/package-name
      # This renames it on-the-fly only for this publish step
      - name: Scope package name for GitHub Packages
        run: |
          jq '.name = "@YOUR_USERNAME/YOUR_PACKAGE_NAME" | .publishConfig = {"registry": "https://npm.pkg.github.com"}' package.json > package.tmp.json
          mv package.tmp.json package.json

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # built-in, no setup needed
```

> **Note:** If your `package.json` is in a subdirectory (like `rate-limiter-service/`), add `working-directory` under `defaults.run` for each job:
> ```yaml
> defaults:
>   run:
>     working-directory: rate-limiter-service
> ```
> And update `paths` to `'rate-limiter-service/package.json'`.

---

## Step 5 — Publish a New Version

From now on, publishing is just a git push:

```bash
# Bump version (pick one)
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Commit and push — workflow triggers automatically
git add .
git commit -m "release vX.X.X"
git push origin main
```

The workflow:
1. Publishes `your-package` to **npmjs.com**
2. Publishes `@username/your-package` to **GitHub Packages** → shows in repo sidebar

---

## Summary — What Goes Where

```
npmjs.com/package/your-package     ← unscoped, public, what users install
github.com/user/repo → Packages   ← scoped (@user/pkg), linked to your repo
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `EOTP` error when publishing manually | Use an **Automation** token, or pass `--otp=<code>` |
| Packages not showing in GitHub repo | Must publish to `npm.pkg.github.com`, not `npmjs.com` |
| `Cannot publish over previously published version` | Bump version first with `npm version patch` |
| Workflow not triggering | Check `paths` in the workflow matches the actual `package.json` location |
| `GITHUB_TOKEN` permission denied | Add `permissions: packages: write` to the job |
