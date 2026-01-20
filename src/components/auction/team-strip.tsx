'use client';

import { Team } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Users, Wallet } from "lucide-react";
import { useAuction } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { validateBid } from "@/lib/validation";
import { AlertCircle } from "lucide-react";

import Image from 'next/image';

interface TeamStripProps {
    teams: Team[];
    lastBidderTeamId: string | null;
    currentBid: number;
}

export function TeamStrip({ teams, lastBidderTeamId, currentBid }: TeamStripProps) {
    const { state } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';

    return (
        <div className="w-full overflow-x-auto pb-2 pt-2 scrollbar-hide px-4 md:px-12">
            <div className="flex gap-3 justify-center min-w-max py-1">
                {teams.map((team) => {
                    const isLeader = lastBidderTeamId === team.id;
                    const displayedBudget = isLeader ? (team.remainingBudget - currentBid) : team.remainingBudget;

                    const activePlayer = state.players.find(p => p.id === state.auction.currentPlayerId);
                    let canBid = true;
                    let blockReason = "";

                    if (activePlayer) {
                        // For the strip, we check against current bid (minimal next possible bid)
                        const validation = validateBid(
                            team,
                            activePlayer,
                            currentBid + 1, // Minimum increment assumption for eligibility check
                            state.config.rules,
                            state.players,
                            state.config.categoryLabels,
                            state.config.categoryOptions
                        );
                        canBid = validation.allowed;
                        blockReason = validation.reason || "";
                    }

                    return (
                        <Card
                            key={team.id}
                            className={`w-[160px] shrink-0 transition-all duration-300 border-white/5 relative group ${isLeader
                                ? "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)] transform scale-105 z-10"
                                : !canBid
                                    ? "bg-slate-900 border-red-500/20 grayscale opacity-40 shadow-none"
                                    : "bg-[#111827] hover:bg-[#1E293B]"
                                }`}
                            title={blockReason}
                        >
                            {!canBid && !isLeader && (
                                <div className="absolute top-2 right-2 z-20">
                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                </div>
                            )}
                            <div className="p-2.5 space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    {team.logoUrl ? (
                                        <div className="relative w-6 h-6 rounded overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                            <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center border border-white/10 text-slate-500 font-bold uppercase text-[10px] shrink-0">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 className={`font-black text-[10px] uppercase tracking-wider truncate flex-1 ${isLeader ? 'text-green-400' : 'text-slate-300'}`}>
                                        {team.name}
                                    </h3>
                                    {isLeader && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-black uppercase tracking-tighter text-[8px]">Purse</span>
                                        <span className={`font-mono transition-colors font-bold ${isLeader ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {formatCurrency(displayedBudget, currencyUnit)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-black uppercase tracking-tighter text-[8px]">Squad</span>
                                        <span className="font-mono text-slate-200 font-bold">{team.players.length}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
