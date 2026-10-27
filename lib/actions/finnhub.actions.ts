'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS, INSTITUTIONAL_STOCKS_DIRECTORY } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}

export { fetchJSON };

const FALLBACK_INSTITUTIONAL_NEWS: MarketNewsArticle[] = [
    {
        id: 9001,
        headline: 'Hyperscaler AI Capex Accelerates as Next-Gen GPU Clusters Enter Full Production',
        summary: 'Major cloud providers signaled sustained capital expenditure into data center infrastructure and custom silicon through 2027, bolstering semiconductor order books...',
        source: 'PulseQuant Institutional Desk',
        url: 'https://www.tradingview.com/news/',
        datetime: Math.floor(Date.now() / 1000) - 1800,
        category: 'technology',
        related: 'NVDA',
    },
    {
        id: 9002,
        headline: 'Federal Reserve Liquidity Projections Support Institutional Equity Flows in Q4',
        summary: 'Quantitative macro desks note resilient corporate operating margins across S&P 500 mega-cap constituents alongside stabilizing Treasury term premiums...',
        source: 'Macro & Rates Wire',
        url: 'https://www.tradingview.com/markets/',
        datetime: Math.floor(Date.now() / 1000) - 5400,
        category: 'macro',
        related: 'JPM',
    },
    {
        id: 9003,
        headline: 'Enterprise Cloud & Agentic AI Adoption Drives Record Recurring Software Revenue',
        summary: 'Fortune 500 CIO surveys confirm rapid deployment of autonomous AI workflows across enterprise cloud platforms, lifting net retention rates...',
        source: 'PulseQuant Equity Research',
        url: 'https://www.tradingview.com/news/',
        datetime: Math.floor(Date.now() / 1000) - 10800,
        category: 'company',
        related: 'MSFT',
    },
    {
        id: 9004,
        headline: 'Consumer Ecosystem Services Reach Record Gross Margin Contribution',
        summary: 'Installed hardware base monetization continues to expand via high-margin financial, cloud storage, and on-device intelligence subscriptions...',
        source: 'Global Tech Research',
        url: 'https://www.tradingview.com/news/',
        datetime: Math.floor(Date.now() / 1000) - 16200,
        category: 'company',
        related: 'AAPL',
    },
    {
        id: 9005,
        headline: 'Autonomous Fleet & Grid-Scale Megapack Deployments Beat Quarterly Estimates',
        summary: 'Energy storage deployments surged year-over-year as utility-scale grid stabilization demand accelerates alongside neural network FSD training compute...',
        source: 'CleanTech & Mobility Desk',
        url: 'https://www.tradingview.com/news/',
        datetime: Math.floor(Date.now() / 1000) - 21600,
        category: 'company',
        related: 'TSLA',
    },
    {
        id: 9006,
        headline: 'Digital Asset Institutional Custody Volumes Climb Amid ETF Options Expansion',
        summary: 'Derivatives volume and institutional prime brokerage inflows recorded strong week-over-week momentum across regulated US venues...',
        source: 'FinTech & Digital Assets',
        url: 'https://www.tradingview.com/news/',
        datetime: Math.floor(Date.now() / 1000) - 28800,
        category: 'finance',
        related: 'COIN',
    },
];

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        const cleanSymbols = (symbols || [])
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        if (!token) {
            return FALLBACK_INSTITUTIONAL_NEWS;
        }

        const maxArticles = 6;

        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.slice(0, 6).map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch {
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;
                    collected.push(formatArticle(article, true, sym, round));
                    if (collected.length >= maxArticles) break;
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
                return collected.slice(0, maxArticles);
            }
        }

        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break;
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted.length > 0 ? formatted : FALLBACK_INSTITUTIONAL_NEWS;
    } catch {
        return FALLBACK_INSTITUTIONAL_NEWS;
    }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        const trimmed = typeof query === 'string' ? query.trim() : '';

        // Fast fallback list from curated directory
        const curatedList: StockWithWatchlistStatus[] = Object.values(INSTITUTIONAL_STOCKS_DIRECTORY).map((item) => ({
            symbol: item.symbol,
            name: item.name,
            exchange: item.exchange,
            type: 'Common Stock',
            isInWatchlist: false,
        }));

        if (!token) {
            if (!trimmed) return curatedList.slice(0, 12);
            const q = trimmed.toLowerCase();
            return curatedList.filter(
                (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
            );
        }

        let results: FinnhubSearchResult[] = [];

        if (!trimmed) {
            const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles = await Promise.all(
                top.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
                        const profile = await fetchJSON<any>(url, 3600);
                        return { sym, profile } as { sym: string; profile: any };
                    } catch {
                        return { sym, profile: null } as { sym: string; profile: any };
                    }
                })
            );

            results = profiles
                .map(({ sym, profile }) => {
                    const symbol = sym.toUpperCase();
                    const fallback = INSTITUTIONAL_STOCKS_DIRECTORY[symbol];
                    const name: string | undefined = profile?.name || fallback?.name || profile?.ticker || undefined;
                    const exchange: string | undefined = profile?.exchange || fallback?.exchange || undefined;
                    if (!name) return undefined;
                    const r: FinnhubSearchResult = {
                        symbol,
                        description: name,
                        displaySymbol: symbol,
                        type: 'Common Stock',
                    };
                    (r as any).__exchange = exchange;
                    return r;
                })
                .filter((x): x is FinnhubSearchResult => Boolean(x));
        } else {
            const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
        }

        const mapped: StockWithWatchlistStatus[] = results
            .map((r) => {
                const upper = (r.symbol || '').toUpperCase();
                const name = r.description || upper;
                const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
                const exchangeFromProfile = (r as any).__exchange as string | undefined;
                const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
                const type = r.type || 'Stock';
                return {
                    symbol: upper,
                    name,
                    exchange,
                    type,
                    isInWatchlist: false,
                };
            })
            .slice(0, 15);

        if (mapped.length === 0) {
            if (!trimmed) return curatedList.slice(0, 12);
            const q = trimmed.toLowerCase();
            return curatedList.filter(
                (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
            );
        }

        return mapped;
    } catch {
        const curatedList: StockWithWatchlistStatus[] = Object.values(INSTITUTIONAL_STOCKS_DIRECTORY).map((item) => ({
            symbol: item.symbol,
            name: item.name,
            exchange: item.exchange,
            type: 'Common Stock',
            isInWatchlist: false,
        }));
        return curatedList.slice(0, 12);
    }
});

function computeQuantSignal(
    changePercent: number,
    peRatio: number,
    price: number,
    low52W: number,
    high52W: number
): { quantScore: number; signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'VOLATILE' } {
    const rangeSpan = Math.max(high52W - low52W, 1);
    const rangePosition = Math.min(Math.max((price - low52W) / rangeSpan, 0), 1);

    let score = 62;
    // Momentum contribution
    score += Math.max(Math.min(changePercent * 3.2, 16), -14);
    // 52-week trend strength
    score += rangePosition * 14;
    // Valuation moderation
    if (peRatio > 0 && peRatio < 32) score += 8;
    else if (peRatio >= 32 && peRatio <= 60) score += 4;
    else if (peRatio > 85) score -= 4;

    const clamped = Math.round(Math.min(Math.max(score, 35), 98));
    let signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'VOLATILE' = 'BUY';
    if (clamped >= 80) signal = 'STRONG BUY';
    else if (clamped >= 65) signal = 'BUY';
    else if (Math.abs(changePercent) > 4) signal = 'VOLATILE';
    else signal = 'HOLD';

    return { quantScore: clamped, signal };
}

export const getEnrichedStockQuote = cache(async (rawSymbol: string): Promise<EnrichedStockQuote> => {
    const symbol = (rawSymbol || 'AAPL').trim().toUpperCase();
    const fallback = INSTITUTIONAL_STOCKS_DIRECTORY[symbol] || {
        symbol,
        name: `${symbol} Corp.`,
        sector: 'Technology',
        industry: 'Public Equity',
        exchange: 'NASDAQ',
        fallbackPrice: 145.20,
        fallbackChange: 1.85,
        fallbackChangePercent: 1.29,
        marketCapBillions: 95.0,
        peRatio: 26.5,
        beta: 1.15,
        dividendYield: 0.4,
        eps: 5.48,
        high52W: 168.00,
        low52W: 112.50,
    };

    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
        const { quantScore, signal } = computeQuantSignal(
            fallback.fallbackChangePercent,
            fallback.peRatio,
            fallback.fallbackPrice,
            fallback.low52W,
            fallback.high52W
        );
        return {
            symbol,
            name: fallback.name,
            sector: fallback.sector,
            industry: fallback.industry,
            exchange: fallback.exchange,
            price: fallback.fallbackPrice,
            change: fallback.fallbackChange,
            changePercent: fallback.fallbackChangePercent,
            high: +(fallback.fallbackPrice * 1.014).toFixed(2),
            low: +(fallback.fallbackPrice * 0.988).toFixed(2),
            open: +(fallback.fallbackPrice - fallback.fallbackChange * 0.6).toFixed(2),
            prevClose: +(fallback.fallbackPrice - fallback.fallbackChange).toFixed(2),
            marketCapBillions: fallback.marketCapBillions,
            peRatio: fallback.peRatio,
            beta: fallback.beta,
            dividendYield: fallback.dividendYield,
            eps: fallback.eps,
            high52W: fallback.high52W,
            low52W: fallback.low52W,
            quantScore,
            signal,
        };
    }

    try {
        const [quoteRes, profileRes, metricRes] = await Promise.allSettled([
            fetchJSON<QuoteData>(`${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`, 60),
            fetchJSON<ProfileData>(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`, 3600),
            fetchJSON<FinancialsData>(`${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`, 3600),
        ]);

        const quote = quoteRes.status === 'fulfilled' ? quoteRes.value : null;
        const profile = profileRes.status === 'fulfilled' ? profileRes.value : null;
        const metrics = metricRes.status === 'fulfilled' ? metricRes.value?.metric : null;

        const price = quote?.c && quote.c > 0 ? quote.c : fallback.fallbackPrice;
        const change = typeof quote?.d === 'number' && quote?.c ? quote.d : fallback.fallbackChange;
        const changePercent = typeof quote?.dp === 'number' && quote?.c ? quote.dp : fallback.fallbackChangePercent;
        const high = quote?.h && quote.h > 0 ? quote.h : +(price * 1.015).toFixed(2);
        const low = quote?.l && quote.l > 0 ? quote.l : +(price * 0.985).toFixed(2);
        const open = quote?.o && quote.o > 0 ? quote.o : +(price - change * 0.5).toFixed(2);
        const prevClose = quote?.pc && quote.pc > 0 ? quote.pc : +(price - change).toFixed(2);

        const marketCapBillions =
            profile?.marketCapitalization && profile.marketCapitalization > 0
                ? +(profile.marketCapitalization / 1000).toFixed(1)
                : fallback.marketCapBillions;

        const peRatio =
            metrics?.peBasicExclExtraTTM && metrics.peBasicExclExtraTTM > 0
                ? +metrics.peBasicExclExtraTTM.toFixed(1)
                : fallback.peRatio;

        const beta =
            metrics?.beta && Number.isFinite(metrics.beta)
                ? +metrics.beta.toFixed(2)
                : fallback.beta;

        const high52W =
            metrics?.['52WeekHigh'] && metrics['52WeekHigh'] > 0
                ? +metrics['52WeekHigh'].toFixed(2)
                : Math.max(fallback.high52W, +(price * 1.12).toFixed(2));

        const low52W =
            metrics?.['52WeekLow'] && metrics['52WeekLow'] > 0
                ? +metrics['52WeekLow'].toFixed(2)
                : Math.min(fallback.low52W, +(price * 0.78).toFixed(2));

        const eps =
            metrics?.epsBasicExclExtraItemsTTM && Number.isFinite(metrics.epsBasicExclExtraItemsTTM)
                ? +metrics.epsBasicExclExtraItemsTTM.toFixed(2)
                : fallback.eps;

        const dividendYield =
            metrics?.dividendYieldIndicatedAnnual && Number.isFinite(metrics.dividendYieldIndicatedAnnual)
                ? +metrics.dividendYieldIndicatedAnnual.toFixed(2)
                : fallback.dividendYield;

        const { quantScore, signal } = computeQuantSignal(changePercent, peRatio, price, low52W, high52W);

        return {
            symbol,
            name: profile?.name || fallback.name,
            sector: fallback.sector,
            industry: profile?.finnhubIndustry || fallback.industry,
            exchange: profile?.exchange?.split(' ')[0] || fallback.exchange,
            price: +price.toFixed(2),
            change: +change.toFixed(2),
            changePercent: +changePercent.toFixed(2),
            high: +high.toFixed(2),
            low: +low.toFixed(2),
            open: +open.toFixed(2),
            prevClose: +prevClose.toFixed(2),
            marketCapBillions,
            peRatio,
            beta,
            dividendYield,
            eps,
            high52W,
            low52W,
            quantScore,
            signal,
        };
    } catch {
        const { quantScore, signal } = computeQuantSignal(
            fallback.fallbackChangePercent,
            fallback.peRatio,
            fallback.fallbackPrice,
            fallback.low52W,
            fallback.high52W
        );
        return {
            symbol,
            name: fallback.name,
            sector: fallback.sector,
            industry: fallback.industry,
            exchange: fallback.exchange,
            price: fallback.fallbackPrice,
            change: fallback.fallbackChange,
            changePercent: fallback.fallbackChangePercent,
            high: +(fallback.fallbackPrice * 1.014).toFixed(2),
            low: +(fallback.fallbackPrice * 0.988).toFixed(2),
            open: +(fallback.fallbackPrice - fallback.fallbackChange * 0.6).toFixed(2),
            prevClose: +(fallback.fallbackPrice - fallback.fallbackChange).toFixed(2),
            marketCapBillions: fallback.marketCapBillions,
            peRatio: fallback.peRatio,
            beta: fallback.beta,
            dividendYield: fallback.dividendYield,
            eps: fallback.eps,
            high52W: fallback.high52W,
            low52W: fallback.low52W,
            quantScore,
            signal,
        };
    }
});

export async function getBatchEnrichedQuotes(symbols: string[]): Promise<EnrichedStockQuote[]> {
    const unique = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
    const results = await Promise.all(unique.map((sym) => getEnrichedStockQuote(sym)));
    return results;
}
