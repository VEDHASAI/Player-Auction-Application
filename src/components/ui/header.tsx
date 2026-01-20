'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Settings, Gavel, Users, Home as HomeIcon, Sliders } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

import Image from 'next/image';

export function Header() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Setup', href: '/setup', icon: Sliders },
        { name: 'Auction Arena', href: '/auction', icon: Gavel },
        { name: 'Teams', href: '/teams', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-xl supports-backdrop-filter:bg-slate-900/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-md" />
                    <span className="font-bold text-lg tracking-tight py-1">
                        <span className="text-[#61BE35]">TCL</span>
                        <span className="text-white">AUCTION</span>
                    </span>
                </div>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.name}</span>
                            </Link>
                        );
                    })}
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <Link
                        href="/presentation"
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(e.currentTarget.href, 'Presentation', 'width=1920,height=1080');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Spectator View</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
