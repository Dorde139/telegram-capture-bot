# Telegram Content Capture Bot

Capture content ideas from anywhere via Telegram. Share a URL or text → it's automatically saved to GitHub.

```
📱 Phone → Telegram Bot → GitHub → 💻 Your Computer
```

## What It Does

- **Share a URL** → Bot saves it as a markdown file with metadata
- **Send text** → Bot captures your idea
- **URL + comment** → Bot saves both together

All captures are committed to a GitHub repo, which you can sync to your local machine.

---

## Setup Guide (15 minutes)

### Prerequisites

- A GitHub account
- A Telegram account
- A Render account (free tier works)

---

## Step 1: Create Telegram Bot (2 min)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a **display name** (e.g., "Content Capture")
4. Choose a **username** (must end in `bot`, e.g., `myname_capture_bot`)
5. **Copy the token** BotFather gives you (looks like `123456789:ABCdefGHI...`)

> ⚠️ Keep this token secret - anyone with it can control your bot.

---

## Step 2: Create GitHub Repositories (3 min)

You'll need **two repositories**:

### 2a. Bot Code Repository

This holds the bot's source code for deployment.

1. Go to [github.com/new](https://github.com/new)
2. **Name:** `telegram-capture-bot`
3. **Visibility:** Public (code has no secrets)
4. **Don't** initialize with README
5. Click **Create repository**

Clone this repo and copy the bot files into it:

```bash
git clone https://github.com/YOUR_USERNAME/telegram-capture-bot.git
cd telegram-capture-bot
# Copy index.js, package.json from this project
git add .
git commit -m "Initial commit"
git push
```

### 2b. Content Captures Repository

This is where your captured content will be stored.

1. Go to [github.com/new](https://github.com/new)
2. **Name:** `content-capture` (or any name you prefer)
3. **Visibility:** Private (recommended - these are your ideas)
4. **Check** "Add a README file"
5. Click **Create repository**

---

## Step 3: Create GitHub Token (2 min)

The bot needs permission to write to your captures repo.

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"**
3. **Token name:** `Telegram Capture Bot`
4. **Expiration:** 1 year (or your preference)
5. **Repository access:** Select "Only select repositories" → choose your `content-capture` repo
6. **Permissions** → Repository permissions → **Contents:** Read and write
7. Click **Generate token**
8. **Copy the token** (starts with `github_pat_...`)

> ⚠️ Save this token somewhere safe - you can't see it again.

---

## Step 4: Get Your Telegram User ID (1 min)

This restricts the bot so only you can use it.

1. Open Telegram
2. Search for **@userinfobot**
3. Send `/start`
4. **Copy your ID** (just the number, like `123456789`)

---

## Step 5: Deploy to Render (5 min)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your **`telegram-capture-bot`** repository
4. Configure settings:
   - **Name:** `telegram-capture-bot`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Add **Environment Variables** (click "Add Environment Variable" for each):

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from Step 1 |
| `GITHUB_TOKEN` | Your GitHub token from Step 3 |
| `GITHUB_OWNER` | Your GitHub username |
| `GITHUB_REPO` | `content-capture` (or your repo name) |
| `TELEGRAM_ALLOWED_USER_ID` | Your Telegram user ID from Step 4 |

6. Click **"Deploy Web Service"**

Wait 2-3 minutes for the deploy to complete.

---

## Step 6: Test It!

1. Open Telegram
2. Find your bot (search for the username you created)
3. Send `/start`
4. Send a test URL: `https://example.com`
5. You should see: ✅ **Captured!**

Check your GitHub repo - you'll see a new `content-*.md` file!

---

## Step 7: Sync to Your Computer (Optional)

To automatically sync captures to a local folder:

### Option A: Simple Git Pull

```bash
cd ~/my-content-folder
git clone https://github.com/YOUR_USERNAME/content-capture.git
# Run periodically:
git pull
```

### Option B: Automated Sync Script (Windows)

Create a batch file:

```batch
@echo off
set "REPO_URL=https://github.com/YOUR_USERNAME/content-capture.git"
set "CAPTURES_DIR=%USERPROFILE%\.content-captures"
set "CONTENT_DIR=C:\path\to\your\content\folder"

if exist "%CAPTURES_DIR%\.git" (
    cd /d "%CAPTURES_DIR%"
    git pull origin main --quiet
) else (
    git clone "%REPO_URL%" "%CAPTURES_DIR%" --quiet
)

for %%f in ("%CAPTURES_DIR%\content-*.md") do (
    if not exist "%CONTENT_DIR%\%%~nxf" (
        copy "%%f" "%CONTENT_DIR%\" >nul
        echo Synced: %%~nxf
    )
)
```

Add to Windows Startup: `Win+R` → `shell:startup` → create shortcut to your script.

---

## Configuration Options

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather |
| `GITHUB_TOKEN` | Yes | GitHub PAT with repo write access |
| `GITHUB_OWNER` | Yes | Your GitHub username |
| `GITHUB_REPO` | Yes | Repository name for captures |
| `GITHUB_BRANCH` | No | Branch name (default: `main`) |
| `TELEGRAM_ALLOWED_USER_ID` | No | Restrict bot to your user ID |
| `CONTENT_PATH` | No | Subfolder in repo (default: root) |

---

## File Format

Each capture creates a markdown file:

```markdown
---
title: "Article title or your text"
status: idea
created: 2024-01-15T10:30:00.000Z
source: telegram-capture
source-url: https://example.com/article
tags:
  - captured
  - content-idea
---

## Captured Content

Your text here...

**Source:** https://example.com/article
```

---

## Troubleshooting

### Bot not responding

- Check Render logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Make sure the service is running (not sleeping)

### "Not Found" error when saving

- Verify `GITHUB_REPO` matches your actual repo name exactly
- Check that `GITHUB_TOKEN` has write access to the repo
- Ensure the repo exists and isn't empty (needs at least a README)

### "Unauthorized" message

- Your `TELEGRAM_ALLOWED_USER_ID` might be wrong
- Get your correct ID from @userinfobot
- Or remove the variable to allow anyone (not recommended)

### Render service sleeping

Free tier services sleep after 15 minutes of inactivity. They wake up when a message arrives, but there may be a ~30 second delay on first message.

---

## Alternative Hosting

### Fly.io

```bash
cd telegram-capture-bot
fly launch
fly secrets set TELEGRAM_BOT_TOKEN=xxx GITHUB_TOKEN=xxx GITHUB_OWNER=xxx GITHUB_REPO=xxx
fly deploy
```

### Self-hosted

```bash
npm install
export TELEGRAM_BOT_TOKEN=xxx
export GITHUB_TOKEN=xxx
export GITHUB_OWNER=xxx
export GITHUB_REPO=xxx
npm start
```

---

## License

MIT - Use it however you like.
