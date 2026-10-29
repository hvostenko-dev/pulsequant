import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 font-mono text-xl font-black text-yellow-300">
                404
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Instrument or Route Not Found
            </h1>
            <p className="mt-2 text-sm text-gray-400">
                The requested ticker or terminal route does not exist or has been delisted.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                    <Home className="h-4 w-4" />
                    Back to Terminal
                </Link>
                <Link
                    href="/screener"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-200 transition hover:bg-white/[0.1]"
                >
                    <Compass className="h-4 w-4 text-yellow-400" />
                    Open AI Screener
                </Link>
            </div>
        </div>
    );
}
