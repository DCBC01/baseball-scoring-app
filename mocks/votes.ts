import { Vote } from '@/types';

export const mockVotes: Vote[] = [
  // Game 1 votes
  { id: '1-1', gameId: '1', voterId: '1', bestFielderId: '3', bestBatterId: '1' },
  { id: '1-2', gameId: '1', voterId: '2', bestFielderId: '3', bestBatterId: '5' },
  { id: '1-3', gameId: '1', voterId: '3', bestFielderId: '5', bestBatterId: '1' },
  { id: '1-4', gameId: '1', voterId: '4', bestFielderId: '3', bestBatterId: '1' },
  { id: '1-5', gameId: '1', voterId: '5', bestFielderId: '3', bestBatterId: '1' },
  
  // Game 2 votes
  { id: '2-1', gameId: '2', voterId: '1', bestFielderId: '4', bestBatterId: '2' },
  { id: '2-2', gameId: '2', voterId: '2', bestFielderId: '4', bestBatterId: '2' },
  { id: '2-3', gameId: '2', voterId: '3', bestFielderId: '4', bestBatterId: '3' },
  { id: '2-4', gameId: '2', voterId: '4', bestFielderId: '1', bestBatterId: '2' },
  { id: '2-5', gameId: '2', voterId: '5', bestFielderId: '4', bestBatterId: '2' },
];