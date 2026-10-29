import Header from "@/components/Header";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import MobileBottomNav from "@/components/MobileBottomNav";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) redirect("/sign-in");

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-gray-300 pb-16 lg:pb-0">
            <Header user={user} />
            <KeyboardShortcuts />

            <main className="flex-1 mx-auto w-full max-w-[1440px] 2xl:max-w-[1600px] px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {children}
            </main>

            <footer className="border-t border-white/10 bg-[#08090C] py-8 text-xs text-gray-500">
                <div className="mx-auto max-w-[1440px] 2xl:max-w-[1600px] px-3.5 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                        <Image
                            src="/assets/icons/logo.svg"
                            alt="PulseQuant Logo"
                            width={130}
                            height={28}
                            style={{ width: "auto" }}
                            className="h-6 w-auto opacity-80"
                        />
                        <span className="hidden sm:inline">•</span>
                        <span>Institutional Market Intelligence Terminal</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-400">
                        <Link href="/" className="hover:text-yellow-400 transition-colors">Terminal</Link>
                        <Link href="/portfolio" className="hover:text-yellow-400 transition-colors">Portfolio</Link>
                        <Link href="/screener" className="hover:text-yellow-400 transition-colors">Screener & AI</Link>
                        <Link href="/watchlist" className="hover:text-yellow-400 transition-colors">Watchlist</Link>
                        <Link href="/alerts" className="hover:text-yellow-400 transition-colors">Alerts</Link>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Finnhub & TradingView Ingest Live
                    </div>
                </div>
            </footer>

            <MobileBottomNav />
        </div>
    );
};

export default Layout;
