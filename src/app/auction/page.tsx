'use client';

import { useState } from "react";
import { useAuction } from "@/lib/store";
import { TeamStrip } from "@/components/auction/team-strip";
import { BidConsole } from "@/components/auction/bid-console";
import { PlayerSpotlight } from "@/components/auction/player-spotlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gavel, XCircle, CheckCircle2, User, RotateCcw, Search, ChevronLeft } from "lucide-react";
import { Player, ROLES } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AuctionPage() {
    const { state, dispatch } = useAuction();
    const { auction, players, teams } = state;

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const activePlayer = players.find(p => p.id === auction.currentPlayerId);

    const unsoldPlayers = players
        .filter(p => {
            // Show both Available and Unsold (passed) players
            const isAvailable = p.status === 'Available' || p.status === 'Unsold';
            if (!isAvailable) return false;

            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "All" || p.role === roleFilter;

            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            // Sort by Status: Available first, then Unsold
            if (a.status === b.status) return 0;
            return a.status === 'Available' ? -1 : 1;
        });

    // Calculate total strength (ignoring filters)
    const totalWaitingCount = players.filter(p => p.status === 'Available' || p.status === 'Unsold').length;

    // HANDLERS
    const startAuction = (playerId: string) => {
        dispatch({ type: 'START_AUCTION_FOR_PLAYER', payload: playerId });
    };

    const placeBid = (teamId: string, amount: number) => {
        const team = teams.find(t => t.id === teamId);
        if (!team || !activePlayer) return;

        const rules = state.config.rules;
        const playersInTeam = team.players.map(pId => players.find(p => p.id === pId)).filter(Boolean) as Player[];

        // 1. Max Players Check
        if (rules.maxPlayers && team.players.length >= rules.maxPlayers) {
            alert(`Rule Violation: Team ${team.name} already has the maximum of ${rules.maxPlayers} players.`);
            return;
        }

        // 2. Role Specific Max Check
        const role = activePlayer.role;
        const roleCounts = {
            'Batsman': playersInTeam.filter(p => p.role === 'Batsman').length,
            'Bowler': playersInTeam.filter(p => p.role === 'Bowler').length,
            'All-Rounder': playersInTeam.filter(p => p.role === 'All-Rounder').length,
            'Wicket Keeper': playersInTeam.filter(p => p.role === 'Wicket Keeper').length,
        };

        if (role === 'Batsman' && rules.maxBatsmen && roleCounts['Batsman'] >= rules.maxBatsmen) {
            alert(`Rule Violation: Team ${team.name} already has the maximum of ${rules.maxBatsmen} Batsmen.`);
            return;
        }
        if (role === 'Bowler' && rules.maxBowlers && roleCounts['Bowler'] >= rules.maxBowlers) {
            alert(`Rule Violation: Team ${team.name} already has the maximum of ${rules.maxBowlers} Bowlers.`);
            return;
        }
        if (role === 'All-Rounder' && rules.maxAllRounders && roleCounts['All-Rounder'] >= rules.maxAllRounders) {
            alert(`Rule Violation: Team ${team.name} already has the maximum of ${rules.maxAllRounders} All-Rounders.`);
            return;
        }
        if (role === 'Wicket Keeper' && rules.maxWicketKeepers && roleCounts['Wicket Keeper'] >= rules.maxWicketKeepers) {
            alert(`Rule Violation: Team ${team.name} already has the maximum of ${rules.maxWicketKeepers} Wicket Keepers.`);
            return;
        }

        // 3. Minimum Requirements "Impossible" Check
        // If there's a Max Players limit, we must ensure enough slots remain for other mandatory role minimums
        if (rules.maxPlayers) {
            const slotsAfterThis = rules.maxPlayers - (team.players.length + 1);

            // Calculate how many MORE of each OTHER role is mandatory
            let mandatoryOtherRoles = 0;

            // Check Batsmen min (if not the current player being bid on)
            if (rules.minBatsmen) {
                const current = role === 'Batsman' ? roleCounts['Batsman'] + 1 : roleCounts['Batsman'];
                mandatoryOtherRoles += Math.max(0, rules.minBatsmen - current);
            }
            // Check Bowlers min
            if (rules.minBowlers) {
                const current = role === 'Bowler' ? roleCounts['Bowler'] + 1 : roleCounts['Bowler'];
                mandatoryOtherRoles += Math.max(0, rules.minBowlers - current);
            }
            // Check All-Rounders min
            if (rules.minAllRounders) {
                const current = role === 'All-Rounder' ? roleCounts['All-Rounder'] + 1 : roleCounts['All-Rounder'];
                mandatoryOtherRoles += Math.max(0, rules.minAllRounders - current);
            }
            // Check Wicket Keepers min
            if (rules.minWicketKeepers) {
                const current = role === 'Wicket Keeper' ? roleCounts['Wicket Keeper'] + 1 : roleCounts['Wicket Keeper'];
                mandatoryOtherRoles += Math.max(0, rules.minWicketKeepers - current);
            }

            if (mandatoryOtherRoles > slotsAfterThis) {
                alert(`Rule Violation: Buying this ${role} leaves only ${slotsAfterThis} slots, but you still need ${mandatoryOtherRoles} more players of other roles to meet the minimum requirements.`);
                return;
            }
        }

        dispatch({ type: 'PLACE_BID', payload: { teamId, amount } });
    };

    const sellPlayer = () => {
        if (!activePlayer || !auction.lastBidderTeamId) return;

        const team = teams.find(t => t.id === auction.lastBidderTeamId);
        const rules = state.config.rules;
        if (team && rules) {
            // Re-validate rules before selling (as a safety measure)
            if (rules.maxPlayers && team.players.length >= rules.maxPlayers) {
                alert(`Cannot Sell: Team ${team.name} has reached the maximum player limit.`);
                return;
            }
            // (Role checks could be added here too, but placeBid should have caught them)
        }

        dispatch({
            type: 'SELL_PLAYER',
            payload: {
                playerId: activePlayer.id,
                teamId: auction.lastBidderTeamId,
                amount: auction.currentBid
            }
        });
    };

    const passPlayer = () => {
        if (!activePlayer) return;
        dispatch({ type: 'PASS_PLAYER', payload: activePlayer.id });
    };

    const cancelAuction = () => {
        dispatch({ type: 'CANCEL_AUCTION_ROUND' });
        setShowExitConfirm(false);
    };


    // VIEW: NO ACTIVE PLAYER
    if (!auction.isAuctionActive || !activePlayer) {

        return (
            <div className="container mx-auto p-6 space-y-8 pb-20">

                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text py-2">
                        Waiting Room
                    </h1>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-mono border border-slate-700">
                        {totalWaitingCount} Players Remaining
                    </span>
                </div>

                {/* Available Players List */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#111827] p-4 rounded-xl border border-slate-700">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search players..."
                            className="pl-10 bg-slate-900/50 border-slate-600 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-full md:w-48"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unsoldPlayers.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            {players.filter(p => p.status === 'Available').length === 0
                                ? "No players available. Go to Setup to add more."
                                : "No players match your search filters."}
                        </div>
                    )}

                    {unsoldPlayers.map((player) => (
                        <Card
                            key={player.id}
                            className="p-4 flex flex-col items-center text-center gap-4 hover:border-blue-500 hover:bg-[#1E293B] transition-all cursor-pointer group"
                            onClick={() => startAuction(player.id)}
                        >
                            <div className="w-20 h-20 rounded-full bg-[#0F172A] flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <User className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{player.name}</h3>
                                <p className="text-sm text-slate-400">{player.role}</p>
                                {player.status === 'Unsold' && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest">
                                        Unsold
                                    </span>
                                )}
                                <p className="text-xs font-mono mt-1 bg-slate-900 px-2 py-1 rounded inline-block text-slate-300">
                                    Base: ₹{(player.basePrice / 100000).toFixed(0)}L
                                </p>
                            </div>
                            <Button className="w-full mt-auto bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/50">
                                Start Auction
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        );

    }

    // VIEW: ACTIVE AUCTION
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] relative">
            {/* 1. Main Arena Area */}
            <div className="flex-1 p-2 md:p-4 flex flex-col gap-4 max-w-7xl mx-auto w-full pb-4">

                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="self-start text-slate-400 hover:text-white pl-0 h-8 hover:bg-transparent"
                    onClick={() => setShowExitConfirm(true)}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Waiting Room
                </Button>

                {/* Top: Spotlight & Actions */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Spotlight takes 2 cols */}
                    <div className="xl:col-span-2">
                        <PlayerSpotlight player={activePlayer!} currentBid={auction.currentBid} />
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col gap-4 justify-center">
                        <div className="glass-panel p-4 rounded-2xl space-y-3">
                            <h3 className="text-slate-400 font-medium uppercase text-xs tracking-wider">Auction Controls</h3>

                            {auction.lastBidderTeamId ? (
                                <div className="space-y-3">
                                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                                        <Gavel className="w-4 h-4 text-green-400" />
                                        <div>
                                            <div className="text-[10px] text-green-400 uppercase font-bold leading-none mb-1">Bidding Team</div>
                                            <div className="font-bold text-white text-sm">
                                                {teams.find(t => t.id === auction.lastBidderTeamId)?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base h-12 shadow-lg shadow-green-500/20"
                                        onClick={sellPlayer}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        SOLD @ ₹{(auction.currentBid / 100000).toFixed(1)}L
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-800 rounded-lg text-center text-slate-400 italic text-sm">
                                    Waiting for first bid...
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-700 space-y-2">
                                {auction.bidHistory.length > 0 && (
                                    <Button
                                        variant="outline"
                                        className="w-full border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white h-9 text-sm"
                                        onClick={() => dispatch({ type: 'UNDO_BID' })}
                                    >
                                        <RotateCcw className="w-3 h-3 mr-2" />
                                        Undo Last Bid
                                    </Button>
                                )}

                                {auction.bidHistory.length === 0 && (
                                    <Button
                                        variant="destructive"
                                        className="w-full bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/50 h-9 text-sm"
                                        onClick={passPlayer}
                                    >
                                        <XCircle className="w-3 h-3 mr-2" />
                                        Pass (Unsold)
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: Bid Console */}
                <div className="glass-panel p-4 rounded-2xl">
                    <BidConsole
                        teams={teams}
                        currentBid={auction.currentBid}
                        lastBidderTeamId={auction.lastBidderTeamId}
                        onPlaceBid={placeBid}
                    />
                </div>
            </div>

            {/* 2. Bottom Strip (Sticky) */}
            <div className="sticky bottom-0 z-50 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                <div className="container mx-auto">
                    <TeamStrip teams={teams} lastBidderTeamId={auction.lastBidderTeamId} currentBid={auction.currentBid} />
                </div>
            </div>
            <ConfirmDialog
                isOpen={showExitConfirm}
                title="Exit Auction?"
                description="Are you sure you want to exit? The current bid will be lost and the player will remain unsold."
                onConfirm={cancelAuction}
                onCancel={() => setShowExitConfirm(false)}
                confirmText="Yes, Exit"
                variant="warning"
            />
        </div>
    );
}
