import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { getBatchEnrichedQuotes } from '@/lib/actions/finnhub.actions';
import ScreenerClient from '@/components/ScreenerClient';

export const metadata = {
    title: 'Quantitative Stock Screener & AI Research',
    description: 'Multi-factor quantitative stock screener and automated Google Gemini equity research generator.',
};

export default async function ScreenerPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const quotes = await getBatchEnrichedQuotes(POPULAR_STOCK_SYMBOLS.slice(0, 20));

    return <ScreenerClient initialQuotes={quotes} />;
}
