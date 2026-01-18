import { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Gavel } from "lucide-react";

interface BidConsoleProps {
    teams: Team[];
    currentBid: number;
    onPlaceBid: (teamId: string, amount: number) => void;
    lastBidderTeamId: string | null;
}

const BID_INCREMENTS = [
    { label: "+ 5L", value: 500000 },
    { label: "+ 10L", value: 1000000 },
    { label: "+ 20L", value: 2000000 },
    { label: "+ 50L", value: 5000000 },
    { label: "+ 1Cr", value: 10000000 },
];

export function BidConsole({ teams, currentBid, onPlaceBid, lastBidderTeamId }: BidConsoleProps) {
    const [selectedIncrement, setSelectedIncrement] = useState(200000); // Default 2L (Fixed default to 2L logic or matches array)
    // Let's match the array default
    const [increment, setIncrement] = useState(2000000); // 20L default

    return (
        <div className="space-y-3">
            {/* Increment Selectors */}
            <div className="flex flex-wrap gap-2 justify-center">
                {BID_INCREMENTS.map((inc) => (
                    <button
                        key={inc.label}
                        onClick={() => setIncrement(inc.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${increment === inc.value
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                    >
                        {inc.label}
                    </button>
                ))}
            </div>

            <div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Next Bid: <span className="text-white font-mono text-sm ml-1">₹{((currentBid + increment) / 100000).toFixed(1)}L</span>
            </div>

            {/* Team Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {teams.map((team) => {
                    const nextBidAmount = currentBid + increment;
                    const canAfford = team.remainingBudget >= nextBidAmount;
                    const isLeading = lastBidderTeamId === team.id;

                    return (
                        <Button
                            key={team.id}
                            onClick={() => onPlaceBid(team.id, nextBidAmount)}
                            disabled={!canAfford || isLeading}
                            variant={isLeading ? "outline" : "default"}
                            className={`h-auto py-2.5 flex flex-col items-center gap-0.5 px-2 ${isLeading
                                ? "border-green-500 text-green-500 opacity-100 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                : canAfford
                                    ? "bg-slate-800 hover:bg-blue-600 hover:scale-105 transition-all text-white border-white/5"
                                    : "opacity-30 cursor-not-allowed bg-slate-900 grayscale"
                                }`}
                        >
                            <span className="font-black text-xs uppercase tracking-tight truncate w-full">{team.name}</span>
                            {canAfford && !isLeading && (
                                <span className="text-[9px] font-bold opacity-50">
                                    +{(increment / 100000).toFixed(0)}L
                                </span>
                            )}
                            {isLeading && <span className="text-[9px] font-black flex items-center gap-1 uppercase tracking-tighter"><Gavel className="w-2.5 h-2.5" /> Bidder</span>}
                            {!canAfford && <span className="text-[9px] text-red-500 font-bold uppercase">No $$</span>}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
