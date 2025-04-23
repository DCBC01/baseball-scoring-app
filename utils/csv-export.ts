import { Score, Vote, Player, Game } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Converts an array of objects to CSV format
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (data.length === 0) return '';
  
  // If headers are not provided, use the keys of the first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create the header row
  let csv = csvHeaders.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      // Get the value for this header
      const value = header.includes('.') 
        ? header.split('.').reduce((obj, key) => obj && obj[key], item) 
        : item[header];
      
      // Handle different value types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      return value;
    }).join(',');
    
    csv += row + '\n';
  });
  
  return csv;
};

/**
 * Formats scores data for CSV export
 */
export const formatScoresForExport = (
  scores: Score[], 
  players: { [key: string]: Player }
): any[] => {
  return scores.map(score => ({
    gameId: score.gameId,
    playerId: score.playerId,
    playerName: players[score.playerId]?.name || 'Unknown Player',
    points: score.points
  }));
};

/**
 * Formats votes data for CSV export
 */
export const formatVotesForExport = (
  votes: Vote[], 
  players: { [key: string]: Player }
): any[] => {
  return votes.map(vote => ({
    gameId: vote.gameId,
    voterId: vote.voterId,
    voterName: players[vote.voterId]?.name || 'Unknown Voter',
    bestFielderId: vote.bestFielderId,
    bestFielderName: vote.bestFielderId ? (players[vote.bestFielderId]?.name || 'Unknown Player') : '',
    bestBatterId: vote.bestBatterId,
    bestBatterName: vote.bestBatterId ? (players[vote.bestBatterId]?.name || 'Unknown Player') : ''
  }));
};

/**
 * Creates template data for player imports
 */
export const createPlayerTemplateData = (): any[] => {
  return [
    {
      name: "John Smith",
      position: "Pitcher",
      number: 42,
      email: "john.smith@example.com",
      phone: "555-123-4567",
      image: "",
      teamIds: "team1;team2"
    },
    {
      name: "Jane Doe",
      position: "Catcher",
      number: 7,
      email: "jane.doe@example.com",
      phone: "555-987-6543",
      image: "",
      teamIds: "team1"
    }
  ];
};

/**
 * Creates template data for game imports
 */
export const createGameTemplateData = (): any[] => {
  return [
    {
      teamId: "team1",
      opponent: "Rival Team",
      date: "2023-06-15T18:00:00",
      location: "Home Field",
      participants: "player1;player2;player3"
    },
    {
      teamId: "team1",
      opponent: "Away Team",
      date: "2023-06-22T19:30:00",
      location: "Away Field",
      participants: ""
    }
  ];
};

/**
 * Downloads a template CSV file
 */
export const downloadTemplate = (type: 'players' | 'games'): void => {
  const templateData = type === 'players' 
    ? createPlayerTemplateData() 
    : createGameTemplateData();
  
  const csvContent = convertToCSV(templateData);
  const fileName = `${type}_template.csv`;
  
  if (Platform.OS === 'web') {
    downloadCSV(csvContent, fileName);
  } else {
    shareCSV(csvContent, fileName);
  }
};

/**
 * Downloads a CSV file (web only)
 */
export const downloadCSV = (csvContent: string, fileName: string): void => {
  if (Platform.OS !== 'web') return;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Shares a CSV file (mobile only)
 */
export const shareCSV = async (csvContent: string, fileName: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    // Create a temporary file
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Share ${fileName}`,
        UTI: 'public.comma-separated-values-text'
      });
    } else {
      console.log('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing CSV:', error);
  }
};