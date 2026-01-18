'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Settings, Gavel, Users, Home as HomeIcon, Sliders } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

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
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                        AUCTION<span className="text-white">HERE</span>
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
                </nav>
            </div>
        </header>
    );
}
