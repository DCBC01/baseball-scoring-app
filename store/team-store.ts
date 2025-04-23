import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team } from '@/types';
import { mockTeams } from '@/mocks/teams';

interface TeamState {
  teams: Team[];
  
  // Team CRUD operations
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  
  // Team getters
  getTeamById: (id: string) => Team | undefined;
  getTeamsByIds: (ids: string[]) => Team[];
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: mockTeams,
      
      addTeam: (teamData) => {
        const newTeam: Team = {
          id: Date.now().toString(),
          ...teamData,
        };
        
        set((state) => ({
          teams: [...state.teams, newTeam],
        }));
      },
      
      updateTeam: (updatedTeam) => {
        set((state) => ({
          teams: state.teams.map((team) => 
            team.id === updatedTeam.id ? updatedTeam : team
          ),
        }));
      },
      
      deleteTeam: (id) => {
        set((state) => ({
          teams: state.teams.filter((team) => team.id !== id),
        }));
      },
      
      getTeamById: (id) => {
        return get().teams.find((team) => team.id === id);
      },
      
      getTeamsByIds: (ids) => {
        return get().teams.filter((team) => ids.includes(team.id));
      },
    }),
    {
      name: 'team-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);