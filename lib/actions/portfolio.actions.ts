'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';
import { Portfolio } from '@/database/models/portfolio.model';
import { INSTITUTIONAL_STOCKS_DIRECTORY } from '@/lib/constants';

const getCurrentUserId = async (): Promise<string> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error('You must be signed in');
    }

    return session.user.id;
};

export const getUserPortfolio = async (): Promise<PortfolioPositionRecord[]> => {
    try {
        const userId = await getCurrentUserId();
        await connectToDatabase();

        const items = await Portfolio.find({ userId }).sort({ addedAt: -1 }).lean();

        return items.map((item) => ({
            id: String(item._id),
            symbol: String(item.symbol),
            company: String(item.company),
            shares: Number(item.shares),
            avgBuyPrice: Number(item.avgBuyPrice),
            sector: String(item.sector || 'Technology'),
            notes: item.notes ? String(item.notes) : '',
            addedAt:
                item.addedAt instanceof Date
                    ? item.addedAt.toISOString()
                    : new Date(item.addedAt).toISOString(),
        }));
    } catch (error) {
        console.error('GET_PORTFOLIO_ERROR:', error);
        return [];
    }
};

export const upsertPortfolioPosition = async ({
    symbol,
    company,
    shares,
    avgBuyPrice,
    sector,
    notes,
}: {
    symbol: string;
    company?: string;
    shares: number;
    avgBuyPrice: number;
    sector?: string;
    notes?: string;
}) => {
    const userId = await getCurrentUserId();
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol) throw new Error('Ticker symbol is required');
    if (!Number.isFinite(shares) || shares <= 0) throw new Error('Shares must be greater than 0');
    if (!Number.isFinite(avgBuyPrice) || avgBuyPrice <= 0) throw new Error('Average buy price must be greater than 0');

    const directoryEntry = INSTITUTIONAL_STOCKS_DIRECTORY[normalizedSymbol];
    const resolvedCompany = (company || directoryEntry?.name || normalizedSymbol).trim();
    const resolvedSector = (sector || directoryEntry?.sector || 'Technology').trim();

    await connectToDatabase();

    await Portfolio.findOneAndUpdate(
        { userId, symbol: normalizedSymbol },
        {
            $set: {
                userId,
                symbol: normalizedSymbol,
                company: resolvedCompany,
                shares: +Number(shares).toFixed(4),
                avgBuyPrice: +Number(avgBuyPrice).toFixed(2),
                sector: resolvedSector,
                notes: notes?.trim() || '',
                addedAt: new Date(),
            },
        },
        { upsert: true, new: true }
    );

    revalidatePath('/portfolio');
    revalidatePath('/');
    revalidatePath(`/stocks/${normalizedSymbol}`);

    return { success: true, symbol: normalizedSymbol };
};

export const removePortfolioPosition = async (symbol: string) => {
    const userId = await getCurrentUserId();
    const normalizedSymbol = symbol.trim().toUpperCase();

    await connectToDatabase();
    await Portfolio.deleteOne({ userId, symbol: normalizedSymbol });

    revalidatePath('/portfolio');
    revalidatePath('/');
    return { success: true };
};

export const seedDemoPortfolio = async () => {
    const userId = await getCurrentUserId();
    await connectToDatabase();

    const demoPositions = [
        {
            symbol: 'NVDA',
            company: 'NVIDIA Corporation',
            shares: 45,
            avgBuyPrice: 108.50,
            sector: 'Technology',
            notes: 'Core AI compute & Blackwell datacenter cycle',
        },
        {
            symbol: 'AAPL',
            company: 'Apple Inc.',
            shares: 35,
            avgBuyPrice: 196.20,
            sector: 'Technology',
            notes: 'Apple Intelligence hardware upgrade supercycle',
        },
        {
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            shares: 20,
            avgBuyPrice: 398.00,
            sector: 'Technology',
            notes: 'Azure cloud + enterprise Copilot seat expansion',
        },
        {
            symbol: 'AMZN',
            company: 'Amazon.com, Inc.',
            shares: 40,
            avgBuyPrice: 181.40,
            sector: 'Consumer Goods',
            notes: 'AWS margin expansion & robotics fulfillment',
        },
        {
            symbol: 'JPM',
            company: 'JPMorgan Chase & Co.',
            shares: 25,
            avgBuyPrice: 204.80,
            sector: 'Finance',
            notes: 'Net interest income & investment banking recovery',
        },
        {
            symbol: 'PLTR',
            company: 'Palantir Technologies Inc.',
            shares: 80,
            avgBuyPrice: 38.90,
            sector: 'Technology',
            notes: 'AIP commercial bootcamps & defense contracts',
        },
    ];

    for (const pos of demoPositions) {
        await Portfolio.findOneAndUpdate(
            { userId, symbol: pos.symbol },
            {
                $set: {
                    userId,
                    ...pos,
                    addedAt: new Date(),
                },
            },
            { upsert: true }
        );
    }

    revalidatePath('/portfolio');
    revalidatePath('/');
    return { success: true, count: demoPositions.length };
};
