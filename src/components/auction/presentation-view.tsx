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
        <div className="h-screen bg-slate-950 text-white p-4 overflow-hidden font-sans flex flex-col gap-4">

            {/* 1. BROADCAST HEADER */}
            <header className="flex justify-between items-center border-b border-white/10 pb-2">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text py-0.5 tracking-tighter">
                        {state.config.tournamentName}
                    </h1>
                    <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Official Auction Broadcast</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-red-600 rounded-md font-black text-[10px] tracking-tighter flex items-center gap-2 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
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
                                className="flex h-[240px]"
                            >
                                {/* PLAYER INFO (LEFT) */}
                                <div className="w-[40%] p-6 flex items-center gap-6 border-r border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-[0_0_40px_rgba(37,99,235,0.3)] border-4 border-white/10">
                                            {currentPlayer.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="space-y-0.5">
                                            <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                                                {currentPlayer.name}
                                            </h2>
                                            <div className="inline-block bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                                {currentPlayer.role}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0">
                                            <div className="text-slate-500 uppercase text-[9px] font-black tracking-widest">Base Price</div>
                                            <div className="text-2xl font-bold text-emerald-400 font-mono">₹{currentPlayer.basePrice.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* BIDDING INFO (RIGHT) */}
                                <div className="flex-1 p-6 flex flex-col justify-center items-center text-center relative">
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

                                    <div className="relative z-10 space-y-2">
                                        <div className="space-y-0">
                                            <p className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] mb-1">Current Bid</p>
                                            <motion.div
                                                key={currentBid}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-7xl font-black text-white leading-none tabular-nums tracking-tighter glow-text"
                                            >
                                                ₹{currentBid.toLocaleString()}
                                            </motion.div>
                                        </div>

                                        {lastBidder ? (
                                            <motion.div
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-1">Winning Bid by</div>
                                                <div className="px-5 py-1.5 bg-blue-600 rounded-full text-xl font-black text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                                    {lastBidder.name}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-slate-500 text-sm font-bold italic animate-pulse">Waiting for bids...</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center bg-slate-900/20">
                                <div className="text-center space-y-2 opacity-30">
                                    <div className="text-6xl">🏟️</div>
                                    <h2 className="text-xl font-black uppercase tracking-widest">Waiting for next player</h2>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </section>

            {/* 3. TEAM STANDINGS (BOTTOM GRID) */}
            <section className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-500">Team Standings</h3>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scrollbar pb-2">
                    {teams
                        .sort((a, b) => b.remainingBudget - a.remainingBudget)
                        .map((team) => {
                            const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
                            return (
                                <motion.div
                                    layout
                                    key={team.id}
                                    className={`relative group rounded-xl border transition-all duration-300 ${lastBidderTeamId === team.id
                                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                        : 'bg-slate-900/40 border-white/5'
                                        }`}
                                >
                                    <div className="p-3 flex flex-col h-full gap-2">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <h4 className="text-sm font-black uppercase tracking-tight truncate text-white">
                                                    {team.name}
                                                </h4>
                                                <div className="text-[8px] text-slate-500 font-bold uppercase">Purse</div>
                                                <div className="text-base font-black text-emerald-400 leading-none">
                                                    ₹{team.remainingBudget.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-white/20 group-hover:text-white/40">#{teamPlayers.length}</div>
                                            </div>
                                        </div>

                                        {/* COMPACT PLAYER TABLE */}
                                        <div className="bg-black/20 rounded-lg overflow-hidden border border-white/5">
                                            <div className="grid grid-cols-12 px-2 py-1 border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-500 bg-white/5">
                                                <div className="col-span-8">Player</div>
                                                <div className="col-span-4 text-right">Price</div>
                                            </div>
                                            <div className="max-h-[100px] overflow-y-auto custom-scrollbar-mini">
                                                {teamPlayers.length === 0 ? (
                                                    <div className="p-3 text-[9px] text-center text-slate-600 italic">Empty squad</div>
                                                ) : (
                                                    teamPlayers.map(p => (
                                                        <div key={p.id} className="grid grid-cols-12 px-2 py-1 border-b border-white/5 items-center last:border-0 hover:bg-white/5">
                                                            <div className="col-span-8">
                                                                <div className="text-[10px] font-bold text-slate-300 truncate">{p.name}</div>
                                                                <div className="text-[7px] text-slate-500 uppercase">{p.role.split('-')[0]}</div>
                                                            </div>
                                                            <div className="col-span-4 text-right text-[9px] font-black text-blue-400">
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
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                
                .custom-scrollbar-mini::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 10px; }

                .glow-text {
                    text-shadow: 0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(59,130,246,0.2);
                }
            `}</style>
        </div>
    );
}
