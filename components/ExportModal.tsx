import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { X, Download, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from './Button';
import { usePlayerStore } from '@/store/player-store';
import { useGameStore } from '@/store/game-store';
import { 
  convertToCSV, 
  formatScoresForExport, 
  formatVotesForExport, 
  downloadCSV, 
  shareCSV 
} from '@/utils/csv-export';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExportType = 'players' | 'games' | 'scores' | 'votes';

export default function ExportModal({ visible, onClose }: ExportModalProps) {
  const { players } = usePlayerStore();
  const { games, scores, votes } = useGameStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const resetState = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleExport = async (type: ExportType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let csvContent = '';
      let fileName = '';
      
      // Create a map of players for quick lookup
      const playersMap = players.reduce((acc, player) => {
        acc[player.id] = player;
        return acc;
      }, {} as Record<string, typeof players[0]>);
      
      switch (type) {
        case 'players':
          csvContent = convertToCSV(players);
          fileName = 'players_export.csv';
          break;
        
        case 'games':
          csvContent = convertToCSV(games);
          fileName = 'games_export.csv';
          break;
        
        case 'scores':
          const formattedScores = formatScoresForExport(scores, playersMap);
          csvContent = convertToCSV(formattedScores);
          fileName = 'scores_export.csv';
          break;
        
        case 'votes':
          const formattedVotes = formatVotesForExport(votes, playersMap);
          csvContent = convertToCSV(formattedVotes);
          fileName = 'votes_export.csv';
          break;
      }
      
      if (Platform.OS === 'web') {
        downloadCSV(csvContent, fileName);
        setSuccess(`${fileName} downloaded successfully`);
      } else {
        await shareCSV(csvContent, fileName);
        setSuccess(`${fileName} shared successfully`);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      console.error('Export error:', err);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Export Data</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Export your data as CSV files that can be opened in Excel, Google Sheets, or other spreadsheet applications.
            </Text>
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Preparing export...</Text>
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {success && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}
            
            <View style={styles.exportSection}>
              <View style={styles.exportOption}>
                <View style={styles.exportOptionHeader}>
                  <FileText size={20} color={Colors.primary} />
                  <Text style={styles.exportOptionTitle}>Players</Text>
                </View>
                <Text style={styles.exportOptionDescription}>
                  Export all player data including names, positions, and team assignments.
                </Text>
                <Button
                  title="Export Players"
                  onPress={() => handleExport('players')}
                  variant="outline"
                  icon={<Download size={16} color={Colors.primary} />}
                  style={styles.exportButton}
                  disabled={loading}
                />
              </View>
              
              <View style={styles.exportOption}>
                <View style={styles.exportOptionHeader}>
                  <FileText size={20} color={Colors.primary} />
                  <Text style={styles.exportOptionTitle}>Games</Text>
                </View>
                <Text style={styles.exportOptionDescription}>
                  Export all game data including dates, locations, and results.
                </Text>
                <Button
                  title="Export Games"
                  onPress={() => handleExport('games')}
                  variant="outline"
                  icon={<Download size={16} color={Colors.primary} />}
                  style={styles.exportButton}
                  disabled={loading}
                />
              </View>
              
              <View style={styles.exportOption}>
                <View style={styles.exportOptionHeader}>
                  <FileText size={20} color={Colors.primary} />
                  <Text style={styles.exportOptionTitle}>Scores</Text>
                </View>
                <Text style={styles.exportOptionDescription}>
                  Export all player scores from games.
                </Text>
                <Button
                  title="Export Scores"
                  onPress={() => handleExport('scores')}
                  variant="outline"
                  icon={<Download size={16} color={Colors.primary} />}
                  style={styles.exportButton}
                  disabled={loading}
                />
              </View>
              
              <View style={styles.exportOption}>
                <View style={styles.exportOptionHeader}>
                  <FileText size={20} color={Colors.primary} />
                  <Text style={styles.exportOptionTitle}>Votes</Text>
                </View>
                <Text style={styles.exportOptionDescription}>
                  Export all player votes for best fielder and best batter.
                </Text>
                <Button
                  title="Export Votes"
                  onPress={() => handleExport('votes')}
                  variant="outline"
                  icon={<Download size={16} color={Colors.primary} />}
                  style={styles.exportButton}
                  disabled={loading}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Close"
              onPress={handleClose}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  exportSection: {
    marginTop: 8,
  },
  exportOption: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  exportOptionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  exportButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  successContainer: {
    padding: 12,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: 'green',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    width: '100%',
  },
});