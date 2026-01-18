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

export interface AppConfig {
  tournamentName: string;
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
