import TradingViewWidget from '@/components/TradingViewWidget';
import Link from 'next/link';
import MarketStatusBar from '@/components/MarketStatusBar';
import MarketPulseGauge from '@/components/MarketPulseGauge';
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG,
    TICKER_TAPE_WIDGET_CONFIG,
} from '@/lib/constants';
import { getBatchEnrichedQuotes } from '@/lib/actions/finnhub.actions';
import { getCurrentUserWatchlistSymbols } from '@/lib/actions/watchlist.actions';
import {
    Activity,
    ArrowUpRight,
    Briefcase,
    Sparkles,
    Star,
    Bell,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

const FEATURED_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'META', 'TSLA'];

const Home = async () => {
    const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';
    const [quotes, watchlistSymbols] = await Promise.all([
        getBatchEnrichedQuotes(FEATURED_TICKERS),
        getCurrentUserWatchlistSymbols(),
    ]);

    const watchlistCount = watchlistSymbols.length;

    return (
        <div className="space-y-8 pb-12">
            {/* Real-time Ticker Tape Widget */}
            <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#101216]">
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}ticker-tape.js`}
                    config={TICKER_TAPE_WIDGET_CONFIG}
                    height={72}
                />
            </div>

            {/* Hero Command Bar */}
            <MarketStatusBar />
            <section className="animate-fade-up glass aurora-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-[120px]" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-[120px]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-300">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                            PulseQuant Multi-Asset Terminal
                        </div>

                        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Institutional Market Intelligence,
                            <span className="block bg-gradient-to-r from-cyan-200 via-violet-300 to-yellow-300 bg-clip-text text-transparent">
                                Quant Insights & Portfolio Alpha.
                            </span>
                        </h1>

                        <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-2xl">
                            Live market microstructure, automated Gemini AI equity research, real-time paper trading simulator, and personalized threshold alerts.
                        </p>
                    </div>

                    {/* Quick Access Action Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <Link
                            href="/portfolio"
                            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20"
                        >
                            <Briefcase className="h-4 w-4" />
                            Portfolio Simulator
                        </Link>

                        <Link
                            href="/screener"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/[0.1] hover:text-yellow-300"
                        >
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                            AI Equity Screener
                        </Link>

                        <Link
                            href="/watchlist"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/[0.1] hover:text-amber-300"
                        >
                            <Star className="h-4 w-4 text-amber-400" />
                            Watchlist ({watchlistCount})
                        </Link>
                    </div>
                </div>

                {/* Live Stock Ticker Cards Strip */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {quotes.map((stock) => {
                        const isUp = stock.change >= 0;
                        return (
                            <Link
                                key={stock.symbol}
                                href={`/stocks/${stock.symbol}`}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3.5 transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-black/60"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">
                                        {stock.symbol}
                                    </span>
                                    <span
                                        className={`inline-flex items-center font-mono text-xs font-semibold ${
                                            isUp ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                    >
                                        {isUp ? (
                                            <TrendingUp className="mr-0.5 h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="mr-0.5 h-3 w-3" />
                                        )}
                                        {isUp ? '+' : ''}
                                        {stock.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                                <p className="mt-1 font-mono text-base font-extrabold text-gray-100">
                                    ${stock.price.toFixed(2)}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                    {stock.name}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* TradingView Institutional Terminal Grid */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <MarketPulseGauge quotes={quotes} />
                <div className="glass aurora-border rounded-2xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Pro Tips</h3>
                    <ul className="mt-3 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
                        <li className="rounded-lg bg-white/[0.04] p-3">Press <kbd className="kbd">Ctrl</kbd> <kbd className="kbd">K</kbd> to search any symbol instantly.</li>
                        <li className="rounded-lg bg-white/[0.04] p-3">Use <kbd className="kbd">g</kbd> then <kbd className="kbd">p</kbd> to jump to your Portfolio.</li>
                        <li className="rounded-lg bg-white/[0.04] p-3">Run the Half-Kelly sizer in the simulator to size positions by edge.</li>
                        <li className="rounded-lg bg-white/[0.04] p-3">Press <kbd className="kbd">?</kbd> anywhere to view every shortcut.</li>
                    </ul>
                </div>
            </section>

            {/* TradingView Institutional Terminal Grid */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-1">
                    <TradingViewWidget
                        title="Market Structure & Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={560}
                    />
                </div>
                <div className="xl:col-span-2">
                    <TradingViewWidget
                        title="S&P 500 Sector Heatmap"
                        scriptUrl={`${scriptUrl}stock-heatmap.js`}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={560}
                    />
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-1">
                    <TradingViewWidget
                        title="Live Breaking Market Wire"
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={560}
                    />
                </div>
                <div className="xl:col-span-2">
                    <TradingViewWidget
                        title="Institutional Sector Quotes"
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={560}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;
