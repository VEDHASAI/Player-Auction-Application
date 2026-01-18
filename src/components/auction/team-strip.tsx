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
        <div className="w-full overflow-x-auto pb-2 pt-1 scrollbar-hide">
            <div className="flex gap-3 min-w-max px-2">
                {teams.map((team) => {
                    const isLeader = lastBidderTeamId === team.id;
                    const displayedBudget = isLeader ? (team.remainingBudget - currentBid) : team.remainingBudget;

                    return (
                        <Card
                            key={team.id}
                            className={`w-[150px] flex-shrink-0 transition-all duration-300 border-white/5 ${isLeader
                                ? "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)] transform scale-105"
                                : "bg-[#111827] hover:bg-[#1E293B]"
                                }`}
                        >
                            <div className="p-2.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-black text-xs truncate ${isLeader ? 'text-green-400' : 'text-slate-300'}`}>
                                        {team.name}
                                    </h3>
                                    {isLeader && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-bold uppercase tracking-tighter">Rem.</span>
                                        <span className={`font-mono transition-colors font-bold ${isLeader ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            ₹{(displayedBudget / 10000000).toFixed(2)} Cr
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">Players</span>
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
