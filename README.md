# Telegram Bot with Neon Database

This project implements a Telegram bot that uses Neon PostgreSQL database for storing conversations and user data.

## Setup

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Set up environment variables:
   Create a `.env.local` file with the following variables:
   \`\`\`
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   NEXT_PUBLIC_APP_URL=your_app_url
   DATABASE_URL=your_neon_database_url
   OPENAI_API_KEY=your_openai_api_key
   \`\`\`

3. Set up the webhook (for production):
   \`\`\`
   npm run telegram:webhook
   \`\`\`

4. Or start the bot in polling mode (for development):
   \`\`\`
   npm run telegram:start
   \`\`\`

## Features

- User registration via Telegram
- Conversation history stored in Neon database
- AI-powered responses using OpenAI
- Usage tracking

## Commands

- `/start` - Start or restart the bot
- `/help` - Show help message
- `/status` - Check account status

## Development

- Run the Next.js development server:
  \`\`\`
  npm run dev
  \`\`\`

- Run the bot in polling mode:
  \`\`\`
  npm run telegram:start
  \`\`\`

## Deployment

1. Deploy to Vercel or your preferred hosting platform
2. Set up the webhook using `npm run telegram:webhook`
3. Make sure your environment variables are configured in your hosting platform
