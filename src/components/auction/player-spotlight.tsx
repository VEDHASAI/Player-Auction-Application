import { Player } from "@/lib/types";
import { User, Shield, Tent, Target } from "lucide-react";
import { useAuction } from "@/lib/store";
import { formatCurrency } from "@/lib/format";

interface PlayerSpotlightProps {
    player: Player;
    currentBid: number;
}

export function PlayerSpotlight({ player, currentBid }: PlayerSpotlightProps) {
    const { state } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';

    const RoleIcon = () => {
        switch (player.role) {
            case 'Batsman': return <Target className="w-6 h-6 text-red-400" />;
            case 'Bowler': return <Shield className="w-6 h-6 text-blue-400" />;
            case 'All-Rounder': return <Tent className="w-6 h-6 text-purple-400" />; // "Tent" as placeholder for All-rounder icon
            default: return <User className="w-6 h-6 text-gray-400" />;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-3 glass-panel rounded-2xl border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            {/* Image Placeholder */}
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                {player.imageUrl ? (
                    <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-16 h-16 text-slate-500" />
                )}
            </div>

            {/* Details */}
            <div className="text-center md:text-left space-y-2">
                <div className="space-y-0">
                    <div className="flex items-center justify-center md:justify-start gap-1 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                        {player.role}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white glow-text leading-tight">{player.name}</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                        <div className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Base Price</div>
                        <div className="text-xl text-slate-300 font-mono">{formatCurrency(player.basePrice, currencyUnit)}</div>
                    </div>
                    <div>
                        <div className="text-blue-400 text-[10px] font-medium uppercase tracking-widest">Current Bid</div>
                        <div className="text-3xl md:text-4xl text-white font-mono font-bold leading-none">
                            {formatCurrency(currentBid, currencyUnit)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
