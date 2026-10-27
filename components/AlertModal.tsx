'use client';

import React, { useState, useTransition } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { createPriceAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';

interface AlertModalProps {
    symbol: string;
    company?: string;
    currentPrice?: number;
    trigger?: React.ReactNode;
}

export default function AlertModal({
    symbol,
    company = '',
    currentPrice = 100,
    trigger,
}: AlertModalProps) {
    const [open, setOpen] = useState(false);
    const [alertType, setAlertType] = useState<'upper' | 'lower'>('upper');
    const [targetPrice, setTargetPrice] = useState(
        currentPrice > 0 ? (currentPrice * 1.05).toFixed(2) : '150.00'
    );
    const [alertName, setAlertName] = useState('');
    const [isPending, startTransition] = useTransition();

    const setPreset = (percent: number) => {
        const nextPrice = (currentPrice * (1 + percent / 100)).toFixed(2);
        setTargetPrice(nextPrice);
        setAlertType(percent >= 0 ? 'upper' : 'lower');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceNum = parseFloat(targetPrice);
        if (!priceNum || priceNum <= 0) {
            toast.error('Please enter a valid price threshold');
            return;
        }

        startTransition(async () => {
            try {
                await createPriceAlert({
                    symbol,
                    company,
                    alertName: alertName.trim(),
                    alertType,
                    threshold: priceNum,
                });
                toast.success(`Price alert created for ${symbol} at $${priceNum.toFixed(2)}`);
                setOpen(false);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to create alert');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 text-sm border-yellow-400/20 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20 hover:text-yellow-200"
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        Set Alert
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-[#12141A] text-gray-200 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                            <Bell className="h-4 w-4" />
                        </span>
                        Set Smart Alert for {symbol}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">
                        Get notified when {company || symbol} crosses your target price threshold.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    {/* Current Price Banner */}
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                        <span className="text-gray-400">Current Market Price:</span>
                        <span className="font-mono text-base font-bold text-white">
                            ${currentPrice.toFixed(2)}
                        </span>
                    </div>

                    {/* Alert Direction Toggle */}
                    <div>
                        <Label className="text-xs uppercase tracking-wider text-gray-400">Alert Type</Label>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAlertType('upper')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                                    alertType === 'upper'
                                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                }`}
                            >
                                <ArrowUpRight className="h-4 w-4" />
                                Price Above (Target)
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlertType('lower')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                                    alertType === 'lower'
                                        ? 'border-red-400/40 bg-red-500/15 text-red-300'
                                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                }`}
                            >
                                <ArrowDownRight className="h-4 w-4" />
                                Price Below (Stop / Dip)
                            </button>
                        </div>
                    </div>

                    {/* Threshold Input */}
                    <div>
                        <Label htmlFor="threshold" className="text-xs uppercase tracking-wider text-gray-400">
                            Threshold Price ($ USD)
                        </Label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-base">
                                $
                            </span>
                            <Input
                                id="threshold"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                className="h-11 border-white/10 bg-white/[0.05] pl-8 font-mono text-base text-white focus:border-yellow-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <Label className="text-xs uppercase tracking-wider text-gray-500">Quick Targets</Label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {[-10, -5, 5, 10, 20].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setPreset(pct)}
                                    className={`rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-mono font-medium transition hover:border-yellow-400/40 hover:text-yellow-300 ${
                                        pct > 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                                >
                                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alert Name / Note */}
                    <div>
                        <Label htmlFor="alertName" className="text-xs uppercase tracking-wider text-gray-400">
                            Alert Label (Optional)
                        </Label>
                        <Input
                            id="alertName"
                            placeholder="e.g. Q4 Earnings Breakout or Dip Buy"
                            value={alertName}
                            onChange={(e) => setAlertName(e.target.value)}
                            className="mt-1.5 h-10 border-white/10 bg-white/[0.05] text-sm text-white placeholder:text-gray-500 focus:border-yellow-400"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-yellow-400 font-bold text-black hover:bg-yellow-300"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Set Alert'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
