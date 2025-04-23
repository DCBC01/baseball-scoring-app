import { Player } from '@/types';

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Mike Trout',
    position: 'Outfield',
    number: 27,
    image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 12,
    bestFielder: 3,
    bestBatter: 5,
    teamIds: ['1', '2']
  },
  {
    id: '2',
    name: 'Aaron Judge',
    position: 'Outfield',
    number: 99,
    image: 'https://images.unsplash.com/photo-1519625073050-2815233885ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 9,
    bestFielder: 1,
    bestBatter: 4,
    teamIds: ['1']
  },
  {
    id: '3',
    name: 'Shohei Ohtani',
    position: 'Pitcher/DH',
    number: 17,
    image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 15,
    bestFielder: 2,
    bestBatter: 7,
    teamIds: ['1']
  },
  {
    id: '4',
    name: 'Mookie Betts',
    position: 'Outfield',
    number: 50,
    image: 'https://images.unsplash.com/photo-1516731415730-0c607149933a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 7,
    bestFielder: 4,
    bestBatter: 2,
    teamIds: ['2']
  },
  {
    id: '5',
    name: 'Fernando Tatis Jr.',
    position: 'Shortstop',
    number: 23,
    image: 'https://images.unsplash.com/photo-1508341421810-36b8fc06075b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 11,
    bestFielder: 5,
    bestBatter: 3,
    teamIds: ['1', '3']
  },
  {
    id: '6',
    name: 'Jessica Martinez',
    position: 'Pitcher',
    number: 14,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 8,
    bestFielder: 2,
    bestBatter: 3,
    teamIds: ['4']
  },
  {
    id: '7',
    name: 'Sarah Johnson',
    position: 'Catcher',
    number: 22,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 6,
    bestFielder: 3,
    bestBatter: 1,
    teamIds: ['4', '5']
  },
  {
    id: '8',
    name: 'Tyler Williams',
    position: 'First Base',
    number: 34,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 4,
    bestFielder: 1,
    bestBatter: 2,
    teamIds: ['6']
  },
  {
    id: '9',
    name: 'Emma Davis',
    position: 'Second Base',
    number: 7,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 3,
    bestFielder: 1,
    bestBatter: 1,
    teamIds: ['5']
  },
  {
    id: '10',
    name: 'Jake Thompson',
    position: 'Third Base',
    number: 12,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    totalPoints: 5,
    bestFielder: 2,
    bestBatter: 1,
    teamIds: ['7']
  }
];