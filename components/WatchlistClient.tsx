'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Star,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    LayoutGrid,
    Table as TableIcon,
    Bell,
    Building2,
    CalendarDays,
    BarChart3,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import WatchlistButton from '@/components/WatchlistButton';
import AlertModal from '@/components/AlertModal';
import { WatchlistRecord } from '@/lib/actions/watchlist.actions';

interface WatchlistClientProps {
    stocks: WatchlistRecord[];
    quotesMap: Record<string, EnrichedStockQuote>;
    news: MarketNewsArticle[];
}

export default function WatchlistClient({ stocks, quotesMap, news }: WatchlistClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [filterQuery, setFilterQuery] = useState('');

    const enriched = stocks.map((item) => {
        const q = quotesMap[item.symbol];
        return {
            ...item,
            quote: q,
            price: q?.price ?? 150.0,
            change: q?.change ?? 0,
            changePercent: q?.changePercent ?? 0,
            marketCap: q?.marketCapBillions ? `$${q.marketCapBillions}B` : '—',
            peRatio: q?.peRatio ? `${q.peRatio}x` : '—',
            quantScore: q?.quantScore ?? 70,
            signal: q?.signal ?? 'BUY',
        };
    });

    const filtered = enriched.filter(
        (s) =>
            s.symbol.toLowerCase().includes(filterQuery.toLowerCase()) ||
            s.company.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const averagePerformance =
        enriched.length > 0
            ? enriched.reduce((acc, curr) => acc + curr.changePercent, 0) / enriched.length
            : 0;

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-[120px]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                            <Star className="h-3.5 w-3.5" />
                            Personal Equity Watchlist
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Institutional Stock
                            <span className="block bg-gradient-to-r from-amber-200 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
                                Watchlist & Signals.
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-gray-400 max-w-xl">
                            Track your high-conviction companies with live quote data, valuation multiples, and automated threshold alerts.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/screener"
                            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-300"
                        >
                            <Search className="h-4 w-4" />
                            Discover Stocks in Screener
                        </Link>
                    </div>
                </div>

                {/* KPI Strip */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Tracked</p>
                        <p className="mt-2 text-3xl font-black text-white font-mono">{stocks.length}</p>
                        <p className="mt-1 text-xs text-gray-500">Companies saved to database</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Average 24h Return</p>
                        <p
                            className={`mt-2 text-3xl font-black font-mono ${
                                averagePerformance >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                        >
                            {averagePerformance >= 0 ? '+' : ''}{averagePerformance.toFixed(2)}%
                        </p>
                        <p className="mt-1 text-xs text-gray-500">Across all saved positions</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Market Feed</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-2xl font-bold text-white">Streaming Live</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Real-time Finnhub quote updates</p>
                    </div>
                </div>
            </section>

            {/* Filter & View Switcher Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search watchlist..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto rounded-lg border border-white/10 bg-black/40 p-1">
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition ${
                            viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <TableIcon className="h-3.5 w-3.5" />
                        Table
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition ${
                            viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Grid
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {stocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
                    <Star className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-lg font-bold text-white">Your watchlist is empty</h3>
                    <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
                        Search any stock symbol (or press ⌘K) and tap the star to add companies to your personal tracker.
                    </p>
                    <Link
                        href="/"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
                    >
                        <Search className="h-4 w-4" />
                        Explore Top Equities
                    </Link>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="p-4 font-sans">Symbol / Company</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">24h Change</th>
                                <th className="p-4">Market Cap</th>
                                <th className="p-4">P/E Ratio</th>
                                <th className="p-4">Quant Rating</th>
                                <th className="p-4 text-right font-sans">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((stock) => {
                                const isUp = stock.change >= 0;
                                return (
                                    <tr key={stock.symbol} className="transition hover:bg-white/[0.03]">
                                        <td className="p-4 font-sans">
                                            <Link
                                                href={`/stocks/${stock.symbol}`}
                                                className="group inline-flex items-center gap-1.5 font-mono font-bold text-white hover:text-yellow-300"
                                            >
                                                {stock.symbol}
                                                <ArrowUpRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-yellow-300 transition-colors" />
                                            </Link>
                                            <p className="truncate text-xs text-gray-400 max-w-[160px] font-sans">
                                                {stock.company}
                                            </p>
                                        </td>
                                        <td className="p-4 text-white font-bold">${stock.price.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center font-bold ${
                                                    isUp ? 'text-emerald-400' : 'text-red-400'
                                                }`}
                                            >
                                                {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300">{stock.marketCap}</td>
                                        <td className="p-4 text-gray-300">{stock.peRatio}</td>
                                        <td className="p-4">
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                                    stock.signal === 'STRONG BUY'
                                                        ? 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                                                        : stock.signal === 'BUY'
                                                        ? 'border border-teal-400/30 bg-teal-500/15 text-teal-300'
                                                        : 'border border-yellow-400/30 bg-yellow-500/15 text-yellow-300'
                                                }`}
                                            >
                                                {stock.signal} ({stock.quantScore})
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-sans">
                                            <div className="flex items-center justify-end gap-2">
                                                <AlertModal
                                                    symbol={stock.symbol}
                                                    company={stock.company}
                                                    currentPrice={stock.price}
                                                    trigger={
                                                        <button
                                                            type="button"
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                                                            title="Set Alert"
                                                        >
                                                            <Bell className="h-4 w-4" />
                                                        </button>
                                                    }
                                                />
                                                <WatchlistButton
                                                    symbol={stock.symbol}
                                                    company={stock.company}
                                                    isInWatchlist
                                                    showTrashIcon
                                                    type="icon"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Grid View */
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((stock) => {
                        const isUp = stock.change >= 0;
                        return (
                            <div
                                key={stock.symbol}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:border-yellow-400/30 hover:bg-black/60"
                            >
                                <div className="flex items-start justify-between">
                                    <Link href={`/stocks/${stock.symbol}`} className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                                                {stock.symbol}
                                            </span>
                                            <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover:text-yellow-300" />
                                        </div>
                                        <p className="truncate text-xs text-gray-400 max-w-[180px]">
                                            {stock.company}
                                        </p>
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        <AlertModal
                                            symbol={stock.symbol}
                                            company={stock.company}
                                            currentPrice={stock.price}
                                            trigger={
                                                <button
                                                    type="button"
                                                    className="rounded-lg p-1 text-gray-400 hover:text-yellow-300"
                                                    title="Set Alert"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                </button>
                                            }
                                        />
                                        <WatchlistButton
                                            symbol={stock.symbol}
                                            company={stock.company}
                                            isInWatchlist
                                            showTrashIcon
                                            type="icon"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-baseline justify-between border-t border-white/5 pt-3">
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-500">Live Price</span>
                                        <p className="font-mono text-xl font-bold text-white">
                                            ${stock.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase text-gray-500">24h Change</span>
                                        <p
                                            className={`font-mono text-base font-bold ${
                                                isUp ? 'text-emerald-400' : 'text-red-400'
                                            }`}
                                        >
                                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.02] p-2 text-[11px] font-mono text-gray-400">
                                    <div>MCap: <span className="text-gray-200">{stock.marketCap}</span></div>
                                    <div>P/E: <span className="text-gray-200">{stock.peRatio}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Watchlist News Section */}
            {news.length > 0 && (
                <section className="pt-6 border-t border-white/10 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Watchlist Market Wire</h2>
                        <p className="text-xs text-gray-400">Real-time news catalysts for your tracked companies</p>
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
                                            {item.related || 'Market'}
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
