'use client';

import { useEffect, useState } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Loader2, Search, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';

interface ExtendedSearchCommandProps extends SearchCommandProps {
    className?: string;
}

export default function SearchCommand({
    renderAs = 'pill',
    label = 'Search symbols...',
    initialStocks,
    className = '',
}: ExtendedSearchCommandProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleSearch = async () => {
        if (!isSearchMode) return setStocks(initialStocks);

        setLoading(true);
        try {
            const results = await searchStocks(searchTerm.trim());
            setStocks(results);
        } catch {
            setStocks([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useDebounce(handleSearch, 250);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm('');
        setStocks(initialStocks);
    };

    return (
        <>
            {renderAs === 'pill' ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={`group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-gray-400 transition hover:border-yellow-400/30 hover:bg-white/[0.07] hover:text-white ${className}`}
                >
                    <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-gray-500 transition group-hover:text-yellow-400" />
                        <span className="hidden md:inline">{label}</span>
                        <span className="md:hidden">Search</span>
                    </div>
                    <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-400 sm:flex">
                        <span className="text-[11px]">⌘</span>K
                    </kbd>
                </button>
            ) : renderAs === 'text' ? (
                <span
                    onClick={() => setOpen(true)}
                    className={`cursor-pointer hover:text-yellow-400 transition-colors ${className}`}
                >
                    {label}
                </span>
            ) : (
                <Button
                    onClick={() => setOpen(true)}
                    className={`flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 ${className}`}
                >
                    <Search className="h-4 w-4" />
                    {label}
                </Button>
            )}

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                className="w-[94vw] max-w-2xl border-white/10 bg-[#101216] text-gray-200 shadow-2xl p-0 overflow-hidden"
            >
                <div className="relative border-b border-white/10 px-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <CommandInput
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        placeholder="Search by symbol or company (e.g. NVDA, Apple, Tesla)..."
                        className="h-13 bg-transparent pl-8 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 border-0"
                    />
                    {loading && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-yellow-400" />
                    )}
                </div>

                <CommandList className="max-h-[380px] p-2 overflow-y-auto">
                    {loading ? (
                        <CommandEmpty className="py-8 text-center text-sm text-gray-400">
                            Searching market database...
                        </CommandEmpty>
                    ) : displayStocks?.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            {isSearchMode ? `No stocks found matching "${searchTerm}"` : 'No stocks available'}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                <span>{isSearchMode ? 'Search Matches' : 'Institutional High-Volume'}</span>
                                <span className="font-mono">{displayStocks?.length || 0}</span>
                            </div>

                            {displayStocks?.map((stock) => (
                                <Link
                                    key={stock.symbol}
                                    href={`/stocks/${stock.symbol}`}
                                    onClick={handleSelectStock}
                                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06] hover:border-white/10"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 font-mono text-xs font-bold text-yellow-300">
                                            {stock.symbol.slice(0, 3)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-white group-hover:text-yellow-300 transition-colors">
                                                    {stock.symbol}
                                                </span>
                                                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                                                    {stock.exchange || 'US'}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-gray-400">
                                                {stock.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-yellow-300 transition-colors">
                                        <span className="hidden sm:inline">Open Terminal</span>
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
