import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "PulseQuant — Institutional AI Market Intelligence & Portfolio Terminal",
        template: "%s | PulseQuant Terminal",
    },
    description:
        "Institutional-grade stock market analytics terminal, real-time portfolio & paper-trading simulator, smart price alerts, and Gemini AI equity research copilot.",
    keywords: [
        "PulseQuant",
        "Stock Market Terminal",
        "AI Stock Analyst",
        "Portfolio Tracker",
        "Quantitative Analytics",
        "TradingView",
        "Finnhub",
    ],
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#050505",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body suppressHydrationWarning
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-gray-200 selection:bg-yellow-400/30 selection:text-yellow-200 overflow-x-hidden`}
            >
                {children}
                <Toaster richColors position="bottom-right" />
            </body>
        </html>
    );
}
