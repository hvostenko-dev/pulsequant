import { Gauge } from 'lucide-react';

interface Props {
    quotes: { symbol: string; changePercent: number }[];
}

/**
 * Server-rendered breadth & momentum gauge derived from the featured mega-cap basket.
 * Score 0-100: 50 = neutral. Combines advancer ratio and average % move.
 */
export default function MarketPulseGauge({ quotes }: Props) {
    const total = quotes.length || 1;
    const advancers = quotes.filter((q) => q.changePercent >= 0).length;
    const avg = quotes.reduce((s, q) => s + q.changePercent, 0) / total;
    const breadth = advancers / total;
    const raw = 50 + breadth * 25 - 12.5 + Math.max(-25, Math.min(25, avg * 10));
    const score = Math.round(Math.max(0, Math.min(100, raw)));

    const mood =
        score >= 75 ? { label: 'Extreme Greed', color: 'text-emerald-300' }
        : score >= 58 ? { label: 'Bullish', color: 'text-emerald-300' }
        : score >= 42 ? { label: 'Neutral', color: 'text-amber-300' }
        : score >= 25 ? { label: 'Bearish', color: 'text-rose-300' }
        : { label: 'Extreme Fear', color: 'text-rose-400' };

    return (
        <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    <Gauge className="h-4 w-4 text-cyan-300" /> Market Pulse
                </h3>
                <span className={`text-sm font-bold ${mood.color}`}>{mood.label}</span>
            </div>

            <div className="mt-4 flex items-end gap-3">
                <span className="text-gradient font-mono text-5xl font-black leading-none">{score}</span>
                <span className="pb-1 text-xs text-gray-500">/ 100 composite</span>
            </div>

            <div className="relative mt-4 h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400">
                <span
                    className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    style={{ left: `calc(${score}% - 3px)` }}
                />
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-white/[0.04] p-2">
                    <dt className="text-gray-500">Advancers</dt>
                    <dd className="font-mono font-bold text-emerald-300">{advancers}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-2">
                    <dt className="text-gray-500">Decliners</dt>
                    <dd className="font-mono font-bold text-rose-300">{quotes.length - advancers}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-2">
                    <dt className="text-gray-500">Avg Move</dt>
                    <dd className={`font-mono font-bold ${avg >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {avg >= 0 ? '+' : ''}
                        {avg.toFixed(2)}%
                    </dd>
                </div>
            </dl>
        </div>
    );
}
