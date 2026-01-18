import { Player } from "@/lib/types";
import { User, Shield, Tent, Target } from "lucide-react";

interface PlayerSpotlightProps {
    player: Player;
    currentBid: number;
}

export function PlayerSpotlight({ player, currentBid }: PlayerSpotlightProps) {
    const RoleIcon = () => {
        switch (player.role) {
            case 'Batsman': return <Target className="w-6 h-6 text-red-400" />;
            case 'Bowler': return <Shield className="w-6 h-6 text-blue-400" />;
            case 'All-Rounder': return <Tent className="w-6 h-6 text-purple-400" />; // "Tent" as placeholder for All-rounder icon
            default: return <User className="w-6 h-6 text-gray-400" />;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4 glass-panel rounded-2xl border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            {/* Image Placeholder */}
            <div className="w-32 h-32 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                {player.imageUrl ? (
                    <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-24 h-24 text-slate-500" />
                )}
            </div>

            {/* Details */}
            <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 uppercase tracking-wider text-sm font-semibold">
                        <RoleIcon />
                        {player.role}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white glow-text">{player.name}</h1>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                        <div className="text-slate-500 text-sm font-medium">Base Price</div>
                        <div className="text-2xl text-slate-300 font-mono">₹{(player.basePrice / 100000).toFixed(2)}L</div>
                    </div>
                    <div>
                        <div className="text-blue-400 text-sm font-medium">Current Bid</div>
                        <div className="text-4xl md:text-5xl text-white font-mono font-bold leading-none">
                            ₹{(currentBid / 100000).toFixed(2)}L
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
