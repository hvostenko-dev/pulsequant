import TradingViewWidget from '@/components/TradingViewWidget';
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';
import { getEnrichedStockQuote, getNews } from '@/lib/actions/finnhub.actions';
import { getCurrentUserWatchlistSymbols } from '@/lib/actions/watchlist.actions';
import StockTerminalActions from '@/components/StockTerminalActions';
import { ArrowUpRight, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

export async function generateMetadata({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const cleanSym = symbol.toUpperCase();
    return {
        title: `${cleanSym} Real-Time Terminal & AI Analytics`,
        description: `Institutional stock charts, technical indicators, financial metrics, and AI equity research for ${cleanSym}.`,
    };
}

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();
    const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';

    const [quote, watchlistSymbols, news] = await Promise.all([
        getEnrichedStockQuote(symbol),
        getCurrentUserWatchlistSymbols(),
        getNews([symbol]),
    ]);

    const isInWatchlist = watchlistSymbols.includes(symbol);
    const isUp = quote.change >= 0;

    // 52W progress calculation
    const rangeSpan = Math.max(quote.high52W - quote.low52W, 1);
    const rangePercent = Math.min(Math.max(((quote.price - quote.low52W) / rangeSpan) * 100, 0), 100);

    return (
        <div className="space-y-6 pb-12">
            {/* Stock Header & Live Metrics Card */}
            <section className="glass aurora-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <h1 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                                {symbol}
                            </h1>
                            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono font-semibold text-gray-400">
                                {quote.exchange}
                            </span>
                            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                {quote.sector}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400 sm:text-base font-medium">
                            {quote.name} • {quote.industry}
                        </p>

                        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                                ${quote.price.toFixed(2)}
                            </span>
                            <span
                                className={`inline-flex items-center font-mono text-sm sm:text-base font-bold ${
                                    isUp ? 'text-emerald-400' : 'text-red-400'
                                }`}
                            >
                                {isUp ? (
                                    <TrendingUp className="mr-1 h-4 w-4" />
                                ) : (
                                    <TrendingDown className="mr-1 h-4 w-4" />
                                )}
                                {isUp ? '+' : ''}${quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons (Watchlist, Alert, Paper Trade, Gemini AI) */}
                    <StockTerminalActions
                        symbol={symbol}
                        company={quote.name}
                        price={quote.price}
                        isInWatchlist={isInWatchlist}
                    />
                </div>

                {/* Key Fundamental Ratios Strip */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-5 text-xs font-mono">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">Market Cap</span>
                        <span className="text-sm font-bold text-white">${quote.marketCapBillions}B</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">P/E Ratio</span>
                        <span className="text-sm font-bold text-white">{quote.peRatio}x</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">Beta (Volatility)</span>
                        <span className="text-sm font-bold text-white">{quote.beta}</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">EPS (TTM)</span>
                        <span className="text-sm font-bold text-white">${quote.eps}</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">Quant Rating</span>
                        <span className="text-sm font-bold text-yellow-300">{quote.signal} ({quote.quantScore})</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                        <span className="text-gray-500 block uppercase text-[10px]">52-Week Position</span>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span>${quote.low52W.toFixed(0)}</span>
                            <span className="text-white font-bold">{rangePercent.toFixed(0)}%</span>
                            <span>${quote.high52W.toFixed(0)}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-400"
                                style={{ width: `${rangePercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* TradingView Advanced Terminal Grid */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left 2 Cols: Main Candlestick Chart + Baseline Chart */}
                <div className="xl:col-span-2 space-y-6">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                        height={170}
                    />

                    <TradingViewWidget
                        title="Interactive Candlestick Chart & Studies"
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                        className="custom-chart"
                        height={540}
                    />

                    <TradingViewWidget
                        title="Baseline Relative Performance"
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={BASELINE_WIDGET_CONFIG(symbol)}
                        className="custom-chart"
                        height={480}
                    />
                </div>

                {/* Right Col: Technical Analysis Gauge, Company Profile & Financials */}
                <div className="xl:col-span-1 space-y-6">
                    <TradingViewWidget
                        title="Technical Oscillator Gauge"
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                        height={400}
                    />

                    <TradingViewWidget
                        title="Company Profile"
                        scriptUrl={`${scriptUrl}company-profile.js`}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                        height={420}
                    />

                    <TradingViewWidget
                        title="Financial Statement Highlights"
                        scriptUrl={`${scriptUrl}financials.js`}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                        height={464}
                    />
                </div>
            </section>

            {/* Symbol-Specific News Catalyst Feed */}
            {news.length > 0 && (
                <section className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-yellow-400" />
                        <h2 className="text-xl font-bold text-white">{symbol} Catalyst & Headline Feed</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {news.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-yellow-400/30 hover:bg-black/60"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 uppercase">
                                            {item.related || symbol}
                                        </span>
                                        <span className="text-[11px]">{item.source}</span>
                                    </div>
                                    <h3 className="mt-2 text-sm font-bold text-gray-100 group-hover:text-yellow-300 transition-colors line-clamp-2">
                                        {item.headline}
                                    </h3>
                                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-3 leading-relaxed">
                                        {item.summary}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-yellow-400 group-hover:underline">
                                    Read Full Story <ArrowUpRight className="h-3 w-3" />
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
