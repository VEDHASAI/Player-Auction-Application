'use client';

import Link from 'next/link';
import { Gavel, Settings, Users, Trophy } from 'lucide-react';

import { useAuction } from '@/lib/store';

export default function Home() {
  const { state } = useAuction();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text glow-text uppercase">
          {state.config.tournamentName}
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          Manage teams, players, and run a high-stakes auction in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link href="/setup" className="group">
          <div className="glass-panel p-8 rounded-2xl h-full transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/80 border-slate-700 hover:border-blue-500/50">
            <div className="bg-blue-500/10 p-4 rounded-xl w-fit mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Settings className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Setup & Config</h2>
            <p className="text-slate-400">Add teams, import players, and set auction parameters.</p>
          </div>
        </Link>

        <Link href="/auction" className="group">
          <div className="glass-panel p-8 rounded-2xl h-full transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/80 border-slate-700 hover:border-purple-500/50">
            <div className="bg-purple-500/10 p-4 rounded-xl w-fit mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Gavel className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">The Arena</h2>
            <p className="text-slate-400">Live auction interface. Bidding wars happen here.</p>
          </div>
        </Link>

        <Link href="/teams" className="group">
          <div className="glass-panel p-8 rounded-2xl h-full transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/80 border-slate-700 hover:border-emerald-500/50">
            <div className="bg-emerald-500/10 p-4 rounded-xl w-fit mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Teams & Squads</h2>
            <p className="text-slate-400">View final squads, remaining budgets, and stats.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
