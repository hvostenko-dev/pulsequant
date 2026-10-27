'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';
import { PriceAlert } from '@/database/models/alert.model';
import { getBatchEnrichedQuotes } from '@/lib/actions/finnhub.actions';
import { INSTITUTIONAL_STOCKS_DIRECTORY } from '@/lib/constants';

const getOptionalCurrentUserId = async (): Promise<string | null> => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        return session?.user?.id ?? null;
    } catch {
        return null;
    }
};

const getCurrentUserId = async (): Promise<string> => {
    const userId = await getOptionalCurrentUserId();
    if (!userId) {
        throw new Error('You must be signed in');
    }
    return userId;
};

export const getUserAlerts = async (): Promise<Alert[]> => {
    try {
        const userId = await getOptionalCurrentUserId();
        if (!userId) return [];
        await connectToDatabase();

        const docs = await PriceAlert.find({ userId }).sort({ createdAt: -1 }).lean();
        if (docs.length === 0) return [];

        const symbols = Array.from(new Set(docs.map((d) => String(d.symbol).toUpperCase())));
        const quotes = await getBatchEnrichedQuotes(symbols);
        const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

        return docs.map((doc) => {
            const sym = String(doc.symbol).toUpperCase();
            const q = quoteMap.get(sym);
            const currentPrice = q?.price ?? INSTITUTIONAL_STOCKS_DIRECTORY[sym]?.fallbackPrice ?? Number(doc.threshold);
            const threshold = Number(doc.threshold);
            const alertType = doc.alertType === 'lower' ? 'lower' : 'upper';
            const triggered =
                Boolean(doc.active) &&
                ((alertType === 'upper' && currentPrice >= threshold) ||
                    (alertType === 'lower' && currentPrice <= threshold));

            return {
                id: String(doc._id),
                symbol: sym,
                company: String(doc.company || q?.name || sym),
                alertName: String(doc.alertName),
                currentPrice,
                alertType,
                threshold,
                changePercent: q?.changePercent ?? 0,
                active: Boolean(doc.active),
                triggered,
                createdAt:
                    doc.createdAt instanceof Date
                        ? doc.createdAt.toISOString()
                        : new Date(doc.createdAt).toISOString(),
            };
        });
    } catch {
        return [];
    }
};

export const createPriceAlert = async ({
    symbol,
    company,
    alertName,
    alertType,
    threshold,
}: {
    symbol: string;
    company?: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
}) => {
    const userId = await getCurrentUserId();
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol) throw new Error('Stock symbol is required');
    if (!Number.isFinite(threshold) || threshold <= 0) throw new Error('Valid target price is required');

    const directoryEntry = INSTITUTIONAL_STOCKS_DIRECTORY[normalizedSymbol];
    const resolvedCompany = (company || directoryEntry?.name || normalizedSymbol).trim();
    const resolvedName =
        alertName.trim() ||
        `${normalizedSymbol} ${alertType === 'upper' ? 'Breakout Above' : 'Pullback Below'} $${threshold.toFixed(2)}`;

    await connectToDatabase();

    await PriceAlert.create({
        userId,
        symbol: normalizedSymbol,
        company: resolvedCompany,
        alertName: resolvedName,
        alertType,
        threshold: +Number(threshold).toFixed(2),
        active: true,
        createdAt: new Date(),
    });

    revalidatePath('/alerts');
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${normalizedSymbol}`);
    revalidatePath('/');

    return { success: true };
};

export const deletePriceAlert = async (alertId: string) => {
    const userId = await getCurrentUserId();
    await connectToDatabase();

    await PriceAlert.deleteOne({ _id: alertId, userId });

    revalidatePath('/alerts');
    revalidatePath('/watchlist');
    revalidatePath('/');
    return { success: true };
};

export const togglePriceAlert = async (alertId: string, active: boolean) => {
    const userId = await getCurrentUserId();
    await connectToDatabase();

    await PriceAlert.updateOne({ _id: alertId, userId }, { $set: { active } });

    revalidatePath('/alerts');
    revalidatePath('/watchlist');
    return { success: true };
};

export const seedDemoAlerts = async () => {
    const userId = await getCurrentUserId();
    await connectToDatabase();

    const samples = [
        {
            symbol: 'NVDA',
            company: 'NVIDIA Corporation',
            alertName: 'NVDA All-Time High Breakout',
            alertType: 'upper' as const,
            threshold: 145.00,
        },
        {
            symbol: 'AAPL',
            company: 'Apple Inc.',
            alertName: 'AAPL Institutional Support Zone',
            alertType: 'lower' as const,
            threshold: 220.00,
        },
        {
            symbol: 'TSLA',
            company: 'Tesla, Inc.',
            alertName: 'TSLA Momentum Resistance Target',
            alertType: 'upper' as const,
            threshold: 265.00,
        },
        {
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            alertName: 'MSFT Cloud Pullback Entry',
            alertType: 'lower' as const,
            threshold: 415.00,
        },
    ];

    for (const s of samples) {
        await PriceAlert.create({
            userId,
            ...s,
            active: true,
            createdAt: new Date(),
        });
    }

    revalidatePath('/alerts');
    revalidatePath('/watchlist');
    revalidatePath('/');
    return { success: true };
};
