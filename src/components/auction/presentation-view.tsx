'use client';

import { useAuction } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { useEffect, useRef, useState } from 'react';
import { User, Trophy, XCircle } from 'lucide-react';

export function PresentationView() {
    const { state } = useAuction();
    const { auction, teams, players } = state;
    const { isAuctionActive, currentPlayerId, currentBid, lastBidderTeamId } = auction;

    const currentPlayer = currentPlayerId ? players.find(p => p.id === currentPlayerId) : null;
    const lastBidder = lastBidderTeamId ? teams.find(t => t.id === lastBidderTeamId) : null;
    const currencyUnit = state.config.currencyUnit || 'Lakhs';

    const [showResult, setShowResult] = useState<'sold' | 'unsold' | null>(null);
    const [resultData, setResultData] = useState<{ playerName: string, teamName?: string, price?: number } | null>(null);

    const prevHistoryLen = useRef(auction.history.length);
    const prevPlayers = useRef(players);
    const prevCurrentPlayerId = useRef(currentPlayerId);

    useEffect(() => {
        // Detect SOLD
        if (auction.history.length > prevHistoryLen.current) {
            const latestSold = auction.history[0];
            const player = players.find(p => p.id === latestSold.playerId);
            const team = teams.find(t => t.id === latestSold.soldToTeamId);

            if (player && team) {
                setResultData({
                    playerName: player.name,
                    teamName: team.name,
                    price: latestSold.soldPrice
                });
                setShowResult('sold');
                setTimeout(() => setShowResult(null), 5000);
            }
        }

        // Detect UNSOLD
        const wasActive = prevCurrentPlayerId.current !== null;
        const isInactive = currentPlayerId === null;

        if (wasActive && isInactive && auction.history.length === prevHistoryLen.current) {
            // Player was active, now no player active, and history didn't grow -> Must be Unsold or Cancelled
            // Check if the previously active player is now 'Unsold'
            const lastPlayer = prevPlayers.current.find(p => p.id === prevCurrentPlayerId.current);
            const currentPlayerStatus = players.find(p => p.id === prevCurrentPlayerId.current)?.status;

            if (lastPlayer && currentPlayerStatus === 'Unsold') {
                setResultData({ playerName: lastPlayer.name });
                setShowResult('unsold');
                setTimeout(() => setShowResult(null), 4000);
            }
        }

        prevHistoryLen.current = auction.history.length;
        prevPlayers.current = players;
        prevCurrentPlayerId.current = currentPlayerId;
    }, [auction.history, players, currentPlayerId, teams]);

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
                                            <div className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(currentPlayer.basePrice, currencyUnit)}</div>
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
                                                {formatCurrency(currentBid, currencyUnit)}
                                            </motion.div>
                                        </div>

                                        {lastBidder ? (
                                            <motion.div
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-1">Current Bid by</div>
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
                            <div className="h-[240px] w-full flex items-center justify-center bg-slate-900/20">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="text-7xl animate-bounce mb-2">🏟️</div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Waiting for next player</h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Preparing Stage</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </section>

            {/* 3. RECENT SALES HIGHLIGHTS (NEW SECTION) */}
            <section className="shrink-0">
                <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Recent Sales</h3>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="flex gap-4">
                    {auction.history.slice(0, 2).map((item, idx) => {
                        const p = players.find(player => player.id === item.playerId);
                        const t = teams.find(team => team.id === item.soldToTeamId);
                        if (!p || !t) return null;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={item.playerId}
                                className="flex-1 bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-slate-900/60 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                                    <Trophy className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sold To {t.name}</div>
                                    <div className="text-lg font-black text-white uppercase truncate tracking-tight">{p.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-black text-emerald-400 font-mono">
                                        {formatCurrency(item.soldPrice, currencyUnit)}
                                    </div>
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Final Price</div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {auction.history.length === 0 && (
                        <div className="w-full py-4 text-center border border-dashed border-white/5 rounded-xl text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">
                            No sales recorded in the current session
                        </div>
                    )}
                </div>
            </section>

            {/* 4. TEAM STANDINGS (BOTTOM GRID) */}
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
                                                    {formatCurrency(team.remainingBudget, currencyUnit)}
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
                                                                {formatCurrency(p.soldPrice || 0, currencyUnit)}
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

            {/* CELEBRATION OVERLAY */}
            <AnimatePresence>
                {showResult && resultData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
                    >
                        {showResult === 'sold' ? (
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="relative flex flex-col items-center text-center p-12 rounded-[3rem] border-4 border-yellow-500/30 bg-gradient-to-b from-yellow-500/20 to-transparent shadow-[0_0_100px_rgba(234,179,8,0.2)]"
                            >
                                {/* Decorative Particles */}
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 0, y: 0, opacity: 0 }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 600,
                                            y: (Math.random() - 0.5) * 600,
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0.5]
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="absolute w-2 h-2 rounded-full bg-yellow-400"
                                    />
                                ))}

                                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                                    <Trophy className="w-12 h-12 text-slate-900" />
                                </div>
                                <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-[0.3em] mb-2">Sold</h2>
                                <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
                                    {resultData.playerName}
                                </h1>
                                <div className="space-y-1">
                                    <div className="text-slate-400 uppercase text-xs font-bold tracking-[0.2em]">Acquired by</div>
                                    <div className="px-8 py-3 bg-blue-600 rounded-2xl text-4xl font-black text-white shadow-2xl border-2 border-white/10">
                                        {resultData.teamName}
                                    </div>
                                    <div className="text-4xl font-bold text-emerald-400 font-mono mt-4">
                                        {formatCurrency(resultData.price || 0, currencyUnit)}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex flex-col items-center text-center p-12 rounded-[3rem] border-4 border-red-500/30 bg-gradient-to-b from-red-500/10 to-transparent"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border-2 border-slate-700">
                                    <XCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h2 className="text-xl font-black text-red-500 uppercase tracking-[0.3em] mb-2">Notice</h2>
                                <h1 className="text-6xl font-black text-slate-400 uppercase tracking-tighter mb-4 grayscale">
                                    {resultData.playerName}
                                </h1>
                                <div className="px-6 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-3xl font-black text-slate-500 uppercase tracking-widest rotate-[-2deg]">
                                    Unsold
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

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
