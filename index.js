/**
 * Telegram Content Capture Bot
 *
 * Captures content ideas from Telegram messages and commits them to GitHub.
 *
 * Environment variables required:
 * - TELEGRAM_BOT_TOKEN: Your bot token from @BotFather
 * - GITHUB_TOKEN: Personal Access Token with repo scope
 * - GITHUB_OWNER: Your GitHub username
 * - GITHUB_REPO: Repository name (e.g., "ultimate-brain-ai")
 * - TELEGRAM_ALLOWED_USER_ID: (Optional) Your Telegram user ID to restrict access
 */

const TelegramBot = require('node-telegram-bot-api');
const { Octokit } = require('octokit');

// Configuration from environment
const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  githubToken: process.env.GITHUB_TOKEN,
  githubOwner: process.env.GITHUB_OWNER || 'Dorde139',
  githubRepo: process.env.GITHUB_REPO || 'content-captures',
  githubBranch: process.env.GITHUB_BRANCH || 'main',
  allowedUserId: process.env.TELEGRAM_ALLOWED_USER_ID ? parseInt(process.env.TELEGRAM_ALLOWED_USER_ID) : null,
  contentPath: process.env.CONTENT_PATH || ''  // Root of repo for captures
};

// Validate config
function validateConfig() {
  const required = ['telegramToken', 'githubToken', 'githubOwner', 'githubRepo'];
  const missing = required.filter(key => !config[key]);
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('\nRequired variables:');
    console.error('  TELEGRAM_BOT_TOKEN - Get from @BotFather');
    console.error('  GITHUB_TOKEN - Personal Access Token with repo scope');
    console.error('  GITHUB_OWNER - Your GitHub username');
    console.error('  GITHUB_REPO - Repository name');
    process.exit(1);
  }
}

validateConfig();

// Initialize clients
const bot = new TelegramBot(config.telegramToken, { polling: true });
const octokit = new Octokit({ auth: config.githubToken });

console.log('🤖 Telegram Content Capture Bot started');
console.log(`📁 Saving to: ${config.githubOwner}/${config.githubRepo}/${config.contentPath}`);
if (config.allowedUserId) {
  console.log(`🔒 Restricted to user ID: ${config.allowedUserId}`);
}

/**
 * Extract URLs from text
 */
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Generate a slug from text
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[^a-z0-9\s]/g, '')       // Remove special chars
    .trim()
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .substring(0, 50)                   // Limit length
    || 'untitled';
}

/**
 * Create content markdown
 */
function createContentMarkdown(text, urls) {
  const timestamp = Date.now();
  const now = new Date().toISOString();

  // Clean text (remove URL if it's the only content)
  const cleanText = text.replace(/https?:\/\/[^\s]+/g, '').trim();
  const title = cleanText || (urls.length > 0 ? `Captured from ${new URL(urls[0]).hostname}` : 'Quick capture');

  let content = `---
title: "${title.replace(/"/g, '\\"')}"
status: idea
created: ${now}
source: telegram-capture
`;

  if (urls.length > 0) {
    content += `source-url: ${urls[0]}\n`;
  }

  content += `tags:
  - captured
  - content-idea
---

## Captured Content

`;

  if (cleanText) {
    content += `${cleanText}\n\n`;
  }

  if (urls.length > 0) {
    content += `**Source:** ${urls[0]}\n`;
    if (urls.length > 1) {
      content += `\n**Additional links:**\n`;
      urls.slice(1).forEach(url => {
        content += `- ${url}\n`;
      });
    }
  }

  return { content, title, timestamp };
}

/**
 * Commit file to GitHub
 */
async function commitToGitHub(filename, content, message) {
  const path = `${config.contentPath}/${filename}`;

  try {
    // Create or update file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.githubOwner,
      repo: config.githubRepo,
      path: path,
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: config.githubBranch
    });

    return { success: true, path };
  } catch (error) {
    console.error('GitHub API error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle incoming messages
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || msg.caption || '';

  // Security: Check if user is allowed (if restriction is set)
  if (config.allowedUserId && userId !== config.allowedUserId) {
    console.log(`⚠️ Unauthorized access attempt from user ${userId}`);
    await bot.sendMessage(chatId, '⛔ Unauthorized. This bot is private.');
    return;
  }

  // Ignore commands for now (can extend later)
  if (text.startsWith('/start')) {
    await bot.sendMessage(chatId,
      '👋 *Content Capture Bot*\n\n' +
      'Send me any text or URL and I\'ll save it to your content idea bank.\n\n' +
      '• Send a URL → Captures the link\n' +
      '• Send text → Captures as idea\n' +
      '• Send both → Captures with context\n\n' +
      '_Your ideas are saved to GitHub automatically._',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (text.startsWith('/')) {
    return; // Ignore other commands
  }

  if (!text.trim()) {
    await bot.sendMessage(chatId, '🤔 Send me some text or a URL to capture.');
    return;
  }

  // Process the capture
  console.log(`📥 Received from ${userId}: ${text.substring(0, 100)}...`);

  const urls = extractUrls(text);
  const { content, title, timestamp } = createContentMarkdown(text, urls);
  const slug = generateSlug(title);
  const filename = `content-${timestamp}-${slug}.md`;

  // Commit to GitHub
  const result = await commitToGitHub(
    filename,
    content,
    `📝 Capture: ${title.substring(0, 50)}`
  );

  if (result.success) {
    const response = urls.length > 0
      ? `✅ *Captured!*\n\n📎 ${urls[0]}\n📁 \`${filename}\``
      : `✅ *Captured!*\n\n💡 "${title.substring(0, 50)}..."\n📁 \`${filename}\``;

    await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    console.log(`✅ Saved: ${filename}`);
  } else {
    await bot.sendMessage(chatId, `❌ Failed to save: ${result.error}`);
    console.error(`❌ Failed: ${result.error}`);
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bot shutting down...');
  bot.stopPolling();
  process.exit(0);
});
