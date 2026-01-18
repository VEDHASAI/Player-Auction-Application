import { Team } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Users, Wallet } from "lucide-react";

interface TeamStripProps {
    teams: Team[];
    lastBidderTeamId: string | null;
    currentBid: number;
}

export function TeamStrip({ teams, lastBidderTeamId, currentBid }: TeamStripProps) {
    return (
        <div className="w-full overflow-x-auto pb-4 pt-2">
            <div className="flex gap-4 min-w-max px-2">
                {teams.map((team) => {
                    const isLeader = lastBidderTeamId === team.id;
                    const displayedBudget = isLeader ? (team.remainingBudget - currentBid) : team.remainingBudget;

                    return (
                        <Card
                            key={team.id}
                            className={`w-[200px] flex-shrink-0 transition-all duration-300 ${isLeader
                                ? "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-105"
                                : "bg-[#111827] hover:bg-[#1E293B]"
                                }`}
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-bold truncate ${isLeader ? 'text-green-400' : 'text-slate-200'}`}>
                                        {team.name}
                                    </h3>
                                    {isLeader && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Rem.</span>
                                        <span className={`font-mono transition-colors ${isLeader ? 'text-yellow-400 font-bold' : 'text-slate-200'}`}>
                                            ₹{(displayedBudget / 10000000).toFixed(2)} Cr
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Squad</span>
                                        <span className="font-mono text-slate-200">{team.players.length}</span>
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
