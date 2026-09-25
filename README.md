# Crypto Market Tracker

Crypto Market Tracker is a Next.js application for monitoring cryptocurrency markets and managing a personal crypto portfolio.

## Prerequisites

Install the following before starting:

- Node.js 20.9 or later
- npm
- PostgreSQL
- A CoinGecko Demo API key

Check your Node.js and npm versions:

```bash
node --version
npm --version
```

## First-time setup

### 1. Clone the repository

```bash
git clone https://github.com/Kleponaeru/Crypto-Market-Tracker.git
cd Crypto-Market-Tracker
```

If you already cloned the project, just open a terminal in its folder.

### 2. Install dependencies

From the project directory, run:

```bash
npm install
```

### 3. Create a PostgreSQL database

Create a database named `crypto_tracker` using PostgreSQL, pgAdmin, or the PostgreSQL command line:

```bash
createdb crypto_tracker
```

If your PostgreSQL username, password, host, or port differs from the example below, use your actual values in `DATABASE_URL`.

### 4. Add environment variables

Create a file named `.env` in the project root. Do not commit this file.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_tracker"
COINGECKO_API_KEY="your_coingecko_demo_api_key"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Get a CoinGecko Demo API key from the CoinGecko developer dashboard.

> Use `.env` rather than only `.env.local`: Prisma's configuration reads `DATABASE_URL` from `.env` when database commands run.

### 5. Set up Prisma

This repository currently contains the Prisma schema but no migration history, so use `db push` for the initial local setup:

```bash
npx prisma generate
npx prisma db push
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Common commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Start the production build
npx prisma studio # Open the Prisma database browser
```

## Troubleshooting

### `Missing required environment variable: DATABASE_URL`

Confirm that `.env` exists in the project root and contains a valid `DATABASE_URL`. Then run the Prisma command again.

### Cannot connect to PostgreSQL

Confirm that PostgreSQL is running, the database exists, and the username, password, host, port, and database name in `DATABASE_URL` are correct.

### Market data is unavailable

Confirm that `COINGECKO_API_KEY` contains a valid CoinGecko Demo API key. CoinGecko may also rate-limit requests.

## Project structure

```text
src/app/             # Next.js App Router pages and API routes
src/components/      # Reusable UI components
src/lib/             # Shared utilities and Prisma client
prisma/schema.prisma # Database schema
types/               # TypeScript type declarations
```

## License

This project is licensed under the MIT License.
