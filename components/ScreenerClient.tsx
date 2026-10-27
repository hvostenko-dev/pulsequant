'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    SlidersHorizontal,
    Bot,
    Loader2,
    ShieldCheck,
    Target,
    Layers,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { generateAIStockReport } from '@/lib/actions/ai.actions';
import { toast } from 'sonner';

interface ScreenerClientProps {
    initialQuotes: EnrichedStockQuote[];
}

export default function ScreenerClient({ initialQuotes }: ScreenerClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState<string>('All');
    const [minQuantScore, setMinQuantScore] = useState<number>(0);
    const [selectedSignal, setSelectedSignal] = useState<string>('All');

    // Compare mode
    const [compareSymbols, setCompareSymbols] = useState<string[]>(['NVDA', 'AAPL']);

    // AI Analysis Report Modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [activeReportSymbol, setActiveReportSymbol] = useState<string | null>(null);
    const [reportData, setReportData] = useState<AIStockAnalysisReport | null>(null);
    const [isGenerating, startGenerating] = useTransition();

    const sectors = ['All', ...Array.from(new Set(initialQuotes.map((q) => q.sector)))];

    const filtered = initialQuotes.filter((q) => {
        const matchesQuery =
            !searchQuery.trim() ||
            q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSector = selectedSector === 'All' || q.sector === selectedSector;
        const matchesScore = q.quantScore >= minQuantScore;
        const matchesSignal = selectedSignal === 'All' || q.signal === selectedSignal;

        return matchesQuery && matchesSector && matchesScore && matchesSignal;
    });

    const toggleCompare = (sym: string) => {
        if (compareSymbols.includes(sym)) {
            setCompareSymbols(compareSymbols.filter((s) => s !== sym));
        } else {
            if (compareSymbols.length >= 4) {
                toast.error('Compare matrix supports up to 4 assets concurrently');
                return;
            }
            setCompareSymbols([...compareSymbols, sym]);
        }
    };

    const handleGenerateAIReport = (sym: string) => {
        setActiveReportSymbol(sym);
        setReportModalOpen(true);
        startGenerating(async () => {
            try {
                const report = await generateAIStockReport(sym);
                setReportData(report);
            } catch {
                toast.error(`Failed to generate AI report for ${sym}`);
            }
        });
    };

    const compareQuotes = initialQuotes.filter((q) => compareSymbols.includes(q.symbol));

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="glass aurora-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />

                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        <Bot className="h-3.5 w-3.5" />
                        AI Equity Screener & Synthesis Terminal
                    </div>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Quantitative Screener &
                        <span className="block bg-gradient-to-r from-yellow-200 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                            Gemini AI Research Desk.
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400 max-w-2xl">
                        Filter equities across quantitative multi-factor signals, compare valuation multiples, and generate on-demand institutional research reports powered by Google Gemini.
                    </p>
                </div>

                {/* Filter Toolbar */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Filter ticker or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 border-white/10 bg-black/40 pl-9 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:border-yellow-400"
                        />
                    </div>

                    {/* Sector Filter */}
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="h-11 rounded-lg border border-white/10 bg-[#14161C] px-3 text-xs sm:text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
                    >
                        {sectors.map((s) => (
                            <option key={s} value={s}>
                                Sector: {s}
                            </option>
                        ))}
                    </select>

                    {/* Quant Signal */}
                    <select
                        value={selectedSignal}
                        onChange={(e) => setSelectedSignal(e.target.value)}
                        className="h-11 rounded-lg border border-white/10 bg-[#14161C] px-3 text-xs sm:text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
                    >
                        <option value="All">All Quant Signals</option>
                        <option value="STRONG BUY">Strong Buy (Score 80+)</option>
                        <option value="BUY">Buy (Score 65+)</option>
                        <option value="HOLD">Hold (Neutral)</option>
                        <option value="VOLATILE">High Volatility</option>
                    </select>

                    {/* Min Score Range */}
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs">
                        <span className="text-gray-400 shrink-0">Min Quant:</span>
                        <input
                            type="range"
                            min="0"
                            max="90"
                            step="5"
                            value={minQuantScore}
                            onChange={(e) => setMinQuantScore(Number(e.target.value))}
                            className="w-full accent-yellow-400 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-yellow-300 w-8 text-right">
                            {minQuantScore}+
                        </span>
                    </div>
                </div>
            </section>

            {/* Compare Matrix Strip (if items selected) */}
            {compareQuotes.length > 0 && (
                <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <Layers className="h-4 w-4 text-emerald-400" />
                            Multi-Asset Comparative Matrix ({compareQuotes.length}/4)
                        </div>
                        <button
                            type="button"
                            onClick={() => setCompareSymbols([])}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Clear Compare
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {compareQuotes.map((c) => (
                            <div key={c.symbol} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-white text-sm">{c.symbol}</span>
                                    <span className="font-mono text-emerald-400 font-bold">${c.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Market Cap:</span>
                                    <span className="font-mono text-gray-200">${c.marketCapBillions}B</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>P/E Ratio:</span>
                                    <span className="font-mono text-gray-200">{c.peRatio}x</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Beta:</span>
                                    <span className="font-mono text-gray-200">{c.beta}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Quant Score:</span>
                                    <span className="font-mono text-yellow-400 font-bold">{c.quantScore}/100</span>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleGenerateAIReport(c.symbol)}
                                    className="w-full mt-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 hover:bg-yellow-400/20 text-[11px] h-7"
                                >
                                    <Bot className="mr-1 h-3 w-3" />
                                    AI Report
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Screener Results Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400 font-mono">
                        <tr>
                            <th className="p-4 w-10">Comp</th>
                            <th className="p-4">Asset / Sector</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">24h Change</th>
                            <th className="p-4">Market Cap</th>
                            <th className="p-4">P/E Ratio</th>
                            <th className="p-4">52-Week Range</th>
                            <th className="p-4">Quant Rating</th>
                            <th className="p-4 text-right">Research</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-12 text-center text-gray-500 font-sans">
                                    No tickers match your filter criteria.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((stock) => {
                                const isUp = stock.change >= 0;
                                const isSelected = compareSymbols.includes(stock.symbol);
                                return (
                                    <tr key={stock.symbol} className="transition hover:bg-white/[0.03]">
                                        <td className="p-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleCompare(stock.symbol)}
                                                className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                                                    isSelected
                                                        ? 'border-yellow-400 bg-yellow-400 text-black'
                                                        : 'border-white/20 bg-transparent text-transparent hover:border-white/40'
                                                }`}
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                        <td className="p-4 font-sans">
                                            <Link
                                                href={`/stocks/${stock.symbol}`}
                                                className="group inline-flex items-center gap-1.5 font-mono font-bold text-white hover:text-yellow-300"
                                            >
                                                {stock.symbol}
                                                <ArrowUpRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-yellow-300 transition-colors" />
                                            </Link>
                                            <p className="truncate text-xs text-gray-400 max-w-[150px] font-sans">
                                                {stock.name}
                                            </p>
                                            <span className="inline-block mt-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
                                                {stock.sector}
                                            </span>
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
                                        <td className="p-4 text-gray-300">${stock.marketCapBillions}B</td>
                                        <td className="p-4 text-gray-300">{stock.peRatio}x</td>
                                        <td className="p-4 text-xs text-gray-400">
                                            ${stock.low52W.toFixed(0)} — ${stock.high52W.toFixed(0)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                                        stock.signal === 'STRONG BUY'
                                                            ? 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                                                            : stock.signal === 'BUY'
                                                            ? 'border border-teal-400/30 bg-teal-500/15 text-teal-300'
                                                            : 'border border-yellow-400/30 bg-yellow-500/15 text-yellow-300'
                                                    }`}
                                                >
                                                    {stock.signal}
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    {stock.quantScore}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleGenerateAIReport(stock.symbol)}
                                                className="bg-yellow-400/10 border border-yellow-400/25 text-yellow-300 hover:bg-yellow-400/20 text-xs font-semibold h-8"
                                            >
                                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                                AI Brief
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* AI Research Report Modal */}
            <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
                <DialogContent className="max-w-2xl border-white/10 bg-[#101216] text-gray-200 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                                <Bot className="h-4 w-4" />
                            </span>
                            PulseQuant AI Equity Research — {activeReportSymbol}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Automated synthesis via Google Gemini & PulseQuant quantitative engine
                        </DialogDescription>
                    </DialogHeader>

                    {isGenerating || !reportData ? (
                        <div className="py-16 text-center space-y-3">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-400" />
                            <p className="text-sm font-semibold text-white">
                                Synthesizing market data for {activeReportSymbol}...
                            </p>
                            <p className="text-xs text-gray-500">
                                Ingesting real-time quote, valuation ratios, and news catalysts
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5 text-sm">
                            {/* Score & Target Price Banner */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Verdict</p>
                                    <p className="mt-1 font-bold text-emerald-400 text-base">{reportData.verdict}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Quant Confidence</p>
                                    <p className="mt-1 font-bold font-mono text-yellow-400 text-base">{reportData.confidenceScore}/100</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">12M Target Price</p>
                                    <p className="mt-1 font-bold font-mono text-white text-base">${reportData.targetPrice12M.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Implied Upside</p>
                                    <p className="mt-1 font-bold font-mono text-emerald-400 text-base">+{reportData.upsidePercent}%</p>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Executive Summary</h4>
                                <p className="mt-1.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                                    {reportData.executiveSummary}
                                </p>
                            </div>

                            {/* Bull & Bear Cases */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                        <TrendingUp className="h-4 w-4" /> Bull Thesis
                                    </h4>
                                    <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
                                        {reportData.bullCase.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                                        <TrendingDown className="h-4 w-4" /> Bear Risks
                                    </h4>
                                    <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
                                        {reportData.bearCase.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Key Technical Levels */}
                            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-gray-400">Institutional Support: </span>
                                    <span className="font-mono font-bold text-emerald-400">${reportData.supportLevel}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Major Resistance: </span>
                                    <span className="font-mono font-bold text-red-400">${reportData.resistanceLevel}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Risk Profile: </span>
                                    <span className="font-bold text-yellow-300">{reportData.riskRating}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[11px] text-gray-500 font-mono">
                                    Engine: {reportData.source} • {new Date(reportData.generatedAt).toLocaleDateString()}
                                </span>
                                <Link
                                    href={`/stocks/${reportData.symbol}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-yellow-300"
                                >
                                    Open Full Terminal
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
