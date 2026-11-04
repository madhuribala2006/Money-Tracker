# Money Management System

A personal finance dashboard built as a full-stack portfolio project. It brings transaction tracking, budgets, bills, savings goals, and spending insights into one responsive interface.

## What it demonstrates

- A React + TypeScript single-page application with shared application state.
- Lazy-loaded feature pages to keep the initial bundle focused on the dashboard.
- An Express REST API with JWT-based authentication and protected endpoints.
- MongoDB persistence through Mongoose, with a local JSON-file fallback for quick demos.
- Financial summaries, transaction filtering, CSV exports, and spending alerts.
- Responsive layouts, dark mode, and an optional AI advisor integration.

## Features

- Dashboard with balance, income, expense, and daily spending summaries.
- Pocket-money tracker with monthly and yearly totals, a month-by-month view, and savings-plan progress.
- Searchable and filterable transaction history with CSV export.
- Category and budget management, including threshold indicators.
- Savings goals, recurring monthly bills that become due again each month, payment method tracking, subscriptions, education expenses, and wishlist tracking.
- Browser bill reminders when the app is open and browser notifications are allowed.
- Analytics, monthly reports, notifications, and an optional Gemini-powered AI advisor.
- Individual account registration, currency preferences, and account-scoped financial data.
- Persistent local data when MongoDB is not configured.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide  
**Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB, JSON Web Tokens  
**Optional integration:** Google Gemini API

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:5000](http://localhost:5000). Sign in with the demo account or create a personal account. Each account has its own profile, categories, and financial records.

| Email | Password |
|---|---|
| `123@gmsil.com` | `1234` |

The demo login also accepts the original seeded address, `123@gmail.com`. New account passwords must be at least 8 characters; the short demo password is only for the pre-seeded demo account.

MongoDB is optional. Without a working `MONGODB_URI`, the server uses `.finora_store.json` in the project root. That local file is ignored by Git.

## Environment

Copy `.env.example` to `.env` to configure the app:

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port; defaults to `5000` |
| `MONGODB_URI` | MongoDB connection string; omit for local JSON storage |
| `JWT_SECRET` | Secret used to sign login tokens; set a unique random value outside local demos |
| `GEMINI_API_KEY` | Optional key for the AI advisor |
| `APP_URL` | Public app URL for deployment configuration |

The demo credentials and fallback JWT secret are for local/portfolio demonstrations only. Do not use this configuration for real financial or personal data. Passwords are hashed; financial records are associated with the authenticated account.

This project does not connect to real bank accounts or collect bank passwords, PINs, or one-time codes. Live bank syncing needs a supported, consent-based open-banking provider for the account holder's country and a production-secure authorization setup.

## Project layout

```text
backend/
  server.ts                 Express server and Vite development middleware
  server/
    middleware/              JWT authentication
    models/                  Mongoose schemas
    routes/                  REST API and AI advisor endpoints
    db.ts                    MongoDB connection and status
    storage.ts               MongoDB and local-file persistence
frontend/
  src/
    components/              Shared layout, chat, and auth UI
    context/                  Shared app state and data operations
    pages/                    Dashboard and finance features
    services/api.ts           Typed frontend API client
tests/                        Authentication middleware tests
```

## API and verification

The API is mounted at `/api`; `GET /api/health` reports server and database status. Protected financial endpoints require a bearer token from `POST /api/auth/login`.

```bash
npm test       # Authentication middleware tests
npm run lint   # TypeScript checks
npm run build  # Production frontend build
npm run check  # Run all three checks
```

## Deploy a public demo

This repository includes a Render Blueprint. Push `render.yaml` to GitHub, then open the [Render Blueprint setup](https://dashboard.render.com/blueprints/new?repo=https%3A%2F%2Fgithub.com%2Fmadhuribala2006%2FMoney-Tracker) and create the service. Render will build the app and provide its public URL when deployment succeeds.

The generated `JWT_SECRET` is configured automatically. For data that survives restarts and redeployments, add a MongoDB Atlas connection string as the `MONGODB_URI` environment variable in Render. Without it, the app uses local file storage, which is not durable on Render's free service. Use demo data only; do not enter real financial information.

## Production build

```bash
npm run build
```

In PowerShell, run the Express server in production mode with:

```powershell
$env:NODE_ENV = "production"
npm start
```

## Interview walkthrough

1. Start at the dashboard and explain how the frontend gets data through the typed API client.
2. Show a transaction create/edit flow and how the context refreshes analytics and budgets.
3. Explain the storage adapter's MongoDB and local JSON paths, including how each account's records are scoped.
4. Walk through signup, password hashing, JWT authentication, protected endpoints, and why the demo credentials are not production credentials.
5. Discuss next steps: stronger production security, automated API tests, and deployment secrets.
