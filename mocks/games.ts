import { Game } from '@/types';

export const mockGames: Game[] = [
  {
    id: '1',
    date: '2023-06-01',
    opponent: 'Yankees',
    location: 'Home',
    result: 'W 5-3',
    isCompleted: true,
    votingOpen: false,
    pointsAssigned: true,
    participants: ['1', '2', '3', '4', '5'],
    teamId: '1'
  },
  {
    id: '2',
    date: '2023-06-08',
    opponent: 'Red Sox',
    location: 'Away',
    result: 'L 2-4',
    isCompleted: true,
    votingOpen: false,
    pointsAssigned: true,
    participants: ['1', '3', '4', '5'],
    teamId: '1'
  },
  {
    id: '3',
    date: '2023-06-15',
    opponent: 'Cubs',
    location: 'Home',
    result: 'W 7-2',
    isCompleted: true,
    votingOpen: true,
    pointsAssigned: false,
    participants: ['1', '2', '3', '5'],
    teamId: '1'
  },
  {
    id: '4',
    date: '2023-06-22',
    opponent: 'Dodgers',
    location: 'Away',
    isCompleted: false,
    votingOpen: false,
    pointsAssigned: false,
    participants: [],
    teamId: '1'
  },
  {
    id: '5',
    date: '2023-06-29',
    opponent: 'Giants',
    location: 'Home',
    isCompleted: false,
    votingOpen: false,
    pointsAssigned: false,
    participants: [],
    teamId: '1'
  },
  {
    id: '6',
    date: '2023-06-05',
    opponent: 'Marlins',
    location: 'Home',
    result: 'W 4-2',
    isCompleted: true,
    votingOpen: false,
    pointsAssigned: true,
    participants: ['6', '7', '9'],
    teamId: '4'
  },
  {
    id: '7',
    date: '2023-06-12',
    opponent: 'Cardinals',
    location: 'Away',
    result: 'L 1-3',
    isCompleted: true,
    votingOpen: false,
    pointsAssigned: true,
    participants: ['6', '7', '9'],
    teamId: '4'
  },
  {
    id: '8',
    date: '2023-06-19',
    opponent: 'Braves',
    location: 'Home',
    isCompleted: false,
    votingOpen: false,
    pointsAssigned: false,
    participants: [],
    teamId: '4'
  }
];