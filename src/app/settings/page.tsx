'use client';

import { useState, useEffect } from 'react';
import { useAuction } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Trash2, User, Coins, Download, Pencil, Gavel } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Papa from 'papaparse';

export default function SettingsPage() {
    const { state, dispatch } = useAuction();
    const [name, setName] = useState(state.config.tournamentName);
    const [rules, setRules] = useState(state.config.rules || {});
    const [currencyUnit, setCurrencyUnit] = useState(state.config.currencyUnit || 'Lakhs');
    const [bidIncrements, setBidIncrements] = useState(state.config.bidIncrements || [500000, 1000000, 2000000, 5000000, 10000000]);
    const [categoryLabels, setCategoryLabels] = useState<string[]>(state.config.categoryLabels || ['Category']);
    const [categoryOptions, setCategoryOptions] = useState<Record<string, string[]>>(state.config.categoryOptions || { 'Category': [] });
    const [newLabel, setNewLabel] = useState('');
    const [newOption, setNewOption] = useState<Record<string, string>>({});
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const [categoryBidIncrements, setCategoryBidIncrements] = useState<Record<string, number[]>>(state.config.categoryBidIncrements || {});
    const router = useRouter();

    // Check if there are unsaved changes
    const checkIsDirty = () => {
        return (
            name !== state.config.tournamentName ||
            JSON.stringify(rules) !== JSON.stringify(state.config.rules) ||
            currencyUnit !== state.config.currencyUnit ||
            JSON.stringify(categoryLabels) !== JSON.stringify(state.config.categoryLabels) ||
            JSON.stringify(categoryOptions) !== JSON.stringify(state.config.categoryOptions) ||
            JSON.stringify(bidIncrements) !== JSON.stringify(state.config.bidIncrements) ||
            JSON.stringify(categoryBidIncrements) !== JSON.stringify(state.config.categoryBidIncrements)
        );
    };

    // Warn on page refresh or external navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (checkIsDirty()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [name, rules, currencyUnit, categoryLabels, categoryOptions, bidIncrements, categoryBidIncrements]);

    const handleSave = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { tournamentName: name, rules, currencyUnit, categoryLabels, categoryOptions, bidIncrements, categoryBidIncrements }
        });
        alert('Settings Saved!');
    };

    const handleBackClick = () => {
        if (checkIsDirty()) {
            setShowUnsavedConfirm(true);
        } else {
            router.push('/');
        }
    };

    const handleSaveAndLeave = () => {
        handleSave();
        setShowUnsavedConfirm(false);
        router.push('/');
    };

    const handleDiscardAndLeave = () => {
        setShowUnsavedConfirm(false);
        router.push('/');
    };

    const updateRule = (key: keyof typeof rules, value: string) => {
        const num = value === '' ? undefined : parseInt(value);
        setRules(prev => ({ ...prev, [key]: num }));
    };

    const updateCategoryRule = (cat: string, type: 'min' | 'max' | 'basePrice', value: string) => {
        const num = value === '' ? undefined : parseInt(value);
        setRules(prev => {
            const categoryRules = { ...(prev.categoryRules || {}) };
            categoryRules[cat] = { ...(categoryRules[cat] || {}), [type]: num };
            return { ...prev, categoryRules };
        });
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
                <Button
                    variant="ghost"
                    onClick={handleBackClick}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                    Back to Dashboard
                </Button>
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
                                {/* Currency Unit Selection */}
                                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                                        <Coins className="w-4 h-4" /> Amount Display Unit
                                    </h4>
                                    <div className="flex gap-4">
                                        {['Lakhs', 'Crores', 'Thousands'].map((unit) => (
                                            <label key={unit} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="currencyUnit"
                                                    value={unit}
                                                    checked={currencyUnit === unit}
                                                    onChange={(e) => setCurrencyUnit(e.target.value as any)}
                                                    className="w-4 h-4 border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                                />
                                                <span className={`text-sm font-medium ${currencyUnit === unit ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                                    {unit}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic">Select how amounts should be shown throughout the application.</p>
                                </div>

                                {/* Category Labels Configuration */}
                                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-4 shadow-inner">
                                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                        <Pencil className="w-4 h-4" /> Player Category Labels
                                    </h4>

                                    <div className="flex gap-2">
                                        <Input
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            placeholder="e.g. Gender"
                                            className="bg-slate-900/50 border-slate-700 text-white h-9"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (newLabel && !categoryLabels.includes(newLabel)) {
                                                    setCategoryLabels([...categoryLabels, newLabel]);
                                                    setCategoryOptions({ ...categoryOptions, [newLabel]: [] });
                                                    setNewLabel('');
                                                }
                                            }}
                                            className="h-9 px-4"
                                            variant="outline"
                                        >
                                            Add Label
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {categoryLabels.map((label) => (
                                            <div key={label} className="p-3 bg-slate-950/50 rounded border border-slate-800 flex items-center justify-between group">
                                                <span className="text-white font-bold">{label}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const freshLabels = categoryLabels.filter(l => l !== label);
                                                        setCategoryLabels(freshLabels);
                                                        const freshOptions = { ...categoryOptions };
                                                        delete freshOptions[label];
                                                        setCategoryOptions(freshOptions);
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic">Define multiple tags per player (e.g., "Gender", "Marquee Status").</p>
                                </div>

                                {/* Bid Increments Configuration */}
                                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                        <Gavel className="w-4 h-4" /> Bid Increments (₹)
                                    </h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {bidIncrements.map((val, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <label className="text-[9px] text-slate-500 font-black uppercase">Slot {idx + 1}</label>
                                                <Input
                                                    type="number"
                                                    value={val}
                                                    onChange={(e) => {
                                                        const newIncrements = [...bidIncrements];
                                                        newIncrements[idx] = parseInt(e.target.value) || 0;
                                                        setBidIncrements(newIncrements);
                                                    }}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-9 px-2 text-xs font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic">Configure the 5 quick-bid increment buttons available in the auction room.</p>
                                </div>

                                {/* Dynamic Category Options Management */}
                                <div className="space-y-6">
                                    {categoryLabels.map((label) => (
                                        <div key={label} className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                <User className="w-4 h-4" /> {label} Options
                                            </h4>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newOption[label] || ''}
                                                    onChange={(e) => setNewOption({ ...newOption, [label]: e.target.value })}
                                                    placeholder={`e.g. ${label === 'Gender' ? 'Male' : 'Marquee'}`}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-9"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        const opt = newOption[label];
                                                        if (opt && !categoryOptions[label].includes(opt)) {
                                                            setCategoryOptions({
                                                                ...categoryOptions,
                                                                [label]: [...categoryOptions[label], opt]
                                                            });
                                                            setNewOption({ ...newOption, [label]: '' });
                                                        }
                                                    }}
                                                    className="h-9 px-4"
                                                    variant="outline"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(categoryOptions[label] || []).map((opt) => (
                                                    <div key={opt} className="flex flex-col gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 group w-full md:w-[calc(50%-0.5rem)]">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-blue-400 text-xs font-bold">{opt}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const freshOpts = categoryOptions[label].filter(o => o !== opt);
                                                                    setCategoryOptions({ ...categoryOptions, [label]: freshOpts });
                                                                    setRules(prev => {
                                                                        const categoryRules = { ...(prev.categoryRules || {}) };
                                                                        delete categoryRules[opt];
                                                                        return { ...prev, categoryRules };
                                                                    });
                                                                }}
                                                                className="hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-slate-500 uppercase font-black">Min</label>
                                                                <Input
                                                                    type="number"
                                                                    value={rules.categoryRules?.[opt]?.min ?? ''}
                                                                    onChange={(e) => updateCategoryRule(opt, 'min', e.target.value)}
                                                                    className="bg-slate-900/50 border-slate-700 text-white h-7 text-[10px]"
                                                                    placeholder="No min"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-slate-500 uppercase font-black">Max</label>
                                                                <Input
                                                                    type="number"
                                                                    value={rules.categoryRules?.[opt]?.max ?? ''}
                                                                    onChange={(e) => updateCategoryRule(opt, 'max', e.target.value)}
                                                                    className="bg-slate-900/50 border-slate-700 text-white h-7 text-[10px]"
                                                                    placeholder="No max"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 mt-2">
                                                            <label className="text-[9px] text-slate-500 uppercase font-black">Base Price (₹)</label>
                                                            <Input
                                                                type="number"
                                                                value={rules.categoryRules?.[opt]?.basePrice ?? ''}
                                                                onChange={(e) => updateCategoryRule(opt, 'basePrice', e.target.value)}
                                                                className="bg-slate-900/50 border-slate-700 text-white h-7 text-[10px]"
                                                                placeholder="Override Base Price"
                                                            />
                                                        </div>
                                                        <div className="space-y-1 mt-2">
                                                            <label className="text-[9px] text-slate-500 uppercase font-black">Bid Increments</label>
                                                            <select
                                                                className="flex h-7 w-full rounded-md border border-slate-700 bg-slate-900/50 px-2 py-1 text-[10px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                value={categoryBidIncrements[opt] ? JSON.stringify(categoryBidIncrements[opt]) : ''}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '') {
                                                                        const updated = { ...categoryBidIncrements };
                                                                        delete updated[opt];
                                                                        setCategoryBidIncrements(updated);
                                                                    } else {
                                                                        setCategoryBidIncrements({
                                                                            ...categoryBidIncrements,
                                                                            [opt]: JSON.parse(e.target.value)
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Use Global Defaults (All 5 Slots)</option>
                                                                {bidIncrements.map((increment, idx) => {
                                                                    const singleSlotArray = [increment];
                                                                    let label = "";
                                                                    if (increment >= 10000000) label = `${(increment / 10000000).toFixed(1)}Cr`;
                                                                    else if (increment >= 100000) label = `${(increment / 100000).toFixed(1)}L`;
                                                                    else label = `${(increment / 1000).toFixed(0)}K`;

                                                                    return (
                                                                        <option key={idx} value={JSON.stringify(singleSlotArray)}>
                                                                            Slot {idx + 1} only ({label})
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                            <p className="text-[8px] text-slate-500 italic">Bid buttons shown when this category player is auctioned</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {categoryOptions[label]?.length === 0 && (
                                                    <p className="text-[10px] text-slate-500 italic">No options defined for {label}.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

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

                                    <div className="space-y-1.5 mt-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Global Default Base Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                            <Input
                                                type="number"
                                                value={rules.defaultBasePrice ?? ''}
                                                onChange={(e) => updateRule('defaultBasePrice', e.target.value)}
                                                placeholder="e.g. 2000000"
                                                className="bg-slate-900/50 border-slate-700 text-white h-10 pl-8 text-sm font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic">Fall-back base price for players if their category doesn't have one.</p>
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

            <ConfirmDialog
                isOpen={showUnsavedConfirm}
                onConfirm={handleSaveAndLeave}
                onCancel={() => setShowUnsavedConfirm(false)}
                title="Unsaved Changes"
                description="You have unsaved changes in your settings. Would you like to save them before leaving?"
                confirmText="Save & Leave"
                cancelText="Stay"
                extraActionText="Discard Changes"
                onExtraAction={handleDiscardAndLeave}
                variant="warning"
            />
        </div>
    );
}
