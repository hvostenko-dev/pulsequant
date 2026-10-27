'use client';

import React, { useState, useTransition } from 'react';
import WatchlistButton from '@/components/WatchlistButton';
import AlertModal from '@/components/AlertModal';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Sparkles,
    Loader2,
    Check,
    Bot,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { upsertPortfolioPosition } from '@/lib/actions/portfolio.actions';
import { generateAIStockReport } from '@/lib/actions/ai.actions';
import { toast } from 'sonner';

interface StockTerminalActionsProps {
    symbol: string;
    company: string;
    price: number;
    isInWatchlist: boolean;
}

export default function StockTerminalActions({
    symbol,
    company,
    price,
    isInWatchlist,
}: StockTerminalActionsProps) {
    const [isPendingPortfolio, startPortfolio] = useTransition();
    const [portfolioAdded, setPortfolioAdded] = useState(false);

    // AI modal
    const [openAIModal, setOpenAIModal] = useState(false);
    const [report, setReport] = useState<AIStockAnalysisReport | null>(null);
    const [isGeneratingAI, startAI] = useTransition();

    const handleQuickAddToPortfolio = () => {
        startPortfolio(async () => {
            try {
                await upsertPortfolioPosition({
                    symbol,
                    company,
                    shares: 10,
                    avgBuyPrice: price,
                    notes: 'Quick-added from Terminal',
                });
                setPortfolioAdded(true);
                toast.success(`Added 10 shares of ${symbol} to Portfolio Simulator at $${price.toFixed(2)}`);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to add position');
            }
        });
    };

    const handleOpenAIReport = () => {
        setOpenAIModal(true);
        startAI(async () => {
            try {
                const res = await generateAIStockReport(symbol);
                setReport(res);
            } catch {
                toast.error(`Failed to generate AI report for ${symbol}`);
            }
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            {/* Watchlist Toggle */}
            <div className="w-40">
                <WatchlistButton symbol={symbol} company={company} isInWatchlist={isInWatchlist} />
            </div>

            {/* Price Alert */}
            <AlertModal symbol={symbol} company={company} currentPrice={price} />

            {/* Quick Add to Portfolio */}
            <Button
                variant="outline"
                size="sm" 
                onClick={handleQuickAddToPortfolio}
                disabled={isPendingPortfolio}
                className="h-10 px-4 text-sm border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            >
                {isPendingPortfolio ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : portfolioAdded ? (
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                ) : (
                    <Briefcase className="mr-2 h-4 w-4" />
                )}
                {portfolioAdded ? 'In Portfolio' : 'Paper Trade'}
            </Button>

            {/* AI Research Brief */}
            <Button
                size="sm" 
                onClick={handleOpenAIReport}
                className="h-10 px-4 text-sm bg-gradient-to-r from-yellow-400 to-amber-500 font-bold text-black hover:from-yellow-300 hover:to-amber-400 shadow-md shadow-yellow-400/10"
            >
                <Sparkles className="mr-2 h-4 w-4" />
                Gemini AI Report
            </Button>

            {/* AI Modal */}
            <Dialog open={openAIModal} onOpenChange={setOpenAIModal}>
                <DialogContent className="max-w-2xl border-white/10 bg-[#101216] text-gray-200 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                                <Bot className="h-4 w-4" />
                            </span>
                            PulseQuant Gemini AI Equity Research — {symbol}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Real-time quantitative factor analysis & catalyst synthesis
                        </DialogDescription>
                    </DialogHeader>

                    {isGeneratingAI || !report ? (
                        <div className="py-16 text-center space-y-3">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-400" />
                            <p className="text-sm font-semibold text-white">
                                Generating institutional research for {symbol}...
                            </p>
                            <p className="text-xs text-gray-500">
                                Evaluating price momentum, valuation multiple, and earnings drivers
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Verdict</p>
                                    <p className="mt-1 font-bold text-emerald-400 text-base">{report.verdict}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Confidence</p>
                                    <p className="mt-1 font-bold font-mono text-yellow-400 text-base">{report.confidenceScore}/100</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">12M Target</p>
                                    <p className="mt-1 font-bold font-mono text-white text-base">${report.targetPrice12M.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Implied Upside</p>
                                    <p className="mt-1 font-bold font-mono text-emerald-400 text-base">+{report.upsidePercent}%</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Executive Synthesis</h4>
                                <p className="mt-1.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                                    {report.executiveSummary}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                        <TrendingUp className="h-4 w-4" /> Key Catalysts
                                    </h4>
                                    <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                                        {report.bullCase.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                                        <TrendingDown className="h-4 w-4" /> Downside Risks
                                    </h4>
                                    <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                                        {report.bearCase.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center justify-between text-xs">
                                <div>Support: <span className="font-mono text-emerald-400 font-bold">${report.supportLevel}</span></div>
                                <div>Resistance: <span className="font-mono text-red-400 font-bold">${report.resistanceLevel}</span></div>
                                <div>Risk Rating: <span className="text-yellow-300 font-bold">{report.riskRating}</span></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
