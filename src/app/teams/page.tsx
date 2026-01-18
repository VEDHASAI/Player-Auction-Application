'use client';

import { useState } from 'react';
import { useAuction } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Download, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import * as XLSX from 'xlsx';

export default function TeamsPage() {
    const { state, dispatch } = useAuction();
    const { teams, players } = state;
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text py-2">
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

                    return (
                        <Card key={team.id} className="overflow-hidden border-slate-700 bg-slate-900/50">
                            <div className="bg-slate-800 p-4 border-b border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-white">{team.name}</h2>
                                    <Trophy className="w-5 h-5 text-yellow-500 opacity-20" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                    <div>
                                        <div className="text-slate-500">Remaining</div>
                                        <div className="text-emerald-400 font-mono font-bold">₹{(team.remainingBudget / 10000000).toFixed(2)} Cr</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Spent</div>
                                        <div className="text-slate-300 font-mono">₹{(spent / 10000000).toFixed(2)} Cr</div>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-0">
                                <div className="p-3 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between">
                                    <span>Squad ({teamPlayers.length})</span>
                                    <span>Details</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {teamPlayers.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 text-sm italic">
                                            No players bought yet.
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 bg-slate-800/20 uppercase hidden">
                                                <tr>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2 text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teamPlayers.map((p) => (
                                                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                                        <td className="px-4 py-3 font-medium text-slate-200">
                                                            {p.name}
                                                            <div className="text-xs text-slate-500 font-normal">{p.role}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <span className="font-mono text-slate-300">
                                                                    ₹{((p.soldPrice || 0) / 100000).toFixed(2)}L
                                                                </span>
                                                                <button
                                                                    onClick={() => setPlayerToRelease({ id: p.id, name: p.name, teamId: team.id })}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Release Player"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
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
