import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Score, Vote } from '@/types';
import { mockGames } from '@/mocks/games';
import { mockScores } from '@/mocks/scores';
import { mockVotes } from '@/mocks/votes';

interface GameState {
  games: Game[];
  scores: Score[];
  votes: Vote[];
  
  // Game actions
  addGame: (game: Omit<Game, 'id' | 'isCompleted' | 'votingOpen' | 'pointsAssigned' | 'result' | 'participants'>) => void;
  updateGame: (game: Game) => void;
  deleteGame: (id: string) => void;
  completeGame: (id: string) => void;
  openVoting: (id: string) => void;
  closeVoting: (id: string) => void;
  updateParticipants: (gameId: string, participantIds: string[]) => void;
  getParticipants: (gameId: string) => string[];
  getGamesByTeam: (teamId: string) => Game[];
  getGamesByPlayer: (playerId: string) => Game[];
  bulkImportGames: (games: Partial<Game>[]) => void;
  
  // Score actions
  assignPoints: (gameId: string, playerPoints: { playerId: string; points: number }[]) => void;
  
  // Vote actions
  submitVote: (vote: Omit<Vote, 'id'>) => void;
  hasPlayerVoted: (gameId: string, playerId: string) => boolean;
  getPlayerVote: (gameId: string, playerId: string) => Vote | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: mockGames,
      scores: mockScores,
      votes: mockVotes,
      
      addGame: (game) => {
        const newGame: Game = {
          ...game,
          id: Date.now().toString(),
          isCompleted: false,
          votingOpen: false,
          pointsAssigned: false,
          participants: [],
        };
        
        set((state) => ({
          games: [...state.games, newGame],
        }));
      },
      
      updateGame: (updatedGame) => {
        set((state) => ({
          games: state.games.map((game) => 
            game.id === updatedGame.id ? updatedGame : game
          ),
        }));
      },
      
      deleteGame: (id) => {
        set((state) => ({
          games: state.games.filter((game) => game.id !== id),
          scores: state.scores.filter((score) => score.gameId !== id),
          votes: state.votes.filter((vote) => vote.gameId !== id),
        }));
      },
      
      completeGame: (id) => {
        set((state) => ({
          games: state.games.map((game) => 
            game.id === id ? { ...game, isCompleted: true } : game
          ),
        }));
      },
      
      openVoting: (id) => {
        set((state) => ({
          games: state.games.map((game) => 
            game.id === id ? { ...game, votingOpen: true } : game
          ),
        }));
      },
      
      closeVoting: (id) => {
        set((state) => ({
          games: state.games.map((game) => 
            game.id === id ? { ...game, votingOpen: false } : game
          ),
        }));
      },
      
      updateParticipants: (gameId, participantIds) => {
        set((state) => ({
          games: state.games.map((game) => 
            game.id === gameId ? { ...game, participants: participantIds } : game
          ),
        }));
      },
      
      getParticipants: (gameId) => {
        const game = get().games.find(g => g.id === gameId);
        return game?.participants || [];
      },
      
      getGamesByTeam: (teamId) => {
        return get().games.filter(game => game.teamId === teamId);
      },
      
      getGamesByPlayer: (playerId) => {
        return get().games.filter(game => 
          game.participants && game.participants.includes(playerId)
        );
      },
      
      bulkImportGames: (gamesData) => {
        const newGames = gamesData.map(gameData => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          teamId: gameData.teamId || '',
          opponent: gameData.opponent || 'Unknown Opponent',
          date: gameData.date || new Date().toISOString(),
          location: gameData.location || 'Unknown Location',
          isCompleted: false,
          votingOpen: false,
          pointsAssigned: false,
          participants: gameData.participants || [],
        }));
        
        set((state) => ({
          games: [...state.games, ...newGames],
        }));
      },
      
      assignPoints: (gameId, playerPoints) => {
        // Remove any existing scores for this game
        const filteredScores = get().scores.filter((score) => score.gameId !== gameId);
        
        // Create new scores
        const newScores = playerPoints.map((pp) => ({
          id: `${gameId}-${pp.playerId}`,
          gameId,
          playerId: pp.playerId,
          points: pp.points,
        }));
        
        // Mark game as having points assigned
        const updatedGames = get().games.map((game) => 
          game.id === gameId ? { ...game, pointsAssigned: true } : game
        );
        
        set({
          scores: [...filteredScores, ...newScores],
          games: updatedGames,
        });
      },
      
      submitVote: (vote) => {
        const { gameId, voterId, bestFielderId, bestBatterId } = vote;
        
        // Check if player has already voted
        const existingVoteIndex = get().votes.findIndex(
          (v) => v.gameId === gameId && v.voterId === voterId
        );
        
        if (existingVoteIndex >= 0) {
          // Update existing vote
          set((state) => ({
            votes: state.votes.map((v, index) => 
              index === existingVoteIndex 
                ? { ...v, bestFielderId, bestBatterId } 
                : v
            ),
          }));
        } else {
          // Add new vote
          const newVote: Vote = {
            id: `${gameId}-${voterId}`,
            gameId,
            voterId,
            bestFielderId,
            bestBatterId,
          };
          
          set((state) => ({
            votes: [...state.votes, newVote],
          }));
        }
      },
      
      hasPlayerVoted: (gameId, playerId) => {
        return get().votes.some(
          (vote) => vote.gameId === gameId && vote.voterId === playerId
        );
      },
      
      getPlayerVote: (gameId, playerId) => {
        return get().votes.find(
          (vote) => vote.gameId === gameId && vote.voterId === playerId
        ) || null;
      },
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);