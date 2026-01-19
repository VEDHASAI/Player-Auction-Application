import { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Gavel } from "lucide-react";
import { useAuction } from "@/lib/store";
import { formatCurrency } from "@/lib/format";

interface BidConsoleProps {
    teams: Team[];
    currentBid: number;
    onPlaceBid: (teamId: string, amount: number) => void;
    lastBidderTeamId: string | null;
}


export function BidConsole({ teams, currentBid, onPlaceBid, lastBidderTeamId }: BidConsoleProps) {
    const { state } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';
    const bidIncrements = state.config.bidIncrements || [500000, 1000000, 2000000, 5000000, 10000000];
    const [increment, setIncrement] = useState(bidIncrements[2] || 2000000); // Default to middle increment

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
                                    +{increment >= 10000000 ? (increment / 10000000).toFixed(2) + ' Cr' : increment >= 100000 ? (increment / 100000).toFixed(0) + ' L' : (increment / 1000).toFixed(0) + ' K'}
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
