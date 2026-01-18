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

    // Get sold history (most recent first)
    const recentSales = [...auction.history].slice(0, 3);

    return (
        <div className="h-screen bg-slate-950 text-white p-4 overflow-hidden font-sans">
            <div className="max-w-[1920px] mx-auto h-full grid grid-cols-12 gap-4">

                {/* LEFT COLUMN: Main Auction Stage */}
                <div className="col-span-8 flex flex-col gap-4">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                            {state.config.tournamentName}
                        </h1>
                        <div className="text-xl text-slate-400">
                            Live Auction
                        </div>
                    </header>

                    {/* Main Stage Card */}
                    <Card className="h-[550px] bg-slate-900/50 border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                        <AnimatePresence mode="wait">
                            {currentPlayer ? (
                                <motion.div
                                    key={currentPlayer.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="w-full flex flex-col items-center z-10"
                                >
                                    <div className="w-full flex flex-col items-center justify-center gap-2">
                                        {/* Player Initials/Image Placeholer */}
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-5xl font-black shadow-[0_0_40px_rgba(37,99,235,0.2)] border-2 border-white/10">
                                            {currentPlayer.name.charAt(0)}
                                        </div>

                                        <div className="text-center space-y-1">
                                            <h2 className="text-4xl font-bold tracking-tight text-white">
                                                {currentPlayer.name}
                                            </h2>
                                            <div className="flex gap-2 justify-center">
                                                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700">
                                                    {currentPlayer.role}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 text-sm font-medium border border-emerald-800">
                                                    Base: ₹{currentPlayer.basePrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bidding Area */}
                                    <div className="w-full mt-4 mb-2 bg-slate-950/80 rounded-xl border border-slate-800 p-4 text-center relative overflow-hidden">

                                        {/* Background pulse effect for active bidding */}
                                        {lastBidder && (
                                            <motion.div
                                                key={`pulse-${currentBid}`}
                                                initial={{ opacity: 0.5, scale: 1 }}
                                                animate={{ opacity: 0, scale: 1.5 }}
                                                transition={{ duration: 1 }}
                                                className="absolute inset-0 bg-blue-500/10 z-0"
                                            />
                                        )}

                                        <p className="text-slate-500 text-base font-medium uppercase tracking-wider mb-0 relative z-10">Current Bid</p>
                                        <motion.div
                                            key={`text-${currentBid}`}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="text-6xl font-black text-white relative z-10 tabular-nums tracking-tight"
                                        >
                                            ₹{currentBid.toLocaleString()}
                                        </motion.div>

                                        {lastBidder && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 flex items-center justify-center gap-2 relative z-10"
                                            >
                                                <span className="text-slate-400 text-lg">Held by</span>
                                                <span className="text-xl font-bold text-blue-400">
                                                    {lastBidder.name}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-center space-y-4 opacity-50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                >
                                    <div className="text-7xl">⏳</div>
                                    <h2 className="text-2xl font-bold">Waiting for next player...</h2>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recent Activity/Sold Overlay */}
                        <AnimatePresence>
                            {!isAuctionActive && recentSales.length > 0 && !currentPlayer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20"
                                >
                                    <div className="text-center p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full">
                                        <h3 className="text-xl font-bold text-slate-400 mb-4">Recently Sold</h3>
                                        {(() => {
                                            const lastSale = recentSales[0];
                                            const player = players.find(p => p.id === lastSale.playerId);
                                            const team = teams.find(t => t.id === lastSale.soldToTeamId);
                                            if (!player || !team) return null;

                                            return (
                                                <div className="space-y-4">
                                                    <div className="text-4xl font-black text-white">{player.name}</div>
                                                    <div className="text-xl text-slate-400">sold to</div>
                                                    <div className="text-3xl font-bold text-blue-400">{team.name}</div>
                                                    <div className="text-2xl font-bold text-emerald-400 mt-2">₹{lastSale.soldPrice.toLocaleString()}</div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Team Standings */}
                <div className="col-span-4 flex flex-col h-full overflow-hidden">
                    <h3 className="text-2xl font-bold text-slate-300 mb-6 px-2">Team Standings</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {teams
                            .sort((a, b) => b.remainingBudget - a.remainingBudget)
                            .map((team, index) => (
                                <motion.div
                                    layout
                                    key={team.id}
                                    className={`p-6 rounded-2xl border ${lastBidderTeamId === team.id
                                        ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-105 ml-2 mr-2'
                                        : 'bg-slate-900/60 border-slate-800'
                                        } transition-all duration-300`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className={`text-xl font-bold ${lastBidderTeamId === team.id ? 'text-blue-400' : 'text-white'}`}>
                                                {team.name}
                                            </h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {team.players.length} players
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-emerald-400">
                                                ₹{team.remainingBudget.toLocaleString()}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Available</p>
                                        </div>
                                    </div>
                                    {/* Slots Indicator */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: 15 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full ${i < team.players.length
                                                    ? 'bg-blue-500'
                                                    : 'bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
