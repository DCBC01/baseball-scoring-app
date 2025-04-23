import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Users, 
  Calendar, 
  Award, 
  LogOut, 
  UserPlus, 
  CalendarPlus,
  Settings,
  Shield,
  Upload,
  Download
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { usePlayerStore } from '@/store/player-store';
import { useGameStore } from '@/store/game-store';
import Button from '@/components/Button';
import ImportModal from '@/components/ImportModal';
import ExportModal from '@/components/ExportModal';
import { Player, Game } from '@/types';

export default function AdminScreen() {
  const router = useRouter();
  const { logout, isAdmin, isManager } = useAuthStore();
  const { bulkImportPlayers } = usePlayerStore();
  const { bulkImportGames } = useGameStore();
  
  const [playerImportModalVisible, setPlayerImportModalVisible] = useState(false);
  const [gameImportModalVisible, setGameImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          }
        },
      ]
    );
  };
  
  const handleImportPlayers = (players: Player[]) => {
    bulkImportPlayers(players);
    setPlayerImportModalVisible(false);
  };
  
  const handleImportGames = (games: Game[]) => {
    bulkImportGames(games);
    setGameImportModalVisible(false);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{isAdmin() ? 'Admin Dashboard' : 'Manager Dashboard'}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Management</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Users size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Manage Players</Text>
            </View>
            <Text style={styles.cardDescription}>
              Add, edit, or remove players from the team roster.
            </Text>
            <View style={styles.cardActions}>
              <Button
                title="View Players"
                onPress={() => router.push('/players')}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Add Player"
                onPress={() => router.push('/player/new')}
                variant="primary"
                icon={<UserPlus size={16} color="white" />}
                style={styles.actionButton}
              />
            </View>
            <View style={styles.importSection}>
              <Button
                title="Bulk Import Players"
                onPress={() => setPlayerImportModalVisible(true)}
                variant="outline"
                icon={<Upload size={16} color={Colors.primary} />}
                style={styles.fullButton}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Management</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Manage Games</Text>
            </View>
            <Text style={styles.cardDescription}>
              Schedule new games, update results, and manage player scoring.
            </Text>
            <View style={styles.cardActions}>
              <Button
                title="View Games"
                onPress={() => router.push('/games')}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Add Game"
                onPress={() => router.push('/game/new')}
                variant="primary"
                icon={<CalendarPlus size={16} color="white" />}
                style={styles.actionButton}
              />
            </View>
            <View style={styles.importSection}>
              <Button
                title="Bulk Import Games"
                onPress={() => setGameImportModalVisible(true)}
                variant="outline"
                icon={<Upload size={16} color={Colors.primary} />}
                style={styles.fullButton}
              />
            </View>
          </View>
        </View>
        
        {/* Only show leaderboard to admin, not to managers */}
        {isAdmin() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Season Stats</Text>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Award size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>View Leaderboard</Text>
              </View>
              <Text style={styles.cardDescription}>
                Check the current standings and player statistics for the season.
              </Text>
              <Button
                title="View Leaderboard"
                onPress={() => router.push('/leaderboard')}
                variant="primary"
                style={styles.fullButton}
              />
              <View style={styles.importSection}>
                <Button
                  title="Export Data"
                  onPress={() => setExportModalVisible(true)}
                  variant="outline"
                  icon={<Download size={16} color={Colors.primary} />}
                  style={styles.fullButton}
                />
              </View>
            </View>
          </View>
        )}
        
        {isAdmin() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Shield size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Manage Users</Text>
              </View>
              <Text style={styles.cardDescription}>
                Manage user accounts and assign roles (admin, manager, player).
              </Text>
              <Button
                title="Manage Users"
                onPress={() => router.push('/admin/users')}
                variant="primary"
                style={styles.fullButton}
              />
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Settings size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Account Settings</Text>
            </View>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              icon={<LogOut size={16} color={Colors.primary} />}
              style={styles.fullButton}
            />
          </View>
        </View>
      </ScrollView>
      
      <ImportModal
        visible={playerImportModalVisible}
        onClose={() => setPlayerImportModalVisible(false)}
        onImport={handleImportPlayers}
        type="players"
      />
      
      <ImportModal
        visible={gameImportModalVisible}
        onClose={() => setGameImportModalVisible(false)}
        onImport={handleImportGames}
        type="games"
      />
      
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fullButton: {
    width: '100%',
  },
  importSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});