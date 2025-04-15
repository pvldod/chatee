# Chatee.io

AI-powered chat agent platform that allows you to create support bots that talk like humans.

## Features

- Create AI chatbots trained on your documentation
- Customize appearance and behavior
- Multiple knowledge base sources (documents, websites, Q&A)
- Real-time chat interface
- Dashboard for managing chatbots
- Usage analytics and monitoring
- Secure and scalable

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- OpenAI
- Stripe
- Telegram Bot API

## Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your environment variables
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run database migrations:
   ```bash
   pnpm prisma migrate dev
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables from `.env.example`
4. Deploy

### Database

1. Create a PostgreSQL database (e.g. on Supabase)
2. Update `DATABASE_URL` in environment variables
3. Run migrations:
   ```bash
   pnpm prisma migrate deploy
   ```

## License

MIT
