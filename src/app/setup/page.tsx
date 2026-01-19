'use client';

import { useState } from 'react';
import { useAuction } from '@/lib/store';
import { Team, Player, Role, ROLES, DEFAULT_BUDGET } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Users, UserPlus, Upload, Download, Pencil } from 'lucide-react';
import { formatCurrency } from "@/lib/format";
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { useRef } from 'react';

export default function SetupPage() {
    const { state, dispatch } = useAuction();
    const currencyUnit = state.config.currencyUnit || 'Lakhs';
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing State
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

    // Team Form State
    const [teamName, setTeamName] = useState('');
    const defaultBudget = state.config.rules.totalBudget || DEFAULT_BUDGET;
    const [teamBudget, setTeamBudget] = useState(defaultBudget.toString());

    // Player Form State
    const [playerName, setPlayerName] = useState('');
    const [playerRole, setPlayerRole] = useState<Role>('All-Rounder');
    const [playerCategory, setPlayerCategory] = useState('');
    const [playerBasePrice, setPlayerBasePrice] = useState('2000000'); // 20 Lakh default

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
            };
            dispatch({ type: 'ADD_TEAM', payload: newTeam });
        }

        setTeamName('');
        setTeamBudget(defaultBudget.toString());
    };

    const handleEditTeam = (team: Team) => {
        setTeamName(team.name);
        setTeamBudget(team.totalBudget.toString());
        setEditingTeamId(team.id);
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName) return;

        if (editingPlayerId) {
            const updatedPlayer: Player = {
                id: editingPlayerId,
                name: playerName,
                role: playerRole,
                category: playerCategory,
                basePrice: parseInt(playerBasePrice),
                status: 'Available',
            };
            // To preserve status, we should check state inside reducer or pass it.
            // Reducer replacement handles it if we pass full object.
            // Let's assume for Setup page edits they are likely Available.
            // If we want to be safe, we hunt for the original status.
            const original = state.players.find(p => p.id === editingPlayerId);
            if (original) updatedPlayer.status = original.status;

            dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
            setEditingPlayerId(null);
        } else {
            const newPlayer: Player = {
                id: uuidv4(),
                name: playerName,
                role: playerRole,
                category: playerCategory,
                basePrice: parseInt(playerBasePrice),
                status: 'Available',
            };
            dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
        }

        setPlayerName('');
    };

    const handleEditPlayer = (player: Player) => {
        setPlayerName(player.name);
        setPlayerRole(player.role);
        setPlayerCategory(player.category || '');
        setPlayerBasePrice(player.basePrice.toString());
        setEditingPlayerId(player.id);
    };

    const handleDownloadTemplate = () => {
        const csv = Papa.unparse([
            { Name: 'Virat Kohli', Role: 'Batsman', Category: 'Marquee', BasePrice: '2000000' },
            { Name: 'Jasprit Bumrah', Role: 'Bowler', Category: 'Marquee', BasePrice: '2000000' },
        ]);
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
                    if (row.Name && row.Role && row.BasePrice) {
                        const newPlayer: Player = {
                            id: uuidv4(),
                            name: row.Name,
                            role: row.Role as Role,
                            category: row.Category,
                            basePrice: parseInt(row.BasePrice),
                            status: 'Available',
                        };
                        dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
                        successCount++;
                    }
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
                                        <div>
                                            <div className="font-semibold text-white">{team.name}</div>
                                            <div className="text-xs text-slate-400">Budget: ₹{(team.totalBudget / 10000000).toFixed(2)} Cr</div>
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
                                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-xs h-8">
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

                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">{state.config.categoryLabel || 'Category'} (Optional)</label>
                                    <Input
                                        placeholder={`e.g. Marquee`}
                                        value={playerCategory}
                                        onChange={(e) => setPlayerCategory(e.target.value)}
                                        list="category-suggestions"
                                    />
                                    <datalist id="category-suggestions">
                                        {state.config.playerCategories?.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>

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
                                                {player.role} • {player.category && <span className="text-blue-400 font-bold">{player.category} • </span>} {formatCurrency(player.basePrice, currencyUnit)}
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
        </div>
    );
}
