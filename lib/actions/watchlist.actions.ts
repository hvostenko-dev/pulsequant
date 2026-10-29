"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/better-auth/auth";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export interface WatchlistRecord {
    symbol: string;
    company: string;
    addedAt: string;
}

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
        throw new Error("You must be signed in");
    }
    return userId;
};

export const getCurrentUserWatchlist = async (): Promise<WatchlistRecord[]> => {
    try {
        const userId = await getOptionalCurrentUserId();
        if (!userId) return [];

        await connectToDatabase();

        const items = await Watchlist.find({ userId })
            .sort({ addedAt: -1 })
            .lean();

        return items.map((item) => ({
            symbol: String(item.symbol),
            company: String(item.company),
            addedAt:
                item.addedAt instanceof Date
                    ? item.addedAt.toISOString()
                    : new Date(item.addedAt).toISOString(),
        }));
    } catch {
        return [];
    }
};

export const getCurrentUserWatchlistSymbols = async (): Promise<string[]> => {
    try {
        const userId = await getOptionalCurrentUserId();
        if (!userId) return [];

        await connectToDatabase();

        const items = await Watchlist.find(
            { userId },
            { symbol: 1, _id: 0 }
        ).lean();

        return items.map((item) =>
            String(item.symbol).toUpperCase()
        );
    } catch {
        return [];
    }
};

export const getWatchlistSymbolsByEmail = async (
    email: string
): Promise<string[]> => {
    try {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return [];
        }

        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error("Mongoose connection is not available");
        }

        const user = await db.collection("user").findOne(
            {
                email: normalizedEmail,
            },
            {
                projection: {
                    _id: 1,
                    id: 1,
                },
            }
        );

        if (!user) {
            return [];
        }

        const userId = String(
            user.id || user._id?.toString() || ""
        );

        if (!userId) {
            return [];
        }

        const items = await Watchlist.find(
            { userId },
            { symbol: 1, _id: 0 }
        ).lean();

        return items.map((item) =>
            String(item.symbol).toUpperCase()
        );
    } catch (error) {
        console.error("GET_WATCHLIST_SYMBOLS_BY_EMAIL_ERROR:", error);
        return [];
    }
};

export const addStockToWatchlist = async ({
    symbol,
    company,
}: {
    symbol: string;
    company: string;
}) => {
    const userId = await getCurrentUserId();

    const normalizedSymbol = symbol.trim().toUpperCase();
    const normalizedCompany =
        company.trim() || normalizedSymbol;

    if (!normalizedSymbol) {
        throw new Error("Stock symbol is required");
    }

    await connectToDatabase();

    await Watchlist.findOneAndUpdate(
        {
            userId,
            symbol: normalizedSymbol,
        },
        {
            $setOnInsert: {
                userId,
                symbol: normalizedSymbol,
                company: normalizedCompany,
                addedAt: new Date(),
            },
        },
        {
            upsert: true,
            new: true,
        }
    );

    revalidatePath("/");
    revalidatePath("/watchlist");
    revalidatePath(`/stocks/${normalizedSymbol}`);

    return {
        success: true,
        symbol: normalizedSymbol,
    };
};

export const removeStockFromWatchlist = async ({
    symbol,
}: {
    symbol: string;
}) => {
    const userId = await getCurrentUserId();
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
        throw new Error("Stock symbol is required");
    }

    await connectToDatabase();

    await Watchlist.deleteOne({
        userId,
        symbol: normalizedSymbol,
    });

    revalidatePath("/");
    revalidatePath("/watchlist");
    revalidatePath(`/stocks/${normalizedSymbol}`);

    return {
        success: true,
        symbol: normalizedSymbol,
    };
};

export const seedDemoWatchlist = async () => {
    const userId = await getCurrentUserId();
    await connectToDatabase();

    const demoStocks = [
        { symbol: "NVDA", company: "NVIDIA Corporation" },
        { symbol: "AAPL", company: "Apple Inc." },
        { symbol: "MSFT", company: "Microsoft Corporation" },
        { symbol: "AMZN", company: "Amazon.com Inc." },
        { symbol: "META", company: "Meta Platforms Inc." },
        { symbol: "TSLA", company: "Tesla Inc." },
    ];

    for (const stock of demoStocks) {
        await Watchlist.findOneAndUpdate(
            { userId, symbol: stock.symbol },
            {
                $setOnInsert: {
                    userId,
                    symbol: stock.symbol,
                    company: stock.company,
                    addedAt: new Date(),
                },
            },
            { upsert: true, new: true }
        );
    }

    revalidatePath("/");
    revalidatePath("/watchlist");
    return { success: true, count: demoStocks.length };
};
