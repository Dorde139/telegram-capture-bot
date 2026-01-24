# Telegram Content Capture Bot

Capture content ideas from anywhere via Telegram. Share a URL or text → it's saved to your Content folder automatically.

## How It Works

```
[Phone] → Telegram → [Cloud Bot] → GitHub → [Laptop git pull] → Content/
```

## Setup (10 minutes)

### Step 1: Create Telegram Bot (2 min)

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "Content Capture")
4. Choose a username (e.g., `yourname_capture_bot`)
5. **Copy the token** - you'll need it

### Step 2: Create GitHub Token (2 min)

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token" → "Fine-grained token"
3. Name: "Telegram Capture Bot"
4. Expiration: 1 year (or your preference)
5. Repository access: "Only select repositories" → select `ultimate-brain-ai`
6. Permissions → Repository permissions:
   - Contents: **Read and write**
7. Click "Generate token"
8. **Copy the token** - you'll need it

### Step 3: Get Your Telegram User ID (1 min)

1. Open Telegram, search for `@userinfobot`
2. Send `/start`
3. **Copy your ID** (numbers only)

This restricts the bot to only accept messages from you.

### Step 4: Deploy to Railway (5 min)

Railway is the easiest free option.

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `ultimate-brain-ai` repo
5. Railway will detect the Node.js app
6. Go to "Settings" → set Root Directory to: `telegram-capture-bot`
7. Go to "Variables" and add:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather |
| `GITHUB_TOKEN` | Your GitHub token (repo scope for content-captures) |
| `GITHUB_OWNER` | `Dorde139` |
| `GITHUB_REPO` | `content-captures` |
| `TELEGRAM_ALLOWED_USER_ID` | Your Telegram user ID (from @userinfobot) |

8. Click "Deploy"

### Step 5: Test It

1. Open Telegram, find your bot
2. Send `/start`
3. Send a URL or text
4. Check your GitHub repo → `Content/` folder for the new file

## Auto-Sync to Laptop

### Option A: Startup Sync (Recommended)

Add to Windows startup so it syncs when your laptop boots:

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Right-click in folder → New → Shortcut
4. Browse to: `C:\Users\dorde\Documents\Code\ClaudeCode\ultimate-brain-ai\scripts\sync-content.bat`
5. Name it "Sync Content"

Now every time you start your laptop, it pulls the latest content.

### Option B: Task Scheduler (More Control)

For scheduled syncs (e.g., every hour):

1. Open Task Scheduler (search in Start menu)
2. Click "Create Basic Task"
3. Name: "Sync Ultimate Brain Content"
4. Trigger: Daily or "When the computer starts"
5. Action: "Start a program"
6. Program: `C:\Users\dorde\Documents\Code\ClaudeCode\ultimate-brain-ai\scripts\sync-content.bat`
7. Finish

## Usage

### From Phone

Just share to your bot:

- **Share a URL** → Opens share sheet → Select your bot → Captured!
- **Send text** → Type in bot chat → Captured!
- **URL + comment** → Add your thoughts when sharing → Both captured!

### What Gets Created

```yaml
---
title: "Your text or URL hostname"
status: idea
created: 2025-01-24T10:30:00.000Z
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

## Alternative Hosting

### Render (Free, spins down when idle)

1. Go to: https://render.com
2. New → Web Service → Connect your repo
3. Root Directory: `telegram-capture-bot`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables (same as Railway)

### Fly.io (Free, always on)

```bash
cd telegram-capture-bot
fly launch
fly secrets set TELEGRAM_BOT_TOKEN=xxx GITHUB_TOKEN=xxx ...
fly deploy
```

## Troubleshooting

### Bot not responding

- Check Railway/Render logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Make sure bot is deployed and running

### Files not appearing in GitHub

- Check `GITHUB_TOKEN` has write permissions
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Check Railway logs for API errors

### Unauthorized message

- Your Telegram user ID might be wrong
- Remove `TELEGRAM_ALLOWED_USER_ID` temporarily to test

## Local Development

To test locally:

```bash
cd telegram-capture-bot
npm install

# Set environment variables
set TELEGRAM_BOT_TOKEN=your_token
set GITHUB_TOKEN=your_token
set GITHUB_OWNER=your_username
set GITHUB_REPO=ultimate-brain-ai

npm start
```
