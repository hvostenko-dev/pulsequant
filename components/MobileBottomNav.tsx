'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    Sparkles,
    Star,
    Bell,
} from 'lucide-react';

const TABS = [
    { href: '/', label: 'Terminal', icon: LayoutDashboard },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/screener', label: 'Screener', icon: Sparkles },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
    { href: '/alerts', label: 'Alerts', icon: Bell },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav
            aria-label="Mobile Bottom Navigation"
            className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-[#08090C]/95 px-1.5 backdrop-blur-xl lg:hidden"
        >
            {TABS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] sm:text-[11px] font-semibold transition-colors ${
                            active
                                ? 'text-yellow-300'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {active && (
                            <span className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(253,212,88,0.8)]" />
                        )}
                        <Icon
                            className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${
                                active ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                        />
                        <span className="truncate">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
