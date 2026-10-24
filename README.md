# Signalist — AI-Powered Stock Market Tracker & Watchlist Platform

Full-stack stock market analytics platform, personalized watchlist manager, and automated AI market briefing system built with **Next.js 16**, **React 19**, **TypeScript**, **MongoDB**, **Better Auth**, **Inngest**, **Google Gemini AI**, **Finnhub API**, and **TradingView Widgets**.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Inngest](https://img.shields.io/badge/Inngest-Workflows-black)](https://www.inngest.com/)

---

## ✨ Features

- **Real-Time Stock Dashboards & Charts:** Embedded **TradingView** widgets for market overview, heatmaps, technical analysis, company fundamentals, and interactive charts (`/stocks/[symbol]`).
- **Command-Palette Ticker Search (`⌘K`):** Fast global stock symbol lookup powered by **Finnhub API** and `cmdk`.
- **Personalized Watchlist (`/watchlist`):** Save and manage favorite stock symbols persisted in **MongoDB** with instant optimistic UI feedback.
- **Investor Onboarding & Authentication:** Secure email/password authentication via **Better Auth** capturing investor profile metadata (country, investment goals, risk tolerance, preferred industry).
- **Event-Driven AI Workflows (Inngest + Google Gemini):**
  - **Personalized Welcome Emails:** Triggered on `app/user.created` — uses **Gemini (`gemini-2.5-flash-lite`)** to craft a tailored welcome introduction based on the user's investment profile.
  - **Automated Daily Market Briefings:** Scheduled cron workflow (`0 12 * * *`) that fetches watchlist news from Finnhub, summarizes key market movers per user with **Gemini AI**, and delivers HTML email digests via **Nodemailer**.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, Server Actions), React 19, TypeScript 5 |
| **Database & ODM** | MongoDB (`mongodb`), Mongoose v9 (`mongoose`) |
| **Authentication** | Better Auth (`better-auth`, `@better-auth/infra`) |
| **Background Jobs & AI** | Inngest (`inngest`), Google Gemini AI (`gemini-2.5-flash-lite`) |
| **Market Data & Charts** | Finnhub Stock API, TradingView Widgets |
| **Email Delivery** | Nodemailer (`nodemailer`) with custom HTML templates |
| **UI & Forms** | Tailwind CSS v4, shadcn/ui, Radix UI, React Hook Form, CMDK, Sonner |

---

## 📁 Project Structure

```text
StockMarketSignalistApp/
├── app/
│   ├── (auth)/                   # Authentication routes (/sign-in, /sign-up)
│   ├── (root)/                   # Protected application routes
│   │   ├── stocks/[symbol]/      # Individual stock terminal & TradingView widgets
│   │   ├── watchlist/            # User's saved stock watchlist & news
│   │   └── page.tsx              # Main market overview dashboard
│   └── api/inngest/route.ts      # Inngest webhook endpoint for background & cron jobs
├── components/
│   ├── forms/                    # Reusable React Hook Form fields & country selector
│   ├── ui/                       # shadcn/ui & Radix UI primitives
│   ├── Header.tsx                # App header with navigation, search & user menu
│   ├── SearchCommand.tsx         # CMDK stock search modal
│   ├── TradingViewWidget.tsx     # Dynamic TradingView embed component
│   └── WatchlistButton.tsx       # Add/remove stock from watchlist trigger
├── database/                     # Mongoose connection & database models
├── lib/
│   ├── actions/                  # Server Actions (Auth, Finnhub, User, Watchlist)
│   ├── better-auth/auth.ts       # Better Auth configuration with MongoDB adapter
│   ├── inngest/                  # Inngest client, AI prompts & workflow functions
│   └── nodemailer/               # Email transporter & HTML email templates
└── scripts/test-db.mjs           # Database connectivity verification script
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ilyajavadeveloper/StockMarketSignalistApp.git
cd StockMarketSignalistApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/signalist

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Market Data (Finnhub)
FINNHUB_API_KEY=your_finnhub_api_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# AI & Workflows (Inngest / Gemini)
GEMINI_API_KEY=your_google_gemini_api_key

# Email Delivery (Nodemailer / Gmail SMTP)
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_gmail_app_password
```

### 4. Run the development server & Inngest Dev Server

Start the Next.js app:

```bash
npm run dev
```

In a second terminal, start the Inngest Dev Server to test background jobs and AI email workflows locally:

```bash
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Start Next.js development server
- `npm run build` — Build application for production
- `npm run start` — Run production server
- `npm run lint` — Run ESLint checks
- `npm run test:db` — Test MongoDB connection (`node scripts/test-db.mjs`)
