'use client';

import { useState, useRef } from 'react';
import { useAuction } from '@/lib/store';
import { Team, Player, Role, ROLES, DEFAULT_BUDGET } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Users, UserPlus, Upload, Download, Pencil, ImagePlus, X } from 'lucide-react';
import { formatCurrency, getEffectiveBasePrice } from "@/lib/format";
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Image from 'next/image';

export default function SetupPage() {
    const { state, dispatch } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Editing State
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);

    // Team Form State
    const [teamName, setTeamName] = useState('');
    const defaultBudget = state.config.rules.totalBudget || DEFAULT_BUDGET;
    const [teamBudget, setTeamBudget] = useState(defaultBudget.toString());
    const [teamLogo, setTeamLogo] = useState<string | null>(null);

    // Player Form State
    const [playerName, setPlayerName] = useState('');
    const [playerRole, setPlayerRole] = useState<Role>('All-Rounder');
    const [playerCategories, setPlayerCategories] = useState<Record<string, string>>({});
    const [playerBasePrice, setPlayerBasePrice] = useState('2000000'); // 20 Lakh default

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTeamLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAddTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName) return;

        if (editingTeamId) {
            const updatedTeam: Team = {
                id: editingTeamId,
                name: teamName,
                totalBudget: parseInt(teamBudget),
                remainingBudget: 0, // Will be recalculated in reducer
                players: [], // Preserved in reducer
                logoUrl: teamLogo || undefined,
            };
            dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });
            setEditingTeamId(null);
        } else {
            const newTeam: Team = {
                id: uuidv4(),
                name: teamName,
                totalBudget: parseInt(teamBudget),
                remainingBudget: parseInt(teamBudget),
                players: [],
                logoUrl: teamLogo || undefined,
            };
            dispatch({ type: 'ADD_TEAM', payload: newTeam });
        }

        setTeamName('');
        setTeamBudget(defaultBudget.toString());
        setTeamLogo(null);
    };

    const handleEditTeam = (team: Team) => {
        setTeamName(team.name);
        setTeamBudget(team.totalBudget.toString());
        setTeamLogo(team.logoUrl || null);
        setEditingTeamId(team.id);
    };

    const calculateBasePrice = (categories: Record<string, string>, csvPrice?: number) => {
        const rules = state.config.rules;

        // 1. Check for Category Match (Highest priority)
        if (categories && rules.categoryRules) {
            for (const cat of Object.values(categories)) {
                const catRule = rules.categoryRules[cat];
                if (catRule?.basePrice) {
                    return catRule.basePrice;
                }
            }
        }

        // 2. Check for CSV price/manual price if provided
        if (csvPrice !== undefined && !isNaN(csvPrice)) {
            return csvPrice;
        }

        // 3. Global Default Base Price
        if (rules.defaultBasePrice) {
            return rules.defaultBasePrice;
        }

        // 4. Absolute Fallback
        return 2000000;
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName) return;

        const basePrice = calculateBasePrice(playerCategories, parseInt(playerBasePrice));

        if (editingPlayerId) {
            const updatedPlayer: Player = {
                id: editingPlayerId,
                name: playerName,
                role: playerRole,
                categories: playerCategories,
                basePrice: basePrice,
                status: 'Available',
            };
            const original = state.players.find(p => p.id === editingPlayerId);
            if (original) updatedPlayer.status = original.status;

            dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
            setEditingPlayerId(null);
        } else {
            const newPlayer: Player = {
                id: uuidv4(),
                name: playerName,
                role: playerRole,
                categories: playerCategories,
                basePrice: basePrice,
                status: 'Available',
            };
            dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
        }

        setPlayerName('');
        setPlayerCategories({});
        setPlayerBasePrice(state.config.rules.defaultBasePrice?.toString() || '2000000');
    };

    const handleEditPlayer = (player: Player) => {
        setPlayerName(player.name);
        setPlayerRole(player.role);
        setPlayerCategories(player.categories || {});
        setPlayerBasePrice(player.basePrice.toString());
        setEditingPlayerId(player.id);
    };

    const triggerDownloadTemplate = () => {
        setShowTemplateConfirm(true);
    };

    const handleDownloadTemplate = () => {
        setShowTemplateConfirm(false);
        const labels = state.config.categoryLabels || [];
        const templateRow: any = { Name: 'Virat Kohli', Role: 'Batsman', BasePrice: state.config.rules.defaultBasePrice || '2000000' };
        labels.forEach(label => {
            templateRow[label] = label === 'Gender' ? 'Male' : 'Marquee';
        });

        const csv = Papa.unparse([templateRow]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'player_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                let successCount = 0;
                results.data.forEach((row: any) => {
                    const cats: Record<string, string> = {};
                    const labels = state.config.categoryLabels || [];
                    labels.forEach(label => {
                        if (row[label]) cats[label] = row[label];
                        else if (label === 'Category' && row.Category) cats[label] = row.Category;
                    });

                    // Logic: Category Base Price overrides CSV price. CSV price overrides Global Default.
                    const finalBasePrice = calculateBasePrice(cats, parseInt(row.BasePrice));

                    const newPlayer: Player = {
                        id: uuidv4(),
                        name: row.Name,
                        role: row.Role as Role,
                        categories: cats,
                        basePrice: finalBasePrice,
                        status: 'Available',
                    };
                    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
                    successCount++;
                });
                alert(`Imported ${successCount} players successfully!`);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
                alert('Failed to parse CSV file.');
            }
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Tournament Setup</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TEAMS SECTION */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                Add Team
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddTeam} className="space-y-4">
                                <div className="flex flex-col items-center gap-4 mb-4">
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-slate-800 group overflow-hidden"
                                    >
                                        {teamLogo ? (
                                            <>
                                                <Image src={teamLogo} alt="Team Logo" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Pencil className="w-6 h-6 text-white" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setTeamLogo(null); }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <ImagePlus className="w-8 h-8 text-slate-500 mb-1 group-hover:text-blue-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Add Logo</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Team Name</label>
                                    <Input
                                        placeholder="e.g. Royal Challengers"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Budget (₹)</label>
                                    <Input
                                        type="number"
                                        value={teamBudget}
                                        onChange={(e) => setTeamBudget(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingTeamId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingTeamId ? "Update Team" : "Add Team"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Teams List ({state.teams.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {state.teams.length === 0 && <p className="text-slate-500 text-center py-4">No teams added yet.</p>}
                                {state.teams.map((team) => (
                                    <div key={team.id} className="flex items-center justify-between p-3 bg-[#1E293B] rounded-lg border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            {team.logoUrl ? (
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                                                    <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500 font-bold uppercase text-xs">
                                                    {team.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-white">{team.name}</div>
                                                <div className="text-xs text-slate-400">Budget: ₹{(team.totalBudget / 10000000).toFixed(2)} Cr</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditTeam(team)}
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => dispatch({ type: 'DELETE_TEAM', payload: team.id })}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PLAYERS SECTION */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-purple-400" />
                                Add Player
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={triggerDownloadTemplate} className="text-xs h-8">
                                    <Download className="w-3 h-3 mr-2" />
                                    Template
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs h-8 bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6] hover:text-white">
                                    <Upload className="w-3 h-3 mr-2" />
                                    Import CSV
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddPlayer} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Player Name</label>
                                    <Input
                                        placeholder="e.g. Virat Kohli"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Role</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={playerRole}
                                            onChange={(e) => setPlayerRole(e.target.value as Role)}
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Base Price</label>
                                        <Input
                                            type="number"
                                            value={playerBasePrice}
                                            onChange={(e) => setPlayerBasePrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {state.config.categoryLabels?.map(label => (
                                    <div key={label}>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">{label} (Optional)</label>
                                        <Input
                                            placeholder={`e.g. ${label === 'Gender' ? 'Male' : 'Marquee'}`}
                                            value={playerCategories[label] || ''}
                                            onChange={(e) => setPlayerCategories({ ...playerCategories, [label]: e.target.value })}
                                            list={`suggestions-${label}`}
                                        />
                                        <datalist id={`suggestions-${label}`}>
                                            {state.config.categoryOptions?.[label]?.map(opt => (
                                                <option key={opt} value={opt} />
                                            ))}
                                        </datalist>
                                    </div>
                                ))}

                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 shadow-purple-500/20">
                                    {editingPlayerId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingPlayerId ? "Update Player" : "Add Player"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Players List ({state.players.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {state.players.length === 0 && <p className="text-slate-500 text-center py-4">No players added yet.</p>}
                                {[...state.players].reverse().map((player) => (
                                    <div key={player.id} className="flex items-center justify-between p-3 bg-[#1E293B] rounded-lg border border-slate-700/50">
                                        <div>
                                            <div className="font-semibold text-white">{player.name}</div>
                                            <div className="text-xs text-slate-400">
                                                {player.role} • {player.categories && Object.entries(player.categories).map(([label, val]) => (
                                                    <span key={label} className="text-blue-400 font-bold">{val} • </span>
                                                ))} {formatCurrency(getEffectiveBasePrice(player, state.config.rules), currencyUnit)}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditPlayer(player)}
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => dispatch({ type: 'DELETE_PLAYER', payload: player.id })}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ConfirmDialog
                isOpen={showTemplateConfirm}
                title="Configure Settings First?"
                description="Please ensure you have configured all Tournament Settings (Categories, Labels, etc.) before downloading the template. This ensures your CSV will have the correct columns for your specific auction."
                onConfirm={handleDownloadTemplate}
                onCancel={() => setShowTemplateConfirm(false)}
                confirmText="Download Anyway"
                cancelText="Not Now"
                variant="info"
            />
        </div>
    );
}
