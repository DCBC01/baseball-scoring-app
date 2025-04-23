import { User, UserRole } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@baseball.com',
    name: 'Admin User',
    role: UserRole.MasterAdmin,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'manager@baseball.com',
    name: 'Team Manager',
    role: UserRole.Manager,
    createdAt: '2023-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'mike@baseball.com',
    name: 'Mike Trout',
    role: UserRole.Player,
    playerId: '1',
    createdAt: '2023-01-03T00:00:00.000Z'
  },
  {
    id: '4',
    email: 'aaron@baseball.com',
    name: 'Aaron Judge',
    role: UserRole.Player,
    playerId: '2',
    createdAt: '2023-01-04T00:00:00.000Z'
  }
];