'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import NavItems from '@/components/NavItems';

interface MobileMenuProps {
    initialStocks: StockWithWatchlistStatus[];
    user: User;
}

export default function MobileMenu({ initialStocks, user }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open mobile navigation"
                    className="h-9 w-9 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 hover:text-white lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-y-0 left-0 top-0 translate-x-0 translate-y-0 z-50 h-full w-[84vw] max-w-xs rounded-none rounded-r-2xl border-r border-white/10 bg-[#0C0E12] p-5 text-gray-200 shadow-2xl transition ease-in-out sm:max-w-sm">
                <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
                    <DialogTitle className="flex items-center gap-2">
                        <Image
                            src="/assets/icons/logo.svg"
                            alt="PulseQuant Logo"
                            width={130}
                            height={28}
                            style={{ width: 'auto' }}
                            className="h-7 w-auto"
                        />
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex flex-col justify-between h-[calc(100%-80px)]">
                    <div className="space-y-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Terminal Navigation
                        </p>
                        <NavItems
                            initialStocks={initialStocks}
                            mobile
                            onItemClick={() => setOpen(false)}
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="truncate text-gray-400">{user.email}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-emerald-400">
                            ● Market Data Feed Active
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
