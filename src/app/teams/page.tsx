'use client';

import { useState } from 'react';
import { useAuction } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Download, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import * as XLSX from 'xlsx';
import { formatCurrency } from "@/lib/format";
import Image from 'next/image';

export default function TeamsPage() {
    const { state, dispatch } = useAuction();
    const { teams, players } = state;
    const currencyUnit = state.config.currencyUnit || 'Lakhs';
    const [showExportConfirm, setShowExportConfirm] = useState(false);

    // Release Player State
    const [playerToRelease, setPlayerToRelease] = useState<{ id: string; name: string; teamId: string } | null>(null);

    const handleReleasePlayer = () => {
        if (!playerToRelease) return;
        dispatch({
            type: 'RELEASE_PLAYER',
            payload: { playerId: playerToRelease.id, teamId: playerToRelease.teamId }
        });
        setPlayerToRelease(null);
    };

    const handleExport = () => {
        const wb = XLSX.utils.book_new();

        // 1. Summary Sheet
        const summaryData = teams.map(team => {
            const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
            const spent = team.totalBudget - team.remainingBudget;
            return {
                "Team Name": team.name,
                "Squad Size": teamPlayers.length,
                "Total Budget": team.totalBudget,
                "Amount Spent": spent,
                "Remaining Budget": team.remainingBudget,
            };
        });
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);

        // Auto-width for summary cols
        const summaryCols = Object.keys(summaryData[0] || {}).map(() => ({ wch: 20 }));
        summaryWs['!cols'] = summaryCols;

        XLSX.utils.book_append_sheet(wb, summaryWs, "Tournament Summary");

        // 2. Individual Team Sheets
        teams.forEach(team => {
            const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
            const playerData = teamPlayers.map(p => ({
                "Player Name": p.name,
                "Role": p.role,
                "Base Price": p.basePrice,
                "Sold Price": p.soldPrice || 0,
                "Status": p.status
            }));

            if (playerData.length > 0) {
                const teamWs = XLSX.utils.json_to_sheet(playerData);
                // Adjust col widths
                teamWs['!cols'] = [
                    { wch: 25 }, // Name
                    { wch: 15 }, // Role
                    { wch: 15 }, // Base
                    { wch: 15 }, // Sold
                    { wch: 10 }, // Status
                ];
                // Sanitize sheet name (remove special chars if any, max 31 chars)
                const sheetName = team.name.replace(/[\\/?*[\]]/g, "").slice(0, 31);
                XLSX.utils.book_append_sheet(wb, teamWs, sheetName);
            }
        });

        XLSX.writeFile(wb, `${state.config.tournamentName.replace(/\s+/g, '_')}_Results.xlsx`);
        setShowExportConfirm(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text py-2">
                    Team Squads & Budgets
                </h1>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowExportConfirm(true)}
                    disabled={teams.length === 0 || !players.some(p => p.status === 'Sold')}
                >

                    <Download className="w-4 h-4 mr-2" />
                    Auction Completed
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => {
                    const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
                    const spent = team.totalBudget - team.remainingBudget;
                    const rules = state.config.rules;

                    // Role Counts
                    const roles = {
                        'Batsman': teamPlayers.filter(p => p.role === 'Batsman').length,
                        'Bowler': teamPlayers.filter(p => p.role === 'Bowler').length,
                        'All-Rounder': teamPlayers.filter(p => p.role === 'All-Rounder').length,
                        'Wicket Keeper': teamPlayers.filter(p => p.role === 'Wicket Keeper').length,
                    };

                    // Category Counts
                    const catCounts: Record<string, number> = {};
                    if (rules.categoryRules) {
                        Object.keys(rules.categoryRules).forEach(cat => {
                            catCounts[cat] = teamPlayers.filter(p => p.categories && Object.values(p.categories).includes(cat)).length;
                        });
                    }

                    return (
                        <Card key={team.id} className="overflow-hidden border-slate-700 bg-slate-900/50 flex flex-col hover:border-blue-500/50 transition-all duration-300 group shadow-lg">
                            <div className="bg-slate-800 p-4 border-b border-slate-700 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        {team.logoUrl ? (
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                                <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-slate-500 font-bold uppercase text-xs shrink-0">
                                                {team.name.charAt(0)}
                                            </div>
                                        )}
                                        <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{team.name}</h2>
                                    </div>
                                    <Trophy className="w-5 h-5 text-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                    <div>
                                        <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Left</div>
                                        <div className="text-emerald-400 font-mono font-bold text-lg">{formatCurrency(team.remainingBudget, currencyUnit)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Spent</div>
                                        <div className="text-slate-300 font-mono text-lg">{formatCurrency(spent, currencyUnit)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements Checklist */}
                            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex flex-wrap gap-2">
                                {rules.minPlayers && (
                                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${teamPlayers.length >= rules.minPlayers ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {teamPlayers.length >= rules.minPlayers ? <CheckCircle className="w-2.5 h-2.5" /> : <div className="w-1 h-1 bg-current rounded-full" />}
                                        Squad: {teamPlayers.length}/{rules.minPlayers}
                                    </div>
                                )}
                                {Object.entries({
                                    'Batsman': rules.minBatsmen,
                                    'Bowler': rules.minBowlers,
                                    'All-Rounder': rules.minAllRounders,
                                    'Wicket Keeper': rules.minWicketKeepers
                                }).map(([role, min]) => min ? (
                                    <div key={role} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${(roles as any)[role] >= min ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {(roles as any)[role] >= min ? <CheckCircle className="w-2.5 h-2.5" /> : null}
                                        {role[0]}: {(roles as any)[role]}/{min}
                                    </div>
                                ) : null)}

                                {rules.categoryRules && Object.entries(rules.categoryRules).map(([cat, rule]) => rule.min ? (
                                    <div key={cat} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${catCounts[cat] >= rule.min ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {catCounts[cat] >= rule.min ? <CheckCircle className="w-2.5 h-2.5" /> : null}
                                        {cat}: {catCounts[cat]}/{rule.min}
                                    </div>
                                ) : null)}
                            </div>

                            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                                <div className="p-2 px-4 bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 flex justify-between">
                                    <span>Players List</span>
                                    <span>Price</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth min-h-[150px] max-h-[300px]">
                                    {teamPlayers.length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center gap-3">
                                            <Users className="w-8 h-8 text-slate-800" />
                                            <div className="text-slate-600 text-xs font-bold uppercase tracking-widest italic">Squad Empty</div>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <tbody className="divide-y divide-slate-800/50">
                                                {teamPlayers.map((p) => (
                                                    <tr key={p.id} className="hover:bg-blue-500/5 transition-colors group/row">
                                                        <td className="px-4 py-2.5">
                                                            <div className="font-bold text-slate-200 group-hover/row:text-white transition-colors">{p.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter flex items-center gap-2">
                                                                {p.role}
                                                                {p.categories && Object.values(p.categories).map((val, i) => (
                                                                    <span key={i} className="text-blue-500/50">• {val}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right w-32">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="font-mono text-xs font-bold text-slate-400 group-hover/row:text-emerald-400 transition-colors">
                                                                    {formatCurrency(p.soldPrice || 0, currencyUnit)}
                                                                </span>
                                                                <button
                                                                    onClick={() => setPlayerToRelease({ id: p.id, name: p.name, teamId: team.id })}
                                                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
                                                                    title="Release Player"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {teams.length === 0 && (
                <div className="text-center py-20 text-slate-500 text-lg">
                    No teams configured. Go to Setup.
                </div>
            )}

            <ConfirmDialog
                isOpen={showExportConfirm}
                title="Complete Auction & Download?"
                description="This will download the final squads for all teams as an Excel file, with separate sheets for each team."
                confirmText="Yes, Download Results"
                onConfirm={handleExport}
                onCancel={() => setShowExportConfirm(false)}
                variant="info"
            />

            <ConfirmDialog
                isOpen={!!playerToRelease}
                title="Release Player?"
                description={`Are you sure you want to release ${playerToRelease?.name} from this team? The spent amount will be refunded to the team's budget.`}
                confirmText="Yes, Release Player"
                onConfirm={handleReleasePlayer}
                onCancel={() => setPlayerToRelease(null)}
                variant="danger"
            />
        </div>
    );
}
