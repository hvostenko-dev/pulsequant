import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUserWatchlist } from '@/lib/actions/watchlist.actions';
import { getBatchEnrichedQuotes, getNews } from '@/lib/actions/finnhub.actions';
import WatchlistClient from '@/components/WatchlistClient';

export const metadata = {
    title: 'Personal Stock Watchlist & Live Quotes',
    description: 'Track your personalized stock watchlist with real-time Finnhub market quotes and price alerts.',
};

export default async function WatchlistPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const stocks = await getCurrentUserWatchlist();
    const symbols = stocks.map((s) => s.symbol);

    const [quotesList, news] = await Promise.all([
        getBatchEnrichedQuotes(symbols),
        getNews(symbols.length > 0 ? symbols : undefined),
    ]);

    const quotesMap: Record<string, EnrichedStockQuote> = {};
    quotesList.forEach((q) => {
        quotesMap[q.symbol] = q;
    });

    return <WatchlistClient stocks={stocks} quotesMap={quotesMap} news={news} />;
}
