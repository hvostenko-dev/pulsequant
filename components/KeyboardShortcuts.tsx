'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, X } from 'lucide-react';

const ROUTES: { key: string; href: string; label: string }[] = [
    { key: 'h', href: '/', label: 'Terminal (Home)' },
    { key: 'p', href: '/portfolio', label: 'Portfolio Simulator' },
    { key: 's', href: '/screener', label: 'Screener & AI Desk' },
    { key: 'w', href: '/watchlist', label: 'Watchlist' },
    { key: 'a', href: '/alerts', label: 'Price Alerts' },
];

function isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export default function KeyboardShortcuts() {
    const router = useRouter();
    const [helpOpen, setHelpOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const clear = () => {
            setPending(false);
            if (timer.current) clearTimeout(timer.current);
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
            const k = e.key.toLowerCase();

            if (e.key === 'Escape') {
                setHelpOpen(false);
                clear();
                return;
            }
            if (e.key === '?') {
                setHelpOpen((v) => !v);
                return;
            }
            if (pending) {
                const match = ROUTES.find((r) => r.key === k);
                clear();
                if (match) router.push(match.href);
                return;
            }
            if (k === 'g') {
                setPending(true);
                timer.current = setTimeout(() => setPending(false), 1500);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            if (timer.current) clearTimeout(timer.current);
        };
    }, [pending, router]);

    return (
        <>
            <button
                type="button"
                onClick={() => setHelpOpen(true)}
                aria-label="Keyboard shortcuts"
                className="fixed bottom-4 left-4 z-30 hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-gray-400 backdrop-blur transition hover:border-cyan-300/40 hover:text-cyan-300 md:flex"
            >
                <Keyboard className="h-4 w-4" />
            </button>

            {pending && (
                <div className="fixed bottom-16 left-4 z-50 rounded-lg border border-cyan-300/30 bg-black/80 px-3 py-2 font-mono text-xs text-cyan-200 backdrop-blur">
                    g → <span className="text-gray-400">h · p · s · w · a</span>
                </div>
            )}

            {helpOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setHelpOpen(false)}
                >
                    <div
                        className="glass w-full max-w-md rounded-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="Keyboard shortcuts"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                                <Keyboard className="h-5 w-5 text-cyan-300" /> Keyboard Shortcuts
                            </h3>
                            <button onClick={() => setHelpOpen(false)} aria-label="Close" className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between text-gray-300">
                                <span>Open quick search</span>
                                <kbd className="kbd">Ctrl / ⌘ + K</kbd>
                            </li>
                            {ROUTES.map((r) => (
                                <li key={r.key} className="flex justify-between text-gray-300">
                                    <span>{r.label}</span>
                                    <span className="flex gap-1">
                                        <kbd className="kbd">g</kbd>
                                        <kbd className="kbd">{r.key}</kbd>
                                    </span>
                                </li>
                            ))}
                            <li className="flex justify-between text-gray-300">
                                <span>Toggle this help</span>
                                <kbd className="kbd">?</kbd>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}
