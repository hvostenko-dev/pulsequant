'use client';

import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchCommand from '@/components/SearchCommand';
import { LayoutDashboard, Briefcase, Sparkles, Star, Bell } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
    '/': <LayoutDashboard className="h-4 w-4" />,
    '/portfolio': <Briefcase className="h-4 w-4" />,
    '/screener': <Sparkles className="h-4 w-4" />,
    '/watchlist': <Star className="h-4 w-4" />,
    '/alerts': <Bell className="h-4 w-4" />,
};

interface NavItemsProps {
    initialStocks: StockWithWatchlistStatus[];
    mobile?: boolean;
    onItemClick?: () => void;
}

const NavItems = ({ initialStocks, mobile = false, onItemClick }: NavItemsProps) => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <ul className={mobile ? 'flex flex-col gap-1.5' : 'flex items-center gap-1 xl:gap-2'}>
            {NAV_ITEMS.map(({ href, label }) => {
                if (href === '/search') {
                    if (mobile) {
                        return (
                            <li key="mobile-search-trigger" className="pt-2">
                                <SearchCommand
                                    renderAs="button"
                                    label="Quick Symbol Search (⌘K)"
                                    initialStocks={initialStocks}
                                    className="w-full justify-start text-xs"
                                />
                            </li>
                        );
                    }
                    return null;
                }

                const active = isActive(href);
                const icon = ICONS[href];

                return (
                    <li key={href}>
                        <Link
                            href={href}
                            onClick={onItemClick}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                active
                                    ? 'bg-yellow-400/10 text-yellow-300 shadow-sm border border-yellow-400/20'
                                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                            }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default NavItems;
