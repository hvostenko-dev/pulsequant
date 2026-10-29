'use client';

import React from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className="dark">
            <body className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-center text-gray-200 antialiased">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101216] p-6 sm:p-8 shadow-2xl">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 font-mono text-lg font-black text-yellow-300">
                        PQ
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-white">
                        PulseQuant — System Recovery
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
                        {error?.message ||
                            'An unexpected runtime error occurred in the terminal.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-300 cursor-pointer"
                    >
                        Reload Terminal
                    </button>
                </div>
            </body>
        </html>
    );
}
