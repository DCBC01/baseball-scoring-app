import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Player, Game } from '@/types';

/**
 * Parses a CSV file and returns an array of objects
 */
export const parseCSV = async (fileUri: string, type: 'players' | 'games'): Promise<any[]> => {
  try {
    let csvContent: string;
    
    if (Platform.OS === 'web') {
      // For web, fetch the file
      const response = await fetch(fileUri);
      csvContent = await response.text();
    } else {
      // For native, read the file
      csvContent = await FileSystem.readAsStringAsync(fileUri);
    }
    
    // Parse CSV content
    const rows = csvContent.split(/\r?\n/);
    if (rows.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    // Extract headers (first row)
    const headers = parseCSVRow(rows[0]);
    
    // Process data rows
    const data = rows.slice(1)
      .filter(row => row.trim() !== '') // Skip empty rows
      .map(row => {
        const values = parseCSVRow(row);
        const obj: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          if (index < values.length) {
            obj[header] = values[index];
          }
        });
        
        return obj;
      });
    
    // Validate and transform the data based on type
    if (type === 'players') {
      return validateAndTransformPlayers(data, headers);
    } else {
      return validateAndTransformGames(data, headers);
    }
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Parses a CSV row, handling quoted values correctly
 */
const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Handle quotes
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        // Escaped quote inside quotes
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
};

/**
 * Validates and transforms player data from CSV
 */
const validateAndTransformPlayers = (data: Record<string, any>[], headers: string[]): Partial<Player>[] => {
  // Check required headers
  const requiredHeaders = ['name', 'position'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  
  // Transform and validate each player
  return data.map((row, index) => {
    // Validate required fields
    if (!row.name) {
      throw new Error(`Row ${index + 2}: Missing player name`);
    }
    
    if (!row.position) {
      throw new Error(`Row ${index + 2}: Missing player position`);
    }
    
    // Create player object with correct types
    const player: Partial<Player> = {
      name: String(row.name).trim(),
      position: String(row.position).trim(),
      number: row.number ? parseInt(row.number, 10) : undefined,
      email: row.email ? String(row.email).trim() : undefined,
      phone: row.phone ? String(row.phone).trim() : undefined,
      image: row.image ? String(row.image).trim() : undefined,
      teamIds: row.teamIds ? String(row.teamIds).split(';').map(id => id.trim()) : [],
    };
    
    return player;
  });
};

/**
 * Validates and transforms game data from CSV
 */
const validateAndTransformGames = (data: Record<string, any>[], headers: string[]): Partial<Game>[] => {
  // Check required headers
  const requiredHeaders = ['teamId', 'opponent', 'date', 'location'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  
  // Transform and validate each game
  return data.map((row, index) => {
    // Validate required fields
    if (!row.teamId) {
      throw new Error(`Row ${index + 2}: Missing team ID`);
    }
    
    if (!row.opponent) {
      throw new Error(`Row ${index + 2}: Missing opponent name`);
    }
    
    if (!row.date) {
      throw new Error(`Row ${index + 2}: Missing game date`);
    }
    
    if (!row.location) {
      throw new Error(`Row ${index + 2}: Missing game location`);
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;
    if (!dateRegex.test(row.date)) {
      throw new Error(`Row ${index + 2}: Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS`);
    }
    
    // Create game object with correct types
    const game: Partial<Game> = {
      teamId: String(row.teamId).trim(),
      opponent: String(row.opponent).trim(),
      date: String(row.date).trim(),
      location: String(row.location).trim(),
      participants: row.participants ? String(row.participants).split(';').map(id => id.trim()) : [],
    };
    
    return game;
  });
};