import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState, AppSettings } from '@/types';
import { mockUsers } from '@/mocks/users';

interface AuthStore extends AuthState {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  
  // User management
  updateUser: (user: Partial<User>) => void;
  linkPlayerToUser: (userId: string, playerId: string) => void;
  
  // Role management
  promoteToAdmin: (userId: string) => void;
  promoteToManager: (userId: string) => void;
  demoteToPlayer: (userId: string) => void;
  
  // Role checks
  isAdmin: () => boolean;
  isManager: () => boolean;
  isMasterAdmin: () => boolean;
  
  // User getters
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => User[];
  
  // Current user
  user: User | null;
  
  // App settings
  appSettings: AppSettings | null;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      appSettings: {
        logoUri: null,
      },
      
      // In a real app, these would make API calls
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find user by email (in a real app, this would be handled by the backend)
          const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          // In a real app, we would verify the password here
          
          set({ 
            isAuthenticated: true, 
            user, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      register: async (email: string, password: string, name: string, phone?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if email already exists
          const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            phone,
            // First user becomes master admin, others become players
            role: mockUsers.length === 0 ? UserRole.MasterAdmin : UserRole.Player,
            createdAt: new Date().toISOString()
          };
          
          // Add to mock users (in a real app, this would be handled by the backend)
          mockUsers.push(newUser);
          
          set({ 
            isAuthenticated: true, 
            user: newUser, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false, 
          user: null 
        });
      },
      
      updateUser: (userData) => {
        set(state => {
          if (!state.user) return state;
          
          const updatedUser = { ...state.user, ...userData };
          
          // Update in mock users array
          const userIndex = mockUsers.findIndex(u => u.id === state.user?.id);
          if (userIndex >= 0) {
            mockUsers[userIndex] = updatedUser;
          }
          
          return { user: updatedUser };
        });
      },
      
      linkPlayerToUser: (userId, playerId) => {
        // Find user in mock users
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            playerId
          };
          
          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set(state => ({
              user: state.user ? { ...state.user, playerId } : null
            }));
          }
        }
      },
      
      promoteToAdmin: (userId) => {
        // Only master admin can promote to admin
        if (!get().isMasterAdmin()) return;
        
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            role: UserRole.Admin
          };
          
          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set(state => ({
              user: state.user ? { ...state.user, role: UserRole.Admin } : null
            }));
          }
        }
      },
      
      promoteToManager: (userId) => {
        // Only admin or master admin can promote to manager
        if (!get().isAdmin()) return;
        
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            role: UserRole.Manager
          };
          
          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set(state => ({
              user: state.user ? { ...state.user, role: UserRole.Manager } : null
            }));
          }
        }
      },
      
      demoteToPlayer: (userId) => {
        // Only admin or master admin can demote
        if (!get().isAdmin()) return;
        
        // Cannot demote master admin
        const user = mockUsers.find(u => u.id === userId);
        if (user?.role === UserRole.MasterAdmin) return;
        
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            role: UserRole.Player
          };
          
          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set(state => ({
              user: state.user ? { ...state.user, role: UserRole.Player } : null
            }));
          }
        }
      },
      
      isAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.Admin || user?.role === UserRole.MasterAdmin;
      },
      
      isManager: () => {
        const { user } = get();
        return user?.role === UserRole.Manager || get().isAdmin();
      },
      
      isMasterAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.MasterAdmin;
      },
      
      getUserById: (id) => {
        return mockUsers.find(u => u.id === id);
      },
      
      getAllUsers: () => {
        return [...mockUsers];
      },
      
      updateAppSettings: (settings) => {
        set(state => ({
          appSettings: {
            ...state.appSettings,
            ...settings
          }
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);