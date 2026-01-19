'use client';

import { useState } from 'react';
import { useAuction } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Trash2, User, Coins, Download } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Papa from 'papaparse';

export default function SettingsPage() {
    const { state, dispatch } = useAuction();
    const [name, setName] = useState(state.config.tournamentName);
    const [rules, setRules] = useState(state.config.rules || {});
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { tournamentName: name, rules }
        });
        alert('Settings Saved!');
    };

    const updateRule = (key: keyof typeof rules, value: string) => {
        const num = value === '' ? undefined : parseInt(value);
        setRules(prev => ({ ...prev, [key]: num }));
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_AUCTION' });
        setShowResetConfirm(false);
        alert('System Reset Successfully');
    };

    const exportAuctionDataToCSV = () => {
        if (state.auction.history.length === 0) {
            return;
        }

        const exportData = state.auction.history.map(item => {
            const player = state.players.find(p => p.id === item.playerId);
            const team = state.teams.find(t => t.id === item.soldToTeamId);
            return {
                'Player Name': player?.name || 'Unknown',
                'Role': player?.role || 'Unknown',
                'Base Price': player?.basePrice || 0,
                'Sold Price': item.soldPrice,
                'Sold To': team?.name || 'Unknown',
                'Timestamp': new Date(item.timestamp).toLocaleString()
            };
        });

        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `auction_data_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasAuctionData = state.auction.history.length > 0;

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                    Back to Dashboard
                </Link>
            </div>

            <Card className="border-slate-800 bg-[#111827]">
                <CardHeader>
                    <CardTitle className="text-white">Tournament Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Tournament Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. My Auction"
                                className="bg-slate-900/50 border-slate-700 text-white"
                            />
                            <p className="text-xs text-slate-500">This title is displayed on the main dashboard.</p>
                        </div>

                        {/* Rules Section */}
                        <div className="space-y-4 border-t border-slate-800 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Squad Composition Rules</h3>
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest">Enforced</span>
                            </div>
                            <p className="text-xs text-slate-500 italic block mb-4">Leave empty if there are no restrictions. These rules are enforced during bidding.</p>

                            <div className="space-y-6">
                                {/* Total Budget */}
                                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                                    <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                                        <Coins className="w-4 h-4" /> Financial Setup
                                    </h4>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Starting Team Budget (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                            <Input
                                                type="number"
                                                value={rules.totalBudget ?? ''}
                                                onChange={(e) => updateRule('totalBudget', e.target.value)}
                                                placeholder="e.g. 100000000"
                                                className="bg-slate-900/50 border-slate-700 text-white h-10 pl-8 text-sm font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic">This will be the base budget for all teams in the tournament.</p>
                                    </div>
                                </div>

                                {/* Total Squad Size */}
                                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-4 h-4" /> Total Squad Size
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Minimum Required</label>
                                            <Input
                                                type="number"
                                                value={rules.minPlayers ?? ''}
                                                onChange={(e) => updateRule('minPlayers', e.target.value)}
                                                placeholder="No min"
                                                className="bg-slate-900/50 border-slate-700 text-white h-9 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Maximum Allowed</label>
                                            <Input
                                                type="number"
                                                value={rules.maxPlayers ?? ''}
                                                onChange={(e) => updateRule('maxPlayers', e.target.value)}
                                                placeholder="No max"
                                                className="bg-slate-900/50 border-slate-700 text-white h-9 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role Rules Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Batsmen */}
                                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Batsmen Limits</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Min</label>
                                                <Input
                                                    type="number"
                                                    value={rules.minBatsmen ?? ''}
                                                    onChange={(e) => updateRule('minBatsmen', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Max</label>
                                                <Input
                                                    type="number"
                                                    value={rules.maxBatsmen ?? ''}
                                                    onChange={(e) => updateRule('maxBatsmen', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bowlers */}
                                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Bowlers Limits</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Min</label>
                                                <Input
                                                    type="number"
                                                    value={rules.minBowlers ?? ''}
                                                    onChange={(e) => updateRule('minBowlers', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Max</label>
                                                <Input
                                                    type="number"
                                                    value={rules.maxBowlers ?? ''}
                                                    onChange={(e) => updateRule('maxBowlers', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* All-Rounders */}
                                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">All-Rounder Limits</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Min</label>
                                                <Input
                                                    type="number"
                                                    value={rules.minAllRounders ?? ''}
                                                    onChange={(e) => updateRule('minAllRounders', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Max</label>
                                                <Input
                                                    type="number"
                                                    value={rules.maxAllRounders ?? ''}
                                                    onChange={(e) => updateRule('maxAllRounders', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wicket Keepers */}
                                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Wicket Keeper Limits</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Min</label>
                                                <Input
                                                    type="number"
                                                    value={rules.minWicketKeepers ?? ''}
                                                    onChange={(e) => updateRule('minWicketKeepers', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Max</label>
                                                <Input
                                                    type="number"
                                                    value={rules.maxWicketKeepers ?? ''}
                                                    onChange={(e) => updateRule('maxWicketKeepers', e.target.value)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center gap-4">
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Dashboard Title Preview</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text glow-text text-center py-2">
                                {name || "TOURNAMENT NAME"}
                            </h1>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-500 font-bold px-8 shadow-lg shadow-blue-500/20">
                                <Save className="w-4 h-4 mr-2" />
                                Save Configuration
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Reset Settings */}
            <Card className="border-red-900/30 bg-[#111827]">
                <CardHeader>
                    <CardTitle className="text-red-400">Reset Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border border-red-900/30 rounded-lg bg-red-900/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-red-200 font-medium">Reset All Data</h3>
                            <p className="text-red-400/60 text-sm">Permanently delete all teams, players, and auction history.</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowResetConfirm(true)}
                            className="bg-red-900/50 border border-red-800 hover:bg-red-800 text-red-100"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset System
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                isOpen={showResetConfirm}
                onConfirm={handleReset}
                onCancel={() => setShowResetConfirm(false)}
                title="Reset All Data?"
                description={hasAuctionData
                    ? "Careful! There is active auction history. We recommend saving the data before resetting. This will permanently delete all teams, players, and sold data."
                    : "This action cannot be undone. All teams, players, and bid history will be permanently deleted."
                }
                confirmText="Delete All"
                extraActionText={hasAuctionData ? "Save & Reset" : undefined}
                onExtraAction={hasAuctionData ? () => { exportAuctionDataToCSV(); handleReset(); } : undefined}
                variant="danger"
            />
        </div>
    );
}
