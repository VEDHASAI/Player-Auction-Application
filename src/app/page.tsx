'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Gavel, Settings, Users, Trophy } from 'lucide-react';
import { useAuction } from '@/lib/store';
import { formatCurrency } from '@/lib/format';

export default function Home() {
  const { state } = useAuction();
  const { players, teams } = state;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black tracking-tight bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text glow-text uppercase py-4">
          {state.config.tournamentName}
        </h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-slate-700 animate-pulse">
            Live Tournament Dashboard
          </span>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mb-12">
        <div className="glass-panel p-6 rounded-2xl border-slate-700">
          <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Players Sold</div>
          <div className="text-3xl font-black text-white">{players.filter(p => p.status === 'Sold').length} <span className="text-slate-600 text-lg">/ {players.length}</span></div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700">
          <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Total Spent</div>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(teams.reduce((acc, t) => acc + (t.totalBudget - t.remainingBudget), 0), state.config.currencyUnit)}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700">
          <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Money Remaining</div>
          <div className="text-3xl font-black text-blue-400">{formatCurrency(teams.reduce((acc, t) => acc + t.remainingBudget, 0), state.config.currencyUnit)}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700">
          <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Teams In</div>
          <div className="text-3xl font-black text-purple-400">{teams.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/auction" className="group col-span-1 sm:col-span-2">
            <div className="glass-panel p-8 rounded-2xl h-full transition-all duration-300 hover:scale-[1.01] hover:bg-slate-800/80 border-blue-500/30 hover:border-blue-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Gavel className="w-32 h-32 rotate-12" />
              </div>
              <div className="bg-blue-500/10 p-4 rounded-xl w-fit mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Gavel className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-white">ENTER THE ARENA</h2>
              <p className="text-slate-400 font-medium">Start or continue the bidding process for {players.filter(p => p.status !== 'Sold').length} remaining players.</p>
            </div>
          </Link>

          <Link href="/setup" className="group">
            <div className="glass-panel p-6 rounded-2xl h-full transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/80 border-slate-700 hover:border-white/30">
              <div className="bg-slate-500/10 p-3 rounded-xl w-fit mb-4">
                <Settings className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Setup</h2>
              <p className="text-slate-500 text-sm">Configure teams and players.</p>
            </div>
          </Link>

          <Link href="/teams" className="group">
            <div className="glass-panel p-6 rounded-2xl h-full transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/80 border-slate-700 hover:border-emerald-500/30">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit mb-4">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Teams</h2>
              <p className="text-slate-500 text-sm">View squads and reports.</p>
            </div>
          </Link>
        </div>

        {/* TOP SALES SIDEBAR */}
        <div className="glass-panel rounded-2xl border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Top Sales</span>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {players.filter(p => p.status === 'Sold').sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 5).map((p, i) => {
              const team = teams.find(t => t.id === p.soldToTeamId);
              return (
                <div key={p.id} className="flex justify-between items-center group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-700">#0{i + 1}</span>
                    <div className="flex items-center gap-2">
                      {team?.logoUrl ? (
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500 font-bold uppercase text-[10px] shrink-0">
                          {team?.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-tight">{p.name}</div>
                        <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{team?.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(p.soldPrice || 0, state.config.currencyUnit)}</div>
                </div>
              );
            })}
            {players.filter(p => p.status === 'Sold').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                <Trophy className="w-12 h-12 mb-2" />
                <div className="text-[10px] uppercase font-black tracking-widest">No Sales Yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
