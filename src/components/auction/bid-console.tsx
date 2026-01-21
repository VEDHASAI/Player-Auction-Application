'use client';

import { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Gavel, AlertCircle } from "lucide-react";
import { useAuction } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { validateBid } from "@/lib/validation";

interface BidConsoleProps {
    teams: Team[];
    currentBid: number;
    onPlaceBid: (teamId: string, amount: number) => void;
    lastBidderTeamId: string | null;
    bidIncrements?: number[]; // The available increment slots
    preferredIncrement?: number; // The slot that should be selected by default
}


export function BidConsole({ teams, currentBid, onPlaceBid, lastBidderTeamId, bidIncrements: propBidIncrements, preferredIncrement }: BidConsoleProps) {
    const { state } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';

    // Always show all 5 slots from global config, or propBidIncrements if a full custom list (>1) is provided
    const allIncrements = state.config.bidIncrements || [500000, 1000000, 2000000, 5000000, 10000000];
    const bidIncrements = (propBidIncrements && propBidIncrements.length > 1) ? propBidIncrements : allIncrements;

    // Determine the initial increment selection:
    const getInitialIncrement = () => {
        // 1. Explicit preferred increment prop
        if (preferredIncrement !== undefined && bidIncrements.includes(preferredIncrement)) return preferredIncrement;
        // 2. If propBidIncrements has exactly one element, treat it as the "Slot X only" preference from settings
        if (propBidIncrements && propBidIncrements.length === 1) return propBidIncrements[0];
        // 3. Fallback to middle slot (index 2)
        return bidIncrements[2] || bidIncrements[0] || 2000000;
    };

    const [increment, setIncrement] = useState(getInitialIncrement());

    return (
        <div className="space-y-3">
            {/* Increment Selectors */}
            <div className="flex flex-wrap gap-2 justify-center">
                {bidIncrements.map((val, idx) => {
                    let label = "";
                    if (val >= 10000000) label = `+ ${(val / 10000000).toFixed(1)}Cr`;
                    else if (val >= 100000) label = `+ ${(val / 100000).toFixed(1)}L`;
                    else label = `+ ${(val / 1000).toFixed(0)}K`;

                    return (
                        <button
                            key={idx}
                            onClick={() => setIncrement(val)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${increment === val
                                ? "bg-blue-600 text-white shadow-lg scale-105"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Next Bid: <span className="text-white font-mono text-sm ml-1">{formatCurrency(currentBid + increment, currencyUnit)}</span>
            </div>

            {/* Team Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {teams.map((team) => {
                    const nextBidAmount = currentBid + increment;
                    const isLeading = lastBidderTeamId === team.id;

                    const activePlayer = state.players.find(p => p.id === state.auction.currentPlayerId);

                    let canBid = true;
                    let blockReason = "";

                    if (activePlayer) {
                        const validation = validateBid(
                            team,
                            activePlayer,
                            nextBidAmount,
                            state.config.rules || {},
                            state.players,
                            state.config.categoryLabels,
                            state.config.categoryOptions
                        );
                        canBid = validation.allowed;
                        blockReason = validation.reason || "";
                    }

                    return (
                        <Button
                            key={team.id}
                            onClick={() => onPlaceBid(team.id, nextBidAmount)}
                            disabled={!canBid || isLeading}
                            variant={isLeading ? "outline" : "default"}
                            className={`h-auto py-2.5 flex flex-col items-center gap-0.5 px-2 ${isLeading
                                ? "border-green-500 text-green-500 opacity-100 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                : canBid
                                    ? "bg-slate-800 hover:bg-blue-600 hover:scale-105 transition-all text-white border-white/5"
                                    : "opacity-30 cursor-not-allowed bg-slate-900 grayscale"
                                }`}
                            title={blockReason}
                        >
                            <span className="font-black text-xs uppercase tracking-tight truncate w-full">{team.name}</span>
                            {canBid && !isLeading && (
                                <span className="text-[9px] font-bold opacity-50">
                                    +{increment >= 10000000 ? (increment / 10000000).toFixed(2) + ' Cr' : increment >= 100000 ? (increment / 100000).toFixed(1) + ' L' : (increment / 1000).toFixed(0) + ' K'}
                                </span>
                            )}
                            {isLeading && <span className="text-[9px] font-black flex items-center gap-1 uppercase tracking-tighter"><Gavel className="w-2.5 h-2.5" /> Bidder</span>}
                            {!canBid && !isLeading && <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter line-clamp-1">Ineligible</span>}
                        </Button>
                    );
                })}
            </div>
            {/* Eligibility Warnings */}
            {teams.some(t => {
                const activePlayer = state.players.find(p => p.id === state.auction.currentPlayerId);
                if (!activePlayer) return false;
                const v = validateBid(t, activePlayer, currentBid + increment, state.config.rules || {}, state.players, state.config.categoryLabels, state.config.categoryOptions);
                return !v.allowed && lastBidderTeamId !== t.id;
            }) && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Eligibility Warnings
                        </div>
                        <div className="flex flex-wrap gap-2 text-[9px] text-slate-400">
                            {teams.filter(t => {
                                const activePlayer = state.players.find(p => p.id === state.auction.currentPlayerId);
                                if (!activePlayer) return false;
                                const v = validateBid(t, activePlayer, currentBid + increment, state.config.rules || {}, state.players, state.config.categoryLabels, state.config.categoryOptions);
                                return !v.allowed && lastBidderTeamId !== t.id;
                            }).map(t => {
                                const activePlayer = state.players.find(p => p.id === state.auction.currentPlayerId);
                                const v = validateBid(t, activePlayer!, currentBid + increment, state.config.rules || {}, state.players, state.config.categoryLabels, state.config.categoryOptions);
                                return (
                                    <div key={t.id} className="bg-slate-900/50 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 leading-none">
                                        <span className="font-black text-slate-200">{t.name}:</span>
                                        <span className="text-red-400/80 italic font-medium">{v.reason}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
        </div>
    );
}
