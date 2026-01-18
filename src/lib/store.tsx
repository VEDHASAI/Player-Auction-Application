'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Player, Team, AuctionState, AuctionHistoryItem, DEFAULT_BUDGET } from './types';

// State Definition
interface AppState {
    teams: Team[];
    players: Player[];
    auction: AuctionState;
    config: {
        tournamentName: string;
    };
}

// Initial State
const initialState: AppState = {
    teams: [],
    players: [],
    auction: {
        currentPlayerId: null,
        currentBid: 0,
        lastBidderTeamId: null,
        history: [],
        bidHistory: [],
        isAuctionActive: false,
    },
    config: {
        tournamentName: "My Auction",
    },
};

// Actions
type Action =
    | { type: 'LOAD_STATE'; payload: AppState }
    | { type: 'ADD_TEAM'; payload: Team }
    | { type: 'UPDATE_TEAM'; payload: Team }
    | { type: 'DELETE_TEAM'; payload: string }
    | { type: 'ADD_PLAYER'; payload: Player }
    | { type: 'UPDATE_PLAYER'; payload: Player }
    | { type: 'DELETE_PLAYER'; payload: string }
    | { type: 'START_AUCTION_FOR_PLAYER'; payload: string } // playerId
    | { type: 'PLACE_BID'; payload: { teamId: string; amount: number } }
    | { type: 'UNDO_BID' }
    | { type: 'SELL_PLAYER'; payload: { playerId: string; teamId: string; amount: number } }
    | { type: 'PASS_PLAYER'; payload: string } // playerId
    | { type: 'UPDATE_SETTINGS'; payload: { tournamentName: string } }
    | { type: 'UPDATE_SETTINGS'; payload: { tournamentName: string } }
    | { type: 'CANCEL_AUCTION_ROUND' }
    | { type: 'RELEASE_PLAYER'; payload: { playerId: string; teamId: string } }
    | { type: 'RESET_AUCTION' };

// Reducer
function auctionReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'LOAD_STATE':
            return {
                ...initialState,
                ...action.payload,
                config: action.payload.config || initialState.config
            };

        case 'ADD_TEAM':
            return { ...state, teams: [...state.teams, action.payload] };

        case 'UPDATE_TEAM': {
            const updatedTeam = action.payload;
            return {
                ...state,
                teams: state.teams.map(t => {
                    if (t.id === updatedTeam.id) {
                        // Calculate budget difference to preserve spending
                        const budgetDiff = updatedTeam.totalBudget - t.totalBudget;
                        return {
                            ...updatedTeam,
                            remainingBudget: t.remainingBudget + budgetDiff,
                            players: t.players // Preserve players list
                        };
                    }
                    return t;
                })
            };
        }

        case 'DELETE_TEAM':
            return { ...state, teams: state.teams.filter(t => t.id !== action.payload) };

        case 'ADD_PLAYER':
            return { ...state, players: [...state.players, action.payload] };

        case 'UPDATE_PLAYER':
            return {
                ...state,
                players: state.players.map(p => p.id === action.payload.id ? action.payload : p)
            };

        case 'DELETE_PLAYER':
            return { ...state, players: state.players.filter(p => p.id !== action.payload) };

        case 'START_AUCTION_FOR_PLAYER': {
            const player = state.players.find(p => p.id === action.payload);
            if (!player) return state;
            return {
                ...state,
                auction: {
                    ...state.auction,
                    currentPlayerId: player.id,
                    currentBid: player.basePrice, // Start at base price
                    lastBidderTeamId: null,
                    bidHistory: [], // Reset bid history for new player
                    isAuctionActive: true,
                }
            };
        }

        case 'PLACE_BID': {
            const { teamId, amount } = action.payload;
            if (!state.auction.isAuctionActive) return state;
            if (amount <= state.auction.currentBid) return state; // Valid bid check

            // Check if team has budget
            const team = state.teams.find(t => t.id === teamId);
            if (!team || team.remainingBudget < amount) return state;

            return {
                ...state,
                auction: {
                    ...state.auction,
                    currentBid: amount,
                    lastBidderTeamId: teamId,
                    // Push current state to history before updating
                    bidHistory: [
                        ...state.auction.bidHistory,
                        {
                            currentBid: state.auction.currentBid,
                            lastBidderTeamId: state.auction.lastBidderTeamId
                        }
                    ]
                }
            };
        }

        case 'UNDO_BID': {
            if (!state.auction.isAuctionActive || state.auction.bidHistory.length === 0) return state;

            const previousState = state.auction.bidHistory[state.auction.bidHistory.length - 1];
            const newHistory = state.auction.bidHistory.slice(0, -1);

            return {
                ...state,
                auction: {
                    ...state.auction,
                    currentBid: previousState.currentBid,
                    lastBidderTeamId: previousState.lastBidderTeamId,
                    bidHistory: newHistory
                }
            };
        }

        case 'SELL_PLAYER': {
            const { playerId, teamId, amount } = action.payload;

            // Update Team Budget
            const updatedTeams = state.teams.map(team => {
                if (team.id === teamId) {
                    return {
                        ...team,
                        remainingBudget: team.remainingBudget - amount,
                        players: [...team.players, playerId]
                    };
                }
                return team;
            });

            // Update Player Status
            const updatedPlayers = state.players.map(player => {
                if (player.id === playerId) {
                    return {
                        ...player,
                        status: 'Sold' as const,
                        soldPrice: amount,
                        soldToTeamId: teamId
                    };
                }
                return player;
            });

            // Add to History
            const historyItem: AuctionHistoryItem = {
                playerId,
                soldPrice: amount,
                soldToTeamId: teamId,
                timestamp: Date.now()
            };

            return {
                ...state,
                teams: updatedTeams,
                players: updatedPlayers,
                auction: {
                    ...state.auction,
                    currentPlayerId: null,
                    currentBid: 0,
                    lastBidderTeamId: null,
                    isAuctionActive: false,
                    history: [historyItem, ...state.auction.history]
                }
            };
        }

        case 'PASS_PLAYER': {
            const updatedPlayers = state.players.map(player => {
                if (player.id === action.payload) {
                    return {
                        ...player,
                        status: 'Unsold' as const
                    };
                }
                return player;
            });

            return {
                ...state,
                players: updatedPlayers,
                auction: {
                    ...state.auction,
                    currentPlayerId: null,
                    currentBid: 0,
                    lastBidderTeamId: null,
                    isAuctionActive: false,
                }
            };
        }

        case 'RELEASE_PLAYER': {
            const { playerId, teamId } = action.payload;
            const playerToRelease = state.players.find(p => p.id === playerId);
            if (!playerToRelease || !playerToRelease.soldPrice) return state;

            const refundAmount = playerToRelease.soldPrice;

            // Refund Team
            const updatedTeams = state.teams.map(team => {
                if (team.id === teamId) {
                    return {
                        ...team,
                        remainingBudget: team.remainingBudget + refundAmount,
                        players: team.players.filter(pId => pId !== playerId)
                    };
                }
                return team;
            });

            // Update Player Status to 'Unsold' (so they return to waiting room)
            const updatedPlayers = state.players.map(player => {
                if (player.id === playerId) {
                    return {
                        ...player,
                        status: 'Unsold' as const,
                        soldPrice: undefined,
                        soldToTeamId: undefined
                    };
                }
                return player;
            });

            return {
                ...state,
                teams: updatedTeams,
                players: updatedPlayers
            };
        }

        case 'CANCEL_AUCTION_ROUND':
            return {
                ...state,
                auction: {
                    ...state.auction,
                    currentPlayerId: null,
                    currentBid: 0,
                    lastBidderTeamId: null,
                    isAuctionActive: false,
                    bidHistory: [], // Clear history as we are cancelling
                }
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                config: {
                    ...state.config,
                    tournamentName: action.payload.tournamentName
                }
            };


        case 'RESET_AUCTION':
            return initialState;

        default:
            return state;
    }
}

// Context
const AuctionContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider
export function AuctionProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(auctionReducer, initialState);
    const lastSavedStateRef = React.useRef<string>('');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('auction_state');
        if (saved) {
            try {
                lastSavedStateRef.current = saved;
                dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }

        // Listen for storage events to sync across tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auction_state' && e.newValue && e.newValue !== lastSavedStateRef.current) {
                try {
                    lastSavedStateRef.current = e.newValue;
                    dispatch({ type: 'LOAD_STATE', payload: JSON.parse(e.newValue) });
                } catch (error) {
                    console.error("Failed to sync state from storage", error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        const stateString = JSON.stringify(state);
        if (stateString !== lastSavedStateRef.current) {
            lastSavedStateRef.current = stateString;
            localStorage.setItem('auction_state', stateString);
        }
    }, [state]);

    return (
        <AuctionContext.Provider value={{ state, dispatch }}>
            {children}
        </AuctionContext.Provider>
    );
}

// Hook
export function useAuction() {
    const context = useContext(AuctionContext);
    if (!context) {
        throw new Error('useAuction must be used within an AuctionProvider');
    }
    return context;
}
