export type Role = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';

export type PlayerStatus = 'Available' | 'Sold' | 'Unsold';

export interface Player {
  id: string;
  name: string;
  role: Role;
  basePrice: number;
  status: PlayerStatus;
  soldPrice?: number;
  soldToTeamId?: string;
  imageUrl?: string;
  categories?: Record<string, string>;
}

export interface Team {
  id: string;
  name: string;
  totalBudget: number;
  remainingBudget: number;
  players: string[]; // List of player IDs
}

export interface AuctionState {
  currentPlayerId: string | null;
  currentBid: number;
  lastBidderTeamId: string | null; // Team ID of the highest bidder
  history: AuctionHistoryItem[];
  // Track bid history for the current active player to allow UNDO
  bidHistory: { currentBid: number; lastBidderTeamId: string | null }[];
  isAuctionActive: boolean;
}

export interface SquadRules {
  minPlayers?: number;
  maxPlayers?: number;
  minBatsmen?: number;
  maxBatsmen?: number;
  minBowlers?: number;
  maxBowlers?: number;
  minAllRounders?: number;
  maxAllRounders?: number;
  minWicketKeepers?: number;
  maxWicketKeepers?: number;
  categoryRules?: Record<string, { min?: number, max?: number }>;
  totalBudget?: number;
}

export type CurrencyUnit = 'Lakhs' | 'Crores' | 'Thousands';

export interface AppConfig {
  tournamentName: string;
  rules: SquadRules;
  currencyUnit: CurrencyUnit;
  categoryLabels?: string[];
  categoryOptions?: Record<string, string[]>;
  bidIncrements?: number[];
}

export interface AuctionHistoryItem {
  playerId: string;
  soldPrice: number;
  soldToTeamId: string;
  timestamp: number;
}



// Initial Logic / Constants
export const DEFAULT_BUDGET = 10000000; // Example 10 Crore
export const ROLES: Role[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];
