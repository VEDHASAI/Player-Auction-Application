'use client';

import { Player } from "@/lib/types";
import { User, Shield, Tent, Target } from "lucide-react";
import { useAuction } from "@/lib/store";
import { formatCurrency, getEffectiveBasePrice } from "@/lib/format";

interface PlayerSpotlightProps {
    player: Player;
    currentBid: number;
}

export function PlayerSpotlight({ player, currentBid }: PlayerSpotlightProps) {
    const { state } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-3 glass-panel rounded-2xl border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            {/* Image Placeholder */}
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-linear-to-br from-slate-700 to-slate-900 border-4 border-slate-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
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
                    {player.categories && Object.entries(player.categories).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(player.categories).map(([label, val]) => (
                                <span key={label} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest">
                                    {val}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                        <div className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Base Price</div>
                        <div className="text-xl text-slate-300 font-mono">
                            {formatCurrency(getEffectiveBasePrice(player, state.config.rules || {}), currencyUnit)}
                        </div>
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
