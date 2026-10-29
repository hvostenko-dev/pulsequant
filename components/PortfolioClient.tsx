'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    Briefcase,
    Plus,
    Trash2,
    Sparkles,
    ArrowUpRight,
    PieChart,
    Calculator,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    upsertPortfolioPosition,
    removePortfolioPosition,
    seedDemoPortfolio,
} from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';

interface PortfolioClientProps {
    positions: PortfolioPositionRecord[];
    quotes: Record<string, EnrichedStockQuote>;
}

export default function PortfolioClient({ positions, quotes }: PortfolioClientProps) {
    const [isPending, startTransition] = useTransition();
    const [openAddModal, setOpenAddModal] = useState(false);
    const [symbolInput, setSymbolInput] = useState('');
    const [sharesInput, setSharesInput] = useState('');
    const [priceInput, setPriceInput] = useState('');
    const [notesInput, setNotesInput] = useState('');

    // Kelly / Position Sizer state
    const [portfolioCapital, setPortfolioCapital] = useState('50000');
    const [winRate, setWinRate] = useState('55');
    const [riskReward, setRiskReward] = useState('2.0');

    // Portfolio metrics computation
    let totalCostBasis = 0;
    let totalCurrentValue = 0;
    let totalDayChange = 0;

    const enrichedHoldings = positions.map((pos) => {
        const q = quotes[pos.symbol];
        const currentPrice = q?.price ?? pos.avgBuyPrice;
        const value = currentPrice * pos.shares;
        const cost = pos.avgBuyPrice * pos.shares;
        const pnl = value - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
        const dayChange = (q?.change ?? 0) * pos.shares;

        totalCostBasis += cost;
        totalCurrentValue += value;
        totalDayChange += dayChange;

        return {
            ...pos,
            currentPrice,
            value,
            cost,
            pnl,
            pnlPercent,
            dayChange,
            quote: q,
        };
    });

    const totalPnl = totalCurrentValue - totalCostBasis;
    const totalPnlPercent = totalCostBasis > 0 ? (totalPnl / totalCostBasis) * 100 : 0;
    const totalDayChangePercent = totalCurrentValue > 0 ? (totalDayChange / totalCurrentValue) * 100 : 0;

    // Sector breakdown
    const sectorTotals: Record<string, number> = {};
    enrichedHoldings.forEach((h) => {
        const s = h.sector || 'Technology';
        sectorTotals[s] = (sectorTotals[s] || 0) + h.value;
    });

    const sectorBreakdown = Object.entries(sectorTotals).map(([sector, val]) => ({
        sector,
        value: val,
        percentage: totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0,
    }));

    // Handlers
    const handleAddPosition = (e: React.FormEvent) => {
        e.preventDefault();
        const sharesNum = parseFloat(sharesInput);
        const priceNum = parseFloat(priceInput);
        if (!symbolInput.trim() || !sharesNum || sharesNum <= 0 || !priceNum || priceNum <= 0) {
            toast.error('Please enter a valid symbol, positive shares and purchase price');
            return;
        }

        startTransition(async () => {
            try {
                await upsertPortfolioPosition({
                    symbol: symbolInput.trim().toUpperCase(),
                    shares: sharesNum,
                    avgBuyPrice: priceNum,
                    notes: notesInput.trim(),
                });
                toast.success(`Position ${symbolInput.toUpperCase()} saved`);
                setOpenAddModal(false);
                setSymbolInput('');
                setSharesInput('');
                setPriceInput('');
                setNotesInput('');
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to save position');
            }
        });
    };

    const handleRemove = (symbol: string) => {
        startTransition(async () => {
            try {
                await removePortfolioPosition(symbol);
                toast.success(`Position ${symbol} removed`);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to remove position');
            }
        });
    };

    const handleSeedDemo = () => {
        startTransition(async () => {
            try {
                const res = await seedDemoPortfolio();
                toast.success(`Loaded ${res.count} institutional demo positions!`);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to seed demo portfolio');
            }
        });
    };

    // Kelly calculation: f* = (p(b+1) - 1) / b
    const p = parseFloat(winRate) / 100;
    const b = parseFloat(riskReward);
    const kellyFraction = b > 0 ? (p * (b + 1) - 1) / b : 0;
    const recommendedAllocation = Math.max(0, Math.min(kellyFraction * 0.5, 0.25)); // Half-Kelly bounded at 25%
    const recommendedDollar = parseFloat(portfolioCapital || '0') * recommendedAllocation;

    return (
        <div className="space-y-8">
            {/* Top KPI Summary Banner */}
            <section className="glass aurora-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                            <Briefcase className="h-3.5 w-3.5" />
                            Paper Trading & Quant Portfolio Simulator
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Institutional Portfolio
                            <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-yellow-300 bg-clip-text text-transparent">
                                Performance & Allocation.
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-gray-400 max-w-xl">
                            Simulate active equity allocations, analyze sector weight concentration, and track mark-to-market returns in real-time.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        {positions.length === 0 && (
                            <Button
                                onClick={handleSeedDemo}
                                disabled={isPending}
                                className="bg-emerald-400 font-bold text-black hover:bg-emerald-300"
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Load Demo Institutional Portfolio
                            </Button>
                        )}

                        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                            <DialogTrigger asChild>
                                <Button className="bg-yellow-400 font-bold text-black hover:bg-yellow-300">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Add Position
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-white/10 bg-[#12141A] text-gray-200 sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-white">
                                        Add Portfolio Position
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-400">
                                        Record a stock purchase to track real-time returns and risk concentration.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddPosition} className="mt-4 space-y-4">
                                    <div>
                                        <Label htmlFor="sym" className="text-xs uppercase tracking-wider text-gray-400">Ticker Symbol</Label>
                                        <Input
                                            id="sym"
                                            placeholder="e.g. NVDA, AAPL, MSFT"
                                            value={symbolInput}
                                            onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                                            className="mt-1.5 h-11 border-white/10 bg-white/[0.05] font-mono text-base uppercase text-white placeholder:text-gray-500 focus:border-yellow-400"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="shares" className="text-xs uppercase tracking-wider text-gray-400">Shares</Label>
                                            <Input
                                                id="shares"
                                                type="number"
                                                step="any"
                                                min="0.0001"
                                                placeholder="e.g. 50"
                                                value={sharesInput}
                                                onChange={(e) => setSharesInput(e.target.value)}
                                                className="mt-1.5 h-11 border-white/10 bg-white/[0.05] font-mono text-base text-white placeholder:text-gray-500 focus:border-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="price" className="text-xs uppercase tracking-wider text-gray-400">Avg Cost Basis ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="e.g. 132.50"
                                                value={priceInput}
                                                onChange={(e) => setPriceInput(e.target.value)}
                                                className="mt-1.5 h-11 border-white/10 bg-white/[0.05] font-mono text-base text-white placeholder:text-gray-500 focus:border-yellow-400"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-gray-400">Strategy Note</Label>
                                        <Input
                                            id="notes"
                                            placeholder="e.g. Core AI compute catalyst, Q4 earnings run"
                                            value={notesInput}
                                            onChange={(e) => setNotesInput(e.target.value)}
                                            className="mt-1.5 h-10 border-white/10 bg-white/[0.05] text-sm text-white placeholder:text-gray-500 focus:border-yellow-400"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="ghost" onClick={() => setOpenAddModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isPending} className="bg-yellow-400 font-bold text-black hover:bg-yellow-300">
                                            {isPending ? 'Saving...' : 'Save Holding'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* KPI Cards Strip */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Portfolio Value</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono truncate">
                            ${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                            Cost Basis: ${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Unrealized P&L</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <p className={`text-2xl sm:text-3xl font-black font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className={`text-xs sm:text-sm font-bold font-mono ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">All-time position returns</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Today&apos;s Return</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <p className={`text-2xl sm:text-3xl font-black font-mono ${totalDayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {totalDayChange >= 0 ? '+' : ''}${totalDayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className={`text-xs sm:text-sm font-bold font-mono ${totalDayChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ({totalDayChangePercent >= 0 ? '+' : ''}{totalDayChangePercent.toFixed(2)}%)
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Active session intraday movement</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Holdings Count</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
                            {positions.length} <span className="text-base font-normal text-gray-400">stocks</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Across {sectorBreakdown.length} industry sectors
                        </p>
                    </div>
                </div>
            </section>

            {/* Holdings Table & Sector Allocation */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Holdings List (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Active Positions</h2>
                            <p className="text-xs text-gray-400">Real-time mark-to-market prices via Finnhub API</p>
                        </div>
                        {positions.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSeedDemo}
                                disabled={isPending}
                                className="border-white/10 bg-white/[0.03] text-xs text-gray-400 hover:text-white"
                            >
                                Reset Demo
                            </Button>
                        )}
                    </div>

                    {enrichedHoldings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
                            <Briefcase className="mx-auto h-12 w-12 text-gray-600" />
                            <h3 className="mt-4 text-lg font-bold text-white">No active holdings recorded</h3>
                            <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
                                Start tracking paper positions or click the button below to load an institutional demo portfolio.
                            </p>
                            <Button
                                onClick={handleSeedDemo}
                                disabled={isPending}
                                className="mt-5 bg-yellow-400 font-bold text-black hover:bg-yellow-300"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Load Demo Institutional Portfolio
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card List (< 768px) */}
                            <div className="grid gap-3 md:hidden">
                                {enrichedHoldings.map((h) => {
                                    const isPositive = h.pnl >= 0;
                                    return (
                                        <div
                                            key={h.symbol}
                                            className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/stocks/${h.symbol}`}
                                                        className="inline-flex items-center gap-1.5 font-mono text-base font-bold text-white hover:text-yellow-300"
                                                    >
                                                        {h.symbol}
                                                        <ArrowUpRight className="h-3.5 w-3.5 text-gray-500" />
                                                    </Link>
                                                    <p className="truncate text-xs text-gray-400">{h.company}</p>
                                                    {h.notes && (
                                                        <p className="mt-0.5 truncate text-[11px] italic text-gray-500">
                                                            {h.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(h.symbol)}
                                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                                                    title="Delete Position"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 font-mono text-xs">
                                                <div>
                                                    <span className="block text-[10px] uppercase text-gray-500 font-sans">Market Value</span>
                                                    <span className="text-sm font-bold text-white">
                                                        ${h.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] uppercase text-gray-500 font-sans">Unrealized P&L</span>
                                                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPositive ? '+' : ''}${h.pnl.toFixed(2)} ({isPositive ? '+' : ''}{h.pnlPercent.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase text-gray-500 font-sans">Shares / Avg Cost</span>
                                                    <span className="text-gray-300">
                                                        {h.shares} @ ${h.avgBuyPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] uppercase text-gray-500 font-sans">Live Price</span>
                                                    <span className="text-white font-semibold">${h.currentPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                                        <tr>
                                            <th className="p-4">Symbol / Company</th>
                                            <th className="p-4">Shares</th>
                                            <th className="p-4">Avg Cost</th>
                                            <th className="p-4">Market Price</th>
                                            <th className="p-4">Market Value</th>
                                            <th className="p-4">Unrealized P&L</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-mono">
                                        {enrichedHoldings.map((h) => {
                                            const isPositive = h.pnl >= 0;
                                            return (
                                                <tr key={h.symbol} className="transition hover:bg-white/[0.03]">
                                                    <td className="p-4 font-sans">
                                                        <Link
                                                            href={`/stocks/${h.symbol}`}
                                                            className="group inline-flex items-center gap-2 font-mono font-bold text-white hover:text-yellow-300"
                                                        >
                                                            {h.symbol}
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-yellow-300 transition-colors" />
                                                        </Link>
                                                        <p className="truncate text-xs text-gray-400 max-w-[160px] font-sans">
                                                            {h.company}
                                                        </p>
                                                        {h.notes && (
                                                            <p className="mt-0.5 text-[10px] text-gray-500 italic max-w-[160px] truncate font-sans">
                                                                {h.notes}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-gray-200">{h.shares}</td>
                                                    <td className="p-4 text-gray-400">${h.avgBuyPrice.toFixed(2)}</td>
                                                    <td className="p-4 text-white font-bold">${h.currentPrice.toFixed(2)}</td>
                                                    <td className="p-4 text-white font-bold">
                                                        ${h.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {isPositive ? '+' : ''}${h.pnl.toFixed(2)}
                                                        </div>
                                                        <div className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            ({isPositive ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(h.symbol)}
                                                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                                                            title="Delete Position"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Sector Allocation & Quant Position Sizer */}
                <div className="space-y-6">
                    {/* Sector Allocation Breakdown */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <div className="flex items-center gap-2 text-white font-bold text-base">
                            <PieChart className="h-4 w-4 text-yellow-400" />
                            Sector Allocation
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Asset concentration across sectors</p>

                        <div className="mt-5 space-y-3">
                            {sectorBreakdown.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No positions to calculate</p>
                            ) : (
                                sectorBreakdown.map((s) => (
                                    <div key={s.sector} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-gray-300">{s.sector}</span>
                                            <span className="font-mono font-bold text-white">
                                                {s.percentage.toFixed(1)}% (${s.value.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-400"
                                                style={{ width: `${Math.min(s.percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quant Position Sizer & Half-Kelly Calculator */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <div className="flex items-center gap-2 text-white font-bold text-base">
                            <Calculator className="h-4 w-4 text-emerald-400" />
                            Position Sizer (Half-Kelly)
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Mathematical sizing formula to maximize capital growth while preventing drawdown ruin.
                        </p>

                        <div className="mt-4 space-y-3 text-xs">
                            <div>
                                <Label className="text-[11px] text-gray-400">Total Available Capital ($)</Label>
                                <Input
                                    type="number"
                                    value={portfolioCapital}
                                    onChange={(e) => setPortfolioCapital(e.target.value)}
                                    className="mt-1 h-9 border-white/10 bg-white/[0.05] font-mono text-white text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[11px] text-gray-400">Win Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={winRate}
                                        onChange={(e) => setWinRate(e.target.value)}
                                        className="mt-1 h-9 border-white/10 bg-white/[0.05] font-mono text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[11px] text-gray-400">Risk/Reward (b)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={riskReward}
                                        onChange={(e) => setRiskReward(e.target.value)}
                                        className="mt-1 h-9 border-white/10 bg-white/[0.05] font-mono text-white text-xs"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Optimal Allocation:</span>
                                    <span className="font-mono text-sm font-bold text-emerald-300">
                                        {(recommendedAllocation * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-gray-300">Recommended Max Risk:</span>
                                    <span className="font-mono text-sm font-bold text-emerald-300">
                                        ${recommendedDollar.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
