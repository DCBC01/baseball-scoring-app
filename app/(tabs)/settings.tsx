import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView, Share, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings, 
  FileText, 
  Award, 
  Download, 
  ChevronRight,
  Info,
  HelpCircle,
  Calendar,
  LogOut,
  Shield,
  Mail
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { usePlayerStore } from '@/store/player-store';
import Button from '@/components/Button';
import ExportModal from '@/components/ExportModal';
import { 
  convertToCSV, 
  downloadCSV, 
  shareCSV, 
  formatScoresForExport, 
  formatVotesForExport 
} from '@/utils/csv-export';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAdmin, isManager, logout, user } = useAuthStore();
  const { games, scores, votes } = useGameStore();
  const { players } = usePlayerStore();
  
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState<'scores' | 'votes'>('scores');
  
  // Convert players array to a map for easier lookup
  const playersMap = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as { [key: string]: typeof players[0] });
  
  const handleExportData = (dataType: 'scores' | 'votes') => {
    setExportType(dataType);
    setExportModalVisible(true);
  };
  
  const handleDownloadCSV = () => {
    let csvData = '';
    let fileName = '';
    
    if (exportType === 'scores') {
      const formattedData = formatScoresForExport(scores, playersMap);
      csvData = convertToCSV(formattedData, ['gameId', 'playerId', 'playerName', 'points']);
      fileName = 'dcbc_player_scores.csv';
    } else {
      const formattedData = formatVotesForExport(votes, playersMap);
      csvData = convertToCSV(formattedData, [
        'gameId', 'voterId', 'voterName', 'bestFielderId', 
        'bestFielderName', 'bestBatterId', 'bestBatterName'
      ]);
      fileName = 'dcbc_voting_results.csv';
    }
    
    if (Platform.OS === 'web') {
      downloadCSV(csvData, fileName);
    }
    
    setExportModalVisible(false);
  };
  
  const handleShareCSV = async () => {
    let csvData = '';
    let fileName = '';
    
    if (exportType === 'scores') {
      const formattedData = formatScoresForExport(scores, playersMap);
      csvData = convertToCSV(formattedData, ['gameId', 'playerId', 'playerName', 'points']);
      fileName = 'dcbc_player_scores.csv';
    } else {
      const formattedData = formatVotesForExport(votes, playersMap);
      csvData = convertToCSV(formattedData, [
        'gameId', 'voterId', 'voterName', 'bestFielderId', 
        'bestFielderName', 'bestBatterId', 'bestBatterName'
      ]);
      fileName = 'dcbc_voting_results.csv';
    }
    
    if (Platform.OS !== 'web') {
      await shareCSV(csvData, fileName);
    }
    
    setExportModalVisible(false);
  };
  
  const handleEmailCSV = () => {
    let csvData = '';
    let subject = '';
    
    if (exportType === 'scores') {
      const formattedData = formatScoresForExport(scores, playersMap);
      csvData = convertToCSV(formattedData, ['gameId', 'playerId', 'playerName', 'points']);
      subject = 'DCBC Player Scores';
    } else {
      const formattedData = formatVotesForExport(votes, playersMap);
      csvData = convertToCSV(formattedData, [
        'gameId', 'voterId', 'voterName', 'bestFielderId', 
        'bestFielderName', 'bestBatterId', 'bestBatterName'
      ]);
      subject = 'DCBC Voting Results';
    }
    
    // On web, we can't directly attach files to emails, so we'll download instead
    if (Platform.OS === 'web') {
      Alert.alert(
        'Email CSV',
        'On web, we cannot directly attach files to emails. Please download the CSV and attach it to your email manually.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download Instead', onPress: handleDownloadCSV }
        ]
      );
    } else {
      // On mobile, we can use mailto: with the CSV data in the body
      // Note: This won't attach the file, but will include the data in the email body
      const body = encodeURIComponent(csvData);
      Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`);
    }
    
    setExportModalVisible(false);
  };
  
  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  };
  
  const handleGoToAdminDashboard = () => {
    router.push('/admin');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
            router.replace('/(auth)');
          }
        },
      ]
    );
  };
  
  const renderAdminSection = () => {
    if (!isAdmin() && !isManager()) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Tools</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleGoToAdminDashboard}
        >
          <View style={styles.settingIcon}>
            <Shield size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Admin Dashboard</Text>
            <Text style={styles.settingDescription}>Access admin controls and management tools</Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </TouchableOpacity>
        
        {/* Only show leaderboard, export points and voting data to admins */}
        {isAdmin() && (
          <>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleViewLeaderboard}
            >
              <View style={styles.settingIcon}>
                <Award size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Leaderboard</Text>
                <Text style={styles.settingDescription}>View season leaderboards for points and votes</Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleExportData('scores')}
            >
              <View style={styles.settingIcon}>
                <FileText size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Export Game Points</Text>
                <Text style={styles.settingDescription}>Download player points data as CSV</Text>
              </View>
              <Download size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleExportData('votes')}
            >
              <View style={styles.settingIcon}>
                <FileText size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Export Voting Data</Text>
                <Text style={styles.settingDescription}>Download player voting data as CSV</Text>
              </View>
              <Download size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Settings size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Info size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>Get help using the app</Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{games.length}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            
            {/* Only show games played for all users */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user?.playerId ? games.filter(g => 
                  g.participants && g.participants.includes(user.playerId || "")
                ).length : 0}
              </Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
          </View>
        </View>
        
        {renderAdminSection()}
        
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={20} color={Colors.primary} />}
          />
        </View>
      </ScrollView>
      
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onDownload={handleDownloadCSV}
        onShare={handleShareCSV}
        onEmail={handleEmailCSV}
        title={exportType === 'scores' ? 'Export Game Points' : 'Export Voting Data'}
        description={
          exportType === 'scores' 
            ? 'Export player points data as a CSV file. You can download, share, or email this data.'
            : 'Export player voting data as a CSV file. You can download, share, or email this data.'
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});