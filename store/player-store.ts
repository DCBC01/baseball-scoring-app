import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '@/types';
import { mockPlayers } from '@/mocks/players';

interface PlayerState {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id' | 'totalPoints' | 'bestFielder' | 'bestBatter' | 'teamIds'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayersSortedByPoints: () => Player[];
  getPlayersByTeam: (teamId: string) => Player[];
  addPlayerToTeam: (playerId: string, teamId: string) => void;
  removePlayerFromTeam: (playerId: string, teamId: string) => void;
  updatePlayerTeams: (playerId: string, teamIds: string[]) => void;
  bulkImportPlayers: (players: Partial<Player>[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      players: mockPlayers,
      
      addPlayer: (playerData) => {
        const newPlayer: Player = {
          id: Date.now().toString(),
          ...playerData,
          totalPoints: 0,
          bestFielder: 0,
          bestBatter: 0,
          teamIds: [],
        };
        
        set((state) => ({
          players: [...state.players, newPlayer],
        }));
      },
      
      updatePlayer: (updatedPlayer) => {
        set((state) => ({
          players: state.players.map((player) => 
            player.id === updatedPlayer.id ? updatedPlayer : player
          ),
        }));
      },
      
      deletePlayer: (id) => {
        set((state) => ({
          players: state.players.filter((player) => player.id !== id),
        }));
      },
      
      getPlayerById: (id) => {
        return get().players.find((player) => player.id === id);
      },
      
      getPlayersSortedByPoints: () => {
        return [...get().players].sort((a, b) => b.totalPoints - a.totalPoints);
      },
      
      getPlayersByTeam: (teamId) => {
        return get().players.filter(player => player.teamIds.includes(teamId));
      },
      
      addPlayerToTeam: (playerId, teamId) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id === playerId && !player.teamIds.includes(teamId)) {
              return {
                ...player,
                teamIds: [...player.teamIds, teamId]
              };
            }
            return player;
          }),
        }));
      },
      
      removePlayerFromTeam: (playerId, teamId) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id === playerId) {
              return {
                ...player,
                teamIds: player.teamIds.filter(id => id !== teamId)
              };
            }
            return player;
          }),
        }));
      },
      
      updatePlayerTeams: (playerId, teamIds) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id === playerId) {
              return {
                ...player,
                teamIds
              };
            }
            return player;
          }),
        }));
      },
      
      bulkImportPlayers: (playersData) => {
        const newPlayers = playersData.map(playerData => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: playerData.name || 'Unknown Player',
          position: playerData.position || 'Unknown Position',
          teamId: playerData.teamId || '',
          number: playerData.number || undefined,
          totalPoints: 0,
          bestFielder: 0,
          bestBatter: 0,
          image: playerData.image || undefined,
          teamIds: playerData.teamIds || [],
          email: playerData.email || undefined,
          phone: playerData.phone || undefined,
        }));
        
        set((state) => ({
          players: [...state.players, ...newPlayers],
        }));
      },
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);