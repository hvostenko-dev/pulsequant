# PulseQuant — Institutional AI Market Intelligence & Portfolio Terminal

![PulseQuant Terminal](public/assets/images/dashboard-preview.png)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TradingView](https://img.shields.io/badge/TradingView-Advanced_Charts-131722?logo=tradingview)](https://www.tradingview.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Inngest](https://img.shields.io/badge/Inngest-Event--Driven_Workflows-000000)](https://www.inngest.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-v1.6-purple)](https://www.better-auth.com/)

**PulseQuant** is a full-stack, institutional-grade equity analytics platform, paper-trading portfolio simulator, and AI research terminal designed for modern quantitative traders and retail investors. 

Built on **Next.js 16 (App Router, Server Actions)**, **React 19**, **MongoDB**, **Google Gemini AI**, **Finnhub REST API**, **TradingView Widgets**, and **Inngest event workflows**.

---

## ⚡ Key Architectural Pillars

### 1. 📈 Real-Time Multi-Asset Market Terminal (`/` & `/stocks/[symbol]`)
- **Live Ticker Tape & Quotes**: Continuous multi-asset streaming ticker tape powered by TradingView.
- **Microstructure Charts**: Candlestick charts with technical studies, volume indicators, baseline relative return curves, and technical oscillator gauges.
- **Institutional Valuation Metrics**: Real-time Finnhub quote data, 52-week position percentile progress bar, market cap, P/E ratio, beta, dividend yield, and EPS.
- **Company News & Catalysts**: Real-time company headline wire categorized by ticker.

### 2. 💼 Portfolio & Paper-Trading Simulator (`/portfolio`)
- **Mark-to-Market Real-Time P&L**: Tracks shares, cost basis, current market value, total unrealized gain/loss ($ and %), and daily return across all positions.
- **Sector Concentration Analytics**: Visual sector weight distribution (Technology, Financials, Consumer, Energy) to evaluate portfolio diversification and risk exposure.
- **Mathematical Position Sizer (Half-Kelly Criterion)**: Integrated capital allocation calculator optimizing bet sizes based on win-rate probability and risk/reward ratio to prevent drawdown ruin.
- **1-Click Institutional Demo Seeding**: Instant sandbox population with top mega-cap equities for rapid live demonstration.

### 3. 🔍 Multi-Factor Quant Screener & Asset Compare (`/screener`)
- **Quant Factor Scoring Engine**: Algorithmic scoring (0–100) analyzing price momentum, valuation multiple discount, and 52-week trend position to output actionable signals (`STRONG BUY`, `BUY`, `HOLD`, `VOLATILE`).
- **Dynamic Multi-Asset Compare Matrix**: Side-by-side comparative inspection of up to 4 assets across market cap, P/E, beta, 52-week range, and quant confidence.
- **Instant Search & Sector Filtering**: Fast sub-millisecond filtering across S&P 500 and Nasdaq constituents.

### 4. 🤖 Gemini AI Equity Research Desk (`/stocks/[symbol]` & `/screener`)
- **Automated Equity Reports**: On-demand institutional research generation synthesizing real-time quotes, valuation metrics, and news catalysts via **Google Gemini (`gemini-2.5-flash-lite`)**.
- **Structured Synthesis Output**: 
  - Executive Quantitative Summary
  - 12-Month Target Price & Implied Upside %
  - Bull Thesis & Secular Catalysts
  - Bear Case & Downside Tail Risks
  - Institutional Support & Resistance Levels

### 5. 🔔 Smart Price & Volatility Alerts (`/alerts`)
- **Custom Price Thresholds**: Real-time breakout targets (`upper`) and dip-buying floors (`lower`).
- **Dynamic Target Proximity**: Live calculation of dollar and percentage distance from active market ticks to alert threshold.
- **Stateful Management**: Toggle active/paused states or delete alerts directly in MongoDB.

### 6. ⚙️ Event-Driven Background Workflows (Inngest + Nodemailer)
- **AI-Powered Investor Onboarding (`app/user.created`)**: Generates tailored welcome analysis based on investor goals, risk tolerance, and preferred sector.
- **Automated Market Digest (`0 12 * * *`)**: Daily cron job fetching watchlist news, synthesizing key market drivers via Gemini AI, and delivering dark-mode HTML email digests.

---

## 🏗️ Technical Architecture

```text
                                  ┌────────────────────────┐
                                  │   Next.js 16 Client    │
                                  │   (React 19, Tailwind) │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
         ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
         │   TradingView      │    │  Next.js Server    │    │  Better Auth       │
         │   Embed Widgets    │    │  Actions & Cache   │    │  Session Layer     │
         └────────────────────┘    └──────────┬─────────┘    └────────────────────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   │                          │                          │
                   ▼                          ▼                          ▼
        ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
        │   Finnhub API      │     │  Google Gemini AI  │     │   MongoDB /        │
        │   Quotes & News    │     │  Equity Research   │     │   Mongoose 9 ODM   │
        └────────────────────┘     └────────────────────┘     └────────────────────┘
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │  Inngest Workflows │
                                   │  & Cron Scheduler  │
                                   └────────────────────┘
```

---

## 📁 Repository Structure

```text
StockMarketSignalistApp/
├── app/
│   ├── (auth)/                   # Authentication routes (/sign-in, /sign-up)
│   ├── (root)/                   # Protected Terminal routes
│   │   ├── alerts/               # Smart Price Alerts Command Center
│   │   ├── portfolio/            # Paper-Trading Portfolio Simulator & Kelly Sizer
│   │   ├── screener/             # Multi-Factor Quant Screener & Compare Matrix
│   │   ├── stocks/[symbol]/      # Comprehensive Stock Terminal & Research Hub
│   │   ├── watchlist/            # Saved Equities Watchlist & News Wire
│   │   └── page.tsx              # Executive Market Terminal Dashboard
│   ├── api/inngest/route.ts      # Inngest webhook endpoint
│   ├── globals.css               # Tailored dark-mode theme & animations
│   └── layout.tsx                # Root layout & global metadata
├── components/
│   ├── forms/                    # Form components & Country Select
│   ├── ui/                       # shadcn/ui & Radix UI primitives
│   ├── AlertModal.tsx            # Price alert creation modal
│   ├── AlertsClient.tsx          # Alerts interactive management
│   ├── Header.tsx                # Glassmorphic header with live status
│   ├── MobileMenu.tsx            # Mobile slide-out drawer navigation
│   ├── NavItems.tsx              # Desktop & mobile navigation links
│   ├── PortfolioClient.tsx       # Portfolio simulator client state
│   ├── ScreenerClient.tsx        # Multi-factor screener & AI research
│   ├── SearchCommand.tsx         # Responsive ⌘K ticker command palette
│   ├── StockTerminalActions.tsx  # Quick action buttons for individual stocks
│   ├── TradingViewWidget.tsx     # Dynamic TradingView widget embed
│   ├── UserDropdown.tsx          # Account details & sign-out menu
│   └── WatchlistButton.tsx       # Optimistic watchlist star toggle
├── database/                     # Mongoose connection & schemas
│   ├── models/alert.model.ts     # Price alert MongoDB model
│   ├── models/portfolio.model.ts # Portfolio position MongoDB model
│   └── models/watchlist.model.ts # Watchlist MongoDB model
├── lib/
│   ├── actions/                  # Server Actions (Auth, AI, Finnhub, Portfolio, Alerts, Watchlist)
│   ├── better-auth/auth.ts       # Better Auth configuration
│   ├── constants.ts              # Institutional stock directory & widget configurations
│   ├── inngest/                  # Inngest client, functions & AI prompts
│   └── nodemailer/               # Transporter & responsive email templates
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `20.9.0` or higher
- **MongoDB**: Active connection URI (Atlas or Local)
- **Finnhub API Key**: Free tier from [finnhub.io](https://finnhub.io)
- **Google Gemini API Key**: Free tier from [aistudio.google.com](https://aistudio.google.com)

### 2. Installation

```bash
git clone https://github.com/ilyajavadeveloper/StockMarketSignalistApp.git
cd StockMarketSignalistApp
npm install
```

### 3. Environment Configuration

Create a `.env.local` file:

```env
# MongoDB Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pulsequant

# Better Auth Configuration
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

# Market Data (Finnhub API)
FINNHUB_API_KEY=your_finnhub_api_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Delivery (Optional for local testing)
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_gmail_app_password
```

### 4. Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Start the Inngest Dev Server for background jobs:

```bash
npx inngest-cli@latest dev
```

Navigate to `http://localhost:3000`.

---

## 🛡️ License

MIT License. Designed and engineered as a modern flagship financial engineering project.
