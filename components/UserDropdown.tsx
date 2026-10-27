'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Briefcase, Bell, Star, ShieldCheck } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.actions';
import Link from 'next/link';

interface UserDropdownProps {
    user: User;
    initialStocks: StockWithWatchlistStatus[];
}

const UserDropdown = ({ user }: UserDropdownProps) => {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
        router.refresh();
    };

    const initials = user.name
        ? user.name
              .trim()
              .split(/\s+/)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 hover:border-yellow-400/30 hover:bg-white/[0.08]"
                >
                    <Avatar className="h-7 w-7 border border-yellow-400/30">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-600 text-xs font-black text-black">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[120px] truncate text-xs font-semibold text-gray-200 lg:inline">
                        {user.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-[#12141A] p-2 text-gray-200 shadow-2xl backdrop-blur-xl"
            >
                <DropdownMenuLabel className="p-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-yellow-400/30">
                            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-600 text-sm font-black text-black">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-bold text-white">
                                {user.name}
                            </span>
                            <span className="truncate text-[11px] text-gray-400">
                                {user.email}
                            </span>
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                                <ShieldCheck className="h-3 w-3" /> Institutional Member
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem asChild>
                    <Link
                        href="/portfolio"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <Briefcase className="h-3.5 w-3.5 text-yellow-400" />
                        <span>Portfolio Simulator</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/watchlist"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        <span>My Watchlist</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/alerts"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <Bell className="h-3.5 w-3.5 text-blue-400" />
                        <span>Alerts Center</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
