'use client';

import { useEffect, useState } from 'react';
import { Clock, Globe2 } from 'lucide-react';

type Session = { label: string; open: boolean; tone: string; countdown: string };

const NY_FORMAT = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

function pad(n: number) {
    return String(n).padStart(2, '0');
}

function fmtDuration(mins: number) {
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    return d > 0 ? `${d}d ${h}h` : `${h}h ${pad(m)}m`;
}

function computeSession(now: Date): { session: Session; clock: string } {
    const parts = Object.fromEntries(NY_FORMAT.formatToParts(now).map((p) => [p.type, p.value]));
    const weekday = parts.weekday as string;
    const hour = Number(parts.hour) % 24;
    const minute = Number(parts.minute);
    const clock = `${pad(hour)}:${parts.minute}:${parts.second}`;
    const dayIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(weekday);
    const minutesNow = hour * 60 + minute;
    const OPEN = 9 * 60 + 30;
    const CLOSE = 16 * 60;
    const PRE = 4 * 60;
    const POST = 20 * 60;
    const isWeekday = dayIdx >= 0 && dayIdx <= 4;

    if (isWeekday && minutesNow >= OPEN && minutesNow < CLOSE) {
        return {
            clock,
            session: { label: 'NYSE / NASDAQ Open', open: true, tone: 'emerald', countdown: `closes in ${fmtDuration(CLOSE - minutesNow)}` },
        };
    }
    if (isWeekday && minutesNow >= PRE && minutesNow < OPEN) {
        return { clock, session: { label: 'Pre-Market', open: false, tone: 'amber', countdown: `opens in ${fmtDuration(OPEN - minutesNow)}` } };
    }
    if (isWeekday && minutesNow >= CLOSE && minutesNow < POST) {
        return { clock, session: { label: 'After-Hours', open: false, tone: 'violet', countdown: 'extended session' } };
    }
    // Closed: find minutes until next regular open
    let daysAhead = 0;
    let idx = dayIdx;
    let minsToOpen: number;
    if (isWeekday && minutesNow < OPEN) {
        minsToOpen = OPEN - minutesNow;
    } else {
        do {
            idx = (idx + 1) % 7;
            daysAhead++;
        } while (idx > 4);
        minsToOpen = daysAhead * 1440 - minutesNow + OPEN;
    }
    return { clock, session: { label: 'Market Closed', open: false, tone: 'rose', countdown: `opens in ${fmtDuration(minsToOpen)}` } };
}

const TONES: Record<string, string> = {
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
};

const DOTS: Record<string, string> = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    violet: 'bg-violet-400',
    rose: 'bg-rose-400',
};

export default function MarketStatusBar() {
    const [state, setState] = useState<{ session: Session; clock: string } | null>(null);

    useEffect(() => {
        const tick = () => setState(computeSession(new Date()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                    state ? TONES[state.session.tone] : 'border-white/10 bg-white/5 text-gray-400'
                }`}
            >
                <span className={`h-1.5 w-1.5 rounded-full ${state ? DOTS[state.session.tone] : 'bg-gray-500'} ${state?.session.open ? 'animate-pulse' : ''}`} />
                {state ? state.session.label : 'Syncing session…'}
                {state && <span className="font-mono opacity-70">· {state.session.countdown}</span>}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-gray-300">
                <Clock className="h-3 w-3 text-cyan-300" />
                NY {state ? state.clock : '--:--:--'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-400">
                <Globe2 className="h-3 w-3 text-violet-300" />
                US Equities · USD
            </span>
        </div>
    );
}
