'use server';

import { getEnrichedStockQuote, getNews } from '@/lib/actions/finnhub.actions';

function buildDeterministicQuantReport(
    quote: EnrichedStockQuote,
    news: MarketNewsArticle[]
): AIStockAnalysisReport {
    const isBullish = quote.quantScore >= 75 || quote.changePercent >= 1.0;
    const isDefensive = quote.quantScore < 60 && quote.changePercent < -1.0;

    const verdict: AIStockAnalysisReport['verdict'] =
        quote.quantScore >= 82
            ? 'STRONG BUY'
            : quote.quantScore >= 68
            ? 'ACCUMULATE'
            : isDefensive
            ? 'CAUTIOUS'
            : 'HOLD';

    const upsideMultiplier =
        verdict === 'STRONG BUY'
            ? 1.18
            : verdict === 'ACCUMULATE'
            ? 1.12
            : verdict === 'HOLD'
            ? 1.06
            : 0.98;

    const targetPrice12M = +(quote.price * upsideMultiplier).toFixed(2);
    const upsidePercent = +(((targetPrice12M - quote.price) / quote.price) * 100).toFixed(1);
    const supportLevel = +(Math.min(quote.low, quote.price * 0.93)).toFixed(2);
    const resistanceLevel = +(Math.max(quote.high, quote.price * 1.07, quote.high52W * 0.98)).toFixed(2);

    const riskRating: AIStockAnalysisReport['riskRating'] =
        quote.beta > 2.0 ? 'High' : quote.beta > 1.4 ? 'Elevated' : quote.beta > 0.95 ? 'Moderate' : 'Low';

    const topHeadline = news[0]?.headline || `${quote.name} maintains institutional momentum in ${quote.industry}`;

    return {
        symbol: quote.symbol,
        company: quote.name,
        verdict,
        confidenceScore: quote.quantScore,
        targetPrice12M,
        upsidePercent,
        executiveSummary: `${quote.name} (${quote.symbol}) currently trades at $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%) with a market capitalization of $${quote.marketCapBillions}B and a P/E multiple of ${quote.peRatio}x. Quantitative factor scoring places ${quote.symbol} at ${quote.quantScore}/100 (${verdict}), supported by institutional positioning within ${quote.industry} and a 52-week trading band of $${quote.low52W.toFixed(2)}–$${quote.high52W.toFixed(2)}.`,
        bullCase: [
            `Strong secular positioning in ${quote.industry} with $${quote.marketCapBillions}B scale and EPS of $${quote.eps.toFixed(2)}.`,
            `Technical momentum holds above key institutional support at $${supportLevel.toFixed(2)}, targeting $${resistanceLevel.toFixed(2)} on breakout volume.`,
            `Recent catalyst flow ("${topHeadline.slice(0, 85)}...") reinforces forward revenue visibility.`,
        ],
        bearCase: [
            `Valuation multiple of ${quote.peRatio}x P/E requires sustained earnings beats against macro rate sensitivity.`,
            `Beta of ${quote.beta}x implies ${riskRating.toLowerCase()} volatility during broader index drawdowns or sector rotation.`,
            `A breakdown below $${supportLevel.toFixed(2)} could trigger algorithmic stop-loss cascades toward the 52W mid-band.`,
        ],
        catalysts: [
            `Upcoming quarterly earnings release & forward guidance revision for ${quote.symbol}`,
            `Institutional rebalancing and options gamma positioning near $${Math.round(quote.price / 5) * 5}.00 strike`,
            `Sector-wide capital allocation trends across ${quote.sector}`,
        ],
        supportLevel,
        resistanceLevel,
        riskRating,
        generatedAt: new Date().toISOString(),
        source: 'quant-engine',
    };
}

export async function generateAIStockReport(rawSymbol: string): Promise<AIStockAnalysisReport> {
    const symbol = (rawSymbol || 'NVDA').trim().toUpperCase();
    const [quote, news] = await Promise.all([
        getEnrichedStockQuote(symbol),
        getNews([symbol]),
    ]);

    const fallbackReport = buildDeterministicQuantReport(quote, news);
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        return fallbackReport;
    }

    try {
        const prompt = `You are a Managing Director of Quantitative Equity Research at PulseQuant Terminal.
Analyze the following real-time market data for ${quote.name} (${quote.symbol}) and return ONLY a valid JSON object (no markdown fences, no extra text):

Stock Data:
- Symbol: ${quote.symbol}
- Company: ${quote.name}
- Sector / Industry: ${quote.sector} / ${quote.industry}
- Current Price: $${quote.price} (24h Change: ${quote.changePercent}%)
- 52-Week Range: $${quote.low52W} - $${quote.high52W}
- Market Cap: $${quote.marketCapBillions}B
- P/E Ratio: ${quote.peRatio}x | EPS: $${quote.eps} | Beta: ${quote.beta}
- Baseline Quant Score: ${quote.quantScore}/100
- Recent Headlines: ${news.slice(0, 3).map((n) => n.headline).join(' | ')}

Return JSON matching this exact schema:
{
  "verdict": "STRONG BUY" | "ACCUMULATE" | "HOLD" | "CAUTIOUS",
  "confidenceScore": number (between 45 and 98),
  "targetPrice12M": number,
  "upsidePercent": number,
  "executiveSummary": "2-3 sentences of institutional-grade quantitative and fundamental synthesis",
  "bullCase": ["point 1", "point 2", "point 3"],
  "bearCase": ["point 1", "point 2", "point 3"],
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3"],
  "supportLevel": number,
  "resistanceLevel": number,
  "riskRating": "Low" | "Moderate" | "Elevated" | "High"
}`;

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        responseMimeType: 'application/json',
                    },
                }),
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            return fallbackReport;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) return fallbackReport;

        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            symbol: quote.symbol,
            company: quote.name,
            verdict: parsed.verdict || fallbackReport.verdict,
            confidenceScore: Number(parsed.confidenceScore) || fallbackReport.confidenceScore,
            targetPrice12M: Number(parsed.targetPrice12M) || fallbackReport.targetPrice12M,
            upsidePercent: Number(parsed.upsidePercent) || fallbackReport.upsidePercent,
            executiveSummary: parsed.executiveSummary || fallbackReport.executiveSummary,
            bullCase: Array.isArray(parsed.bullCase) && parsed.bullCase.length > 0 ? parsed.bullCase.slice(0, 3) : fallbackReport.bullCase,
            bearCase: Array.isArray(parsed.bearCase) && parsed.bearCase.length > 0 ? parsed.bearCase.slice(0, 3) : fallbackReport.bearCase,
            catalysts: Array.isArray(parsed.catalysts) && parsed.catalysts.length > 0 ? parsed.catalysts.slice(0, 3) : fallbackReport.catalysts,
            supportLevel: Number(parsed.supportLevel) || fallbackReport.supportLevel,
            resistanceLevel: Number(parsed.resistanceLevel) || fallbackReport.resistanceLevel,
            riskRating: parsed.riskRating || fallbackReport.riskRating,
            generatedAt: new Date().toISOString(),
            source: 'gemini-ai',
        };
    } catch {
        return fallbackReport;
    }
}
