export enum UserRole {
  Player = 'player',
  Manager = 'manager',
  Admin = 'admin',
  MasterAdmin = 'masterAdmin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  playerId?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppSettings {
  logoUri: string | null;
  // Add other app settings as needed
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  teamId: string;
  number?: number;
  totalPoints: number;
  bestFielder: number;
  bestBatter: number;
  image?: string;
  teamIds: string[];
  email?: string;
  phone?: string;
}

export interface Game {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  location: string;
  isCompleted: boolean;
  votingOpen?: boolean;
  pointsAssigned?: boolean;
  result?: {
    team: number;
    opponent: number;
  };
  participants: string[]; // Array of player IDs
}

export interface Score {
  id: string;
  gameId: string;
  playerId: string;
  points: number;
}

export interface Vote {
  id: string;
  gameId: string;
  voterId: string;
  bestFielderId: string | null;
  bestBatterId: string | null;
}

export interface PlayerVote {
  gameId: string;
  voterId: string;
  bestFielderId: string | null;
  bestBatterId: string | null;
}