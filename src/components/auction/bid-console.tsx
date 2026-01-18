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
        <div className="space-y-6">
            {/* Increment Selectors */}
            <div className="flex flex-wrap gap-2 justify-center">
                {BID_INCREMENTS.map((inc) => (
                    <button
                        key={inc.label}
                        onClick={() => setIncrement(inc.value)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${increment === inc.value
                                ? "bg-blue-600 text-white shadow-lg scale-105"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                    >
                        {inc.label}
                    </button>
                ))}
            </div>

            <div className="text-center text-slate-400 text-sm">
                Next Bid: <span className="text-white font-mono">₹{((currentBid + increment) / 100000).toFixed(2)} Lakhs</span>
            </div>

            {/* Team Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            className={`h-auto py-4 flex flex-col items-center gap-1 ${isLeading
                                    ? "border-green-500 text-green-500 opacity-100" // Leading team styling
                                    : canAfford
                                        ? "bg-slate-800 hover:bg-blue-600 hover:scale-105 transition-all"
                                        : "opacity-30 cursor-not-allowed bg-slate-900"
                                }`}
                        >
                            <span className="font-bold text-lg">{team.name}</span>
                            {canAfford && !isLeading && (
                                <span className="text-xs font-normal opacity-70">
                                    Bid ₹{(nextBidAmount / 100000).toFixed(0)}L
                                </span>
                            )}
                            {isLeading && <span className="text-xs font-bold flex items-center gap-1"><Gavel className="w-3 h-3" /> Leading</span>}
                            {!canAfford && <span className="text-xs text-red-400">No Budget</span>}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
