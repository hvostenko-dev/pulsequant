'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('PulseQuant Terminal Error:', error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10">
                <AlertTriangle className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Terminal Feed Interrupted
            </h2>

            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                {error?.message ||
                    'An unexpected telemetry error occurred while loading market data.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-300 cursor-pointer"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry Connection
                </button>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-200 transition hover:bg-white/[0.1]"
                >
                    <Home className="h-4 w-4" />
                    Return to Terminal
                </Link>
            </div>
        </div>
    );
}
