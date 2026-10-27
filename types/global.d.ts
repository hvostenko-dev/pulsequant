import type { Control, FieldError, RegisterOptions, UseFormRegister } from 'react-hook-form';

declare global {
    type SignInFormData = {
        email: string;
        password: string;
    };

    type SignUpFormData = {
        fullName: string;
        email: string;
        password: string;
        country: string;
        investmentGoals: string;
        riskTolerance: string;
        preferredIndustry: string;
    };

    type CountrySelectProps = {
        name: string;
        label: string;
        control: any;
        error?: FieldError;
        required?: boolean;
    };

    type FormInputProps = {
        name: string;
        label: string;
        placeholder: string;
        type?: string;
        register: any;
        error?: FieldError;
        validation?: RegisterOptions;
        disabled?: boolean;
        value?: string;
    };

    type Option = {
        value: string;
        label: string;
    };

    type SelectFieldProps = {
        name: string;
        label: string;
        placeholder: string;
        options: readonly Option[];
        control: any;
        error?: FieldError;
        required?: boolean;
    };

    type FooterLinkProps = {
        text: string;
        linkText: string;
        href: string;
    };

    type SearchCommandProps = {
        renderAs?: 'button' | 'text' | 'pill';
        label?: string;
        initialStocks: StockWithWatchlistStatus[];
        className?: string;
    };

    type WelcomeEmailData = {
        email: string;
        name: string;
        intro: string;
    };

    type User = {
        id: string;
        name: string;
        email: string;
    };

    type Stock = {
        symbol: string;
        name: string;
        exchange: string;
        type: string;
    };

    type StockWithWatchlistStatus = Stock & {
        isInWatchlist: boolean;
    };

    type EnrichedStockQuote = {
        symbol: string;
        name: string;
        sector: string;
        industry: string;
        exchange: string;
        price: number;
        change: number;
        changePercent: number;
        high: number;
        low: number;
        open: number;
        prevClose: number;
        marketCapBillions: number;
        peRatio: number;
        beta: number;
        dividendYield: number;
        eps: number;
        high52W: number;
        low52W: number;
        quantScore: number;
        signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'VOLATILE';
    };

    type FinnhubSearchResult = {
        symbol: string;
        description: string;
        displaySymbol?: string;
        type: string;
    };

    type FinnhubSearchResponse = {
        count: number;
        result: FinnhubSearchResult[];
    };

    type StockDetailsPageProps = {
        params: Promise<{
            symbol: string;
        }>;
    };

    type WatchlistButtonProps = {
        symbol: string;
        company: string;
        isInWatchlist: boolean;
        showTrashIcon?: boolean;
        type?: 'button' | 'icon';
        onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
    };

    type QuoteData = {
        c?: number;
        d?: number;
        dp?: number;
        h?: number;
        l?: number;
        o?: number;
        pc?: number;
    };

    type ProfileData = {
        name?: string;
        ticker?: string;
        finnhubIndustry?: string;
        exchange?: string;
        marketCapitalization?: number;
        logo?: string;
        weburl?: string;
    };

    type FinancialsData = {
        metric?: { [key: string]: number };
    };

    type SelectedStock = {
        symbol: string;
        company: string;
        currentPrice?: number;
    };

    type WatchlistTableProps = {
        watchlist: StockWithData[];
    };

    type StockWithData = {
        userId: string;
        symbol: string;
        company: string;
        addedAt: Date;
        currentPrice?: number;
        changePercent?: number;
        priceFormatted?: string;
        changeFormatted?: string;
        marketCap?: string;
        peRatio?: string;
    };

    type AlertsListProps = {
        alertData: Alert[] | undefined;
    };

    type MarketNewsArticle = {
        id: number;
        headline: string;
        summary: string;
        source: string;
        url: string;
        datetime: number;
        category: string;
        related: string;
        image?: string;
    };

    type WatchlistNewsProps = {
        news?: MarketNewsArticle[];
    };

    type AlertData = {
        symbol: string;
        company: string;
        alertName: string;
        alertType: 'upper' | 'lower';
        threshold: string;
    };

    type AlertModalProps = {
        alertId?: string;
        alertData?: AlertData;
        action?: string;
        open: boolean;
        setOpen: (open: boolean) => void;
    };

    type RawNewsArticle = {
        id: number;
        headline?: string;
        summary?: string;
        source?: string;
        url?: string;
        datetime?: number;
        image?: string;
        category?: string;
        related?: string;
    };

    type Alert = {
        id: string;
        symbol: string;
        company: string;
        alertName: string;
        currentPrice: number;
        alertType: 'upper' | 'lower';
        threshold: number;
        changePercent?: number;
        active?: boolean;
        triggered?: boolean;
        createdAt?: string;
    };

    type PortfolioPositionRecord = {
        id: string;
        symbol: string;
        company: string;
        shares: number;
        avgBuyPrice: number;
        sector: string;
        notes?: string;
        addedAt: string;
    };

    type AIStockAnalysisReport = {
        symbol: string;
        company: string;
        verdict: 'STRONG BUY' | 'ACCUMULATE' | 'HOLD' | 'CAUTIOUS';
        confidenceScore: number;
        targetPrice12M: number;
        upsidePercent: number;
        executiveSummary: string;
        bullCase: string[];
        bearCase: string[];
        catalysts: string[];
        supportLevel: number;
        resistanceLevel: number;
        riskRating: 'Low' | 'Moderate' | 'Elevated' | 'High';
        generatedAt: string;
        source: 'gemini-ai' | 'quant-engine';
    };
}

export {};
