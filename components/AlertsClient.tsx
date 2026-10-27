'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import {
    Bell,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    CheckCircle2,
    Clock,
    Plus,
    Sparkles,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deletePriceAlert, togglePriceAlert, seedDemoAlerts } from '@/lib/actions/alert.actions';
import AlertModal from '@/components/AlertModal';
import { toast } from 'sonner';

interface AlertsClientProps {
    alerts: Alert[];
}

export default function AlertsClient({ alerts }: AlertsClientProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string, symbol: string) => {
        startTransition(async () => {
            try {
                await deletePriceAlert(id);
                toast.success(`Alert for ${symbol} deleted`);
            } catch {
                toast.error('Failed to delete alert');
            }
        });
    };

    const handleToggle = (id: string, currentActive: boolean) => {
        startTransition(async () => {
            try {
                await togglePriceAlert(id, !currentActive);
                toast.success(`Alert ${!currentActive ? 'activated' : 'paused'}`);
            } catch {
                toast.error('Failed to update alert state');
            }
        });
    };

    const handleSeed = () => {
        startTransition(async () => {
            try {
                await seedDemoAlerts();
                toast.success('Loaded institutional demo alerts!');
            } catch {
                toast.error('Failed to load demo alerts');
            }
        });
    };

    const activeCount = alerts.filter((a) => a.active && !a.triggered).length;
    const triggeredCount = alerts.filter((a) => a.triggered).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="glass aurora-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
                            <Bell className="h-3.5 w-3.5" />
                            Smart Microstructure Price Alerts
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Real-Time Target &
                            <span className="block bg-gradient-to-r from-blue-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                                Volatility Monitors.
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-gray-400 max-w-xl">
                            Track breakout levels and dip thresholds with automated triggers and email notifications delivered straight to your inbox.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {alerts.length === 0 && (
                            <Button
                                onClick={handleSeed}
                                disabled={isPending}
                                className="h-10 px-4 text-sm bg-blue-500 font-bold text-white hover:bg-blue-400"
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Load Demo Alerts
                            </Button>
                        )}

                        <AlertModal
                            symbol="NVDA"
                            company="NVIDIA Corporation"
                            currentPrice={138.60}
                            trigger={
                                <Button className="h-10 px-4 text-sm bg-yellow-400 font-bold text-black hover:bg-yellow-300">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Price Alert
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* KPI Strip */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Configured</p>
                        <p className="mt-2 text-3xl font-black text-white font-mono">{alerts.length}</p>
                        <p className="mt-1 text-xs text-gray-500">Active monitoring pipelines</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Armed & Live</p>
                        <p className="mt-2 text-3xl font-black text-emerald-400 font-mono">{activeCount}</p>
                        <p className="mt-1 text-xs text-gray-500">Monitoring real-time ticks</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Triggered Targets</p>
                        <p className="mt-2 text-3xl font-black text-yellow-400 font-mono">{triggeredCount}</p>
                        <p className="mt-1 text-xs text-gray-500">Conditions met at current price</p>
                    </div>
                </div>
            </section>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"><Bell className="h-7 w-7 text-gray-500" /></div>
                    <h3 className="mt-4 text-lg font-bold text-white">No price monitors currently set</h3>
                    <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
                        Never miss a key breakout or dip. Set custom price targets or click below to seed demo alerts.
                    </p>
                    <Button
                        onClick={handleSeed}
                        disabled={isPending}
                        className="mt-5 h-10 px-4 text-sm bg-yellow-400 font-bold text-black hover:bg-yellow-300"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Load Demo Alerts
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {alerts.map((alert) => {
                        const isUpper = alert.alertType === 'upper';
                        const diff = alert.threshold - alert.currentPrice;
                        const diffPct = alert.currentPrice > 0 ? (diff / alert.currentPrice) * 100 : 0;
                        const isTriggered = alert.triggered;

                        return (
                            <div
                                key={alert.id}
                                className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                                    isTriggered
                                        ? 'border-yellow-400/40 bg-yellow-400/[0.05] shadow-lg shadow-yellow-400/5'
                                        : 'border-white/10 bg-black/40 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                                                isTriggered
                                                    ? 'bg-yellow-400 text-black'
                                                    : isUpper
                                                    ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-400'
                                                    : 'border border-red-400/20 bg-red-500/10 text-red-400'
                                            }`}
                                        >
                                            {isTriggered ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : isUpper ? (
                                                <ArrowUpRight className="h-5 w-5" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/stocks/${alert.symbol}`}
                                                    className="font-mono text-lg font-bold text-white hover:text-yellow-300 transition-colors"
                                                >
                                                    {alert.symbol}
                                                </Link>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                        isTriggered
                                                            ? 'bg-yellow-400 text-black'
                                                            : alert.active
                                                            ? 'bg-emerald-500/15 text-emerald-400'
                                                            : 'bg-white/10 text-gray-400'
                                                    }`}
                                                >
                                                    {isTriggered ? 'Triggered 🔥' : alert.active ? 'Armed' : 'Paused'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                {alert.alertName || alert.company}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(alert.id, !!alert.active)}
                                            className="rounded-lg p-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
                                            title={alert.active ? 'Pause Alert' : 'Resume Alert'}
                                        >
                                            <Clock className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(alert.id, alert.symbol)}
                                            className="rounded-lg p-1.5 text-xs text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                            title="Delete Alert"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Price target and distance */}
                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs font-mono">
                                    <div>
                                        <span className="text-gray-500 block text-[10px] uppercase">Current Price</span>
                                        <span className="text-sm font-bold text-white">${alert.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px] uppercase">
                                            {isUpper ? 'Target Level (Above)' : 'Floor Level (Below)'}
                                        </span>
                                        <span className="text-sm font-bold text-yellow-300">${alert.threshold.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Distance to trigger:</span>
                                    <span
                                        className={`font-mono font-bold ${
                                            isTriggered ? 'text-yellow-400' : diff > 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                    >
                                        {isTriggered
                                            ? 'Condition Met'
                                            : `${diff > 0 ? '+' : ''}$${Math.abs(diff).toFixed(2)} (${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%)`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
