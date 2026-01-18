'use client';

import { useState } from 'react';
import { useAuction } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SettingsPage() {
    const { state, dispatch } = useAuction();
    const [name, setName] = useState(state.config.tournamentName);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { tournamentName: name }
        });
        alert('Settings Saved!');
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_AUCTION' });
        setShowResetConfirm(false);
        alert('System Reset Successfully');
    };

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
                    <form onSubmit={handleSave} className="space-y-4">
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

                        {/* Live Preview */}
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center gap-4">
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Preview</span>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text glow-text text-center py-4">
                                {name || "TOURNAMENT NAME"}
                            </h1>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-500">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
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
                description="This action cannot be undone. All teams, players, and bid history will be permanently deleted."
                confirmText="Yes, Delete Everything"
                variant="danger"
            />
        </div>
    );
}
