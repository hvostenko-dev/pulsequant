import Link from "next/link";
import Image from "next/image";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import { Star, ShieldCheck, Zap } from "lucide-react";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user) {
        redirect("/");
    }

    return (
        <main className="min-h-screen flex flex-col lg:flex-row bg-[#08090C] text-gray-200">
            {/* Left form section */}
            <section className="w-full lg:w-[48%] xl:w-[42%] min-h-screen flex flex-col justify-between px-5 sm:px-10 lg:px-14 xl:px-16 py-6 sm:py-8">
                <div>
                    <Link href="/" className="inline-block mb-7 sm:mb-10 group">
                        <Image
                            src="/assets/icons/logo.svg"
                            alt="PulseQuant Logo"
                            width={160}
                            height={36}
                            priority
                            style={{ width: "auto" }}
                            className="h-7 sm:h-8 w-auto transition-transform group-hover:scale-[1.02]"
                        />
                    </Link>
                    <div className="max-w-md w-full mx-auto lg:mx-0">{children}</div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>© {new Date().getFullYear()} PulseQuant Terminal</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> End-to-End Encrypted
                    </span>
                </div>
            </section>

            {/* Right showcase section */}
            <section className="hidden lg:flex w-[52%] xl:w-[58%] min-h-screen bg-gradient-to-br from-[#12141A] to-[#0A0B0E] border-l border-white/10 p-10 xl:p-16 flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-yellow-400/10 blur-[140px]" />
                <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]" />

                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300 mb-6">
                        <Zap className="h-3.5 w-3.5" />
                        Institutional Equity Intelligence
                    </div>

                    <blockquote className="text-xl xl:text-2xl font-medium text-gray-200 leading-snug">
                        &ldquo;PulseQuant replaced three fragmented market terminals for our desk. The combination of real-time TradingView charting, paper-trading risk analysis, and Gemini AI catalyst synthesis gives us an unfair edge.&rdquo;
                    </blockquote>

                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <cite className="font-bold text-white not-italic text-sm">
                                Alexander M.
                            </cite>
                            <p className="text-xs text-gray-400">
                                Senior Quantitative Portfolio Manager
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="h-4 w-4 fill-yellow-400" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dashboard graphic preview */}
                <div className="relative z-10 mt-10 rounded-2xl border border-white/15 bg-black/60 p-3 shadow-2xl backdrop-blur">
                    <Image
                        src="/assets/images/dashboard-preview.png"
                        alt="PulseQuant Terminal Preview"
                        width={1024}
                        height={640}
                        priority
                        style={{ height: "auto" }}
                        className="rounded-xl border border-white/10 w-full h-auto object-cover"
                    />
                </div>
            </section>
        </main>
    );
};

export default AuthLayout;
