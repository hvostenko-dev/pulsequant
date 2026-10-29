import Link from 'next/link';
import Image from 'next/image';
import NavItems from '@/components/NavItems';
import UserDropdown from '@/components/UserDropdown';
import SearchCommand from '@/components/SearchCommand';
import MobileMenu from '@/components/MobileMenu';
import { searchStocks } from '@/lib/actions/finnhub.actions';

const Header = async ({ user }: { user: User }) => {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0B0E]/85 backdrop-blur-xl transition-all">
            <div className="mx-auto flex h-16 max-w-[1440px] 2xl:max-w-[1600px] items-center justify-between gap-2 px-3.5 sm:px-6 lg:px-8">
                {/* Left: Mobile Menu + Brand Logo */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <MobileMenu initialStocks={initialStocks} user={user} />
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <Image
                            src="/assets/icons/logo.svg"
                            alt="PulseQuant Logo"
                            width={148}
                            height={32}
                            priority
                            style={{ width: 'auto' }}
                            className="h-6 sm:h-8 w-auto transition-transform group-hover:scale-[1.02]"
                        />
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden lg:block">
                    <NavItems initialStocks={initialStocks} />
                </nav>

                {/* Right: Search Pill + Live Indicator + User Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <SearchCommand
                        renderAs="pill"
                        label="Quick Search"
                        initialStocks={initialStocks}
                        className="flex"
                    />

                    <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Feed
                    </div>

                    <UserDropdown user={user} initialStocks={initialStocks} />
                </div>
            </div>
        </header>
    );
};

export default Header;
