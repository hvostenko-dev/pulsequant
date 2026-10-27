import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserPortfolio } from '@/lib/actions/portfolio.actions';
import { getBatchEnrichedQuotes } from '@/lib/actions/finnhub.actions';
import PortfolioClient from '@/components/PortfolioClient';

export const metadata = {
    title: 'Portfolio & Paper Trading Simulator',
    description: 'Track real-time equity positions, mark-to-market performance, and sector allocation.',
};

export default async function PortfolioPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const positions = await getUserPortfolio();
    const symbols = positions.map((p) => p.symbol);
    const quotesList = await getBatchEnrichedQuotes(symbols);

    const quotesMap: Record<string, EnrichedStockQuote> = {};
    quotesList.forEach((q) => {
        quotesMap[q.symbol] = q;
    });

    return <PortfolioClient positions={positions} quotes={quotesMap} />;
}
