'use client';

import { useAuction } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export function PresentationView() {
    const { state } = useAuction();
    const { auction, teams, players } = state;
    const { isAuctionActive, currentPlayerId, currentBid, lastBidderTeamId } = auction;

    const currentPlayer = currentPlayerId ? players.find(p => p.id === currentPlayerId) : null;
    const lastBidder = lastBidderTeamId ? teams.find(t => t.id === lastBidderTeamId) : null;

    return (
        <div className="h-screen bg-slate-950 text-white p-6 overflow-hidden font-sans flex flex-col gap-6">

            {/* 1. BROADCAST HEADER */}
            <header className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex flex-col">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text py-1 tracking-tighter">
                        {state.config.tournamentName}
                    </h1>
                    <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Official Auction Broadcast</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-red-600 rounded-md font-black text-sm tracking-tighter flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        LIVE
                    </div>
                </div>
            </header>

            {/* 2. MAIN AUCTION STAGE (HORIZONTAL BANNER) */}
            <section className="w-full">
                <Card className="bg-slate-900/40 border-white/10 backdrop-blur-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <AnimatePresence mode="wait">
                        {currentPlayer ? (
                            <motion.div
                                key={currentPlayer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex h-[320px]"
                            >
                                {/* PLAYER INFO (LEFT) */}
                                <div className="w-[45%] p-8 flex items-center gap-8 border-r border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent">
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-6xl font-black shadow-[0_0_40px_rgba(37,99,235,0.3)] border-4 border-white/10">
                                            {currentPlayer.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/20 px-3 py-1 rounded-lg text-xs font-bold text-blue-400 uppercase tracking-widest shadow-xl">
                                            {currentPlayer.role.split('-')[0]}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">
                                            {currentPlayer.name}
                                        </h2>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-slate-400 uppercase text-xs font-bold tracking-widest">Base Price</div>
                                            <div className="text-3xl font-bold text-emerald-400">₹{currentPlayer.basePrice.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* BIDDING INFO (RIGHT) */}
                                <div className="flex-1 p-8 flex flex-col justify-center items-center text-center relative">
                                    {/* Pulse Effect Background */}
                                    <AnimatePresence>
                                        {lastBidder && (
                                            <motion.div
                                                key={`pulse-${currentBid}`}
                                                initial={{ opacity: 0.3, scale: 0.8 }}
                                                animate={{ opacity: 0, scale: 1.5 }}
                                                className="absolute inset-0 bg-blue-500/20 z-0"
                                            />
                                        )}
                                    </AnimatePresence>

                                    <div className="relative z-10 space-y-4">
                                        <div className="space-y-0">
                                            <p className="text-slate-500 text-lg font-black uppercase tracking-[0.3em]">Current Bid</p>
                                            <motion.div
                                                key={currentBid}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-9xl font-black text-white leading-none tabular-nums tracking-tighter glow-text"
                                            >
                                                ₹{currentBid.toLocaleString()}
                                            </motion.div>
                                        </div>

                                        {lastBidder ? (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="text-slate-400 uppercase text-sm font-bold tracking-widest mb-1">Winning Bid by</div>
                                                <div className="px-6 py-2 bg-blue-600 rounded-full text-2xl font-black text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                                    {lastBidder.name}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-slate-500 text-xl font-bold italic animate-pulse">Waiting for bids...</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[320px] flex items-center justify-center bg-slate-900/20">
                                <div className="text-center space-y-4 opacity-30">
                                    <div className="text-8xl">🏟️</div>
                                    <h2 className="text-3xl font-black uppercase tracking-widest">Waiting for next player</h2>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </section>

            {/* 3. TEAM STANDINGS (BOTTOM GRID) */}
            <section className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400">Team Standings</h3>
                    <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
                    {teams
                        .sort((a, b) => b.remainingBudget - a.remainingBudget)
                        .map((team) => {
                            const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
                            return (
                                <motion.div
                                    layout
                                    key={team.id}
                                    className={`relative group rounded-2xl border transition-all duration-300 ${lastBidderTeamId === team.id
                                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-900/40 border-white/5'
                                        }`}
                                >
                                    <div className="p-4 flex flex-col h-full gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[60%]">
                                                <h4 className="text-lg font-black uppercase tracking-tight truncate text-white">
                                                    {team.name}
                                                </h4>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Purse Remaining</div>
                                                <div className="text-xl font-black text-emerald-400 leading-none">
                                                    ₹{team.remainingBudget.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-white/20 group-hover:text-white/40 transition-colors">#{teamPlayers.length}</div>
                                            </div>
                                        </div>

                                        {/* COMPACT PLAYER TABLE */}
                                        <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                                            <div className="grid grid-cols-12 px-2 py-1.5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5">
                                                <div className="col-span-8">Player</div>
                                                <div className="col-span-4 text-right">Price</div>
                                            </div>
                                            <div className="max-h-[140px] overflow-y-auto custom-scrollbar-mini">
                                                {teamPlayers.length === 0 ? (
                                                    <div className="p-4 text-[10px] text-center text-slate-600 italic">No squads yet</div>
                                                ) : (
                                                    teamPlayers.map(p => (
                                                        <div key={p.id} className="grid grid-cols-12 px-2 py-1.5 border-b border-white/5 items-center last:border-0 hover:bg-white/5 transition-colors">
                                                            <div className="col-span-8">
                                                                <div className="text-[11px] font-bold text-slate-200 truncate">{p.name}</div>
                                                                <div className="text-[8px] text-slate-500 uppercase">{p.role.split('-')[0]}</div>
                                                            </div>
                                                            <div className="col-span-4 text-right text-[10px] font-black text-blue-400">
                                                                ₹{((p.soldPrice || 0) / 100000).toFixed(1)}L
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                </div>
            </section>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                
                .custom-scrollbar-mini::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }

                .glow-text {
                    text-shadow: 0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(59,130,246,0.3);
                }
            `}</style>
        </div>
    );
}
