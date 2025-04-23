import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, ChevronRight, Camera, Edit } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useGameStore } from '@/store/game-store';
import { useTeamStore } from '@/store/team-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { games } = useGameStore();
  const { teams } = useTeamStore();
  const { user, isAdmin, isManager, updateAppSettings, appSettings } = useAuthStore();
  
  // Get current date
  const today = new Date();
  
  // Filter upcoming games for the next 7 days
  const upcomingGames = games
    .filter(game => {
      const gameDate = new Date(game.date);
      const diffTime = gameDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && !game.isCompleted;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  const handleChangeLogo = async () => {
    if (!isAdmin()) {
      Alert.alert("Permission Denied", "Only admins can change the logo.");
      return;
    }
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos.");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, you would upload this to a server
        // For now, we'll just store the URI in the app settings
        updateAppSettings({ logoUri: result.assets[0].uri });
        Alert.alert("Success", "Logo updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update logo. Please try again.");
      console.error("Error updating logo:", error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <TouchableOpacity 
            style={styles.logoCircle}
            onPress={isAdmin() ? handleChangeLogo : undefined}
            activeOpacity={isAdmin() ? 0.7 : 1}
          >
            {appSettings?.logoUri ? (
              <Image
                source={{ uri: appSettings.logoUri }}
                style={styles.logo}
              />
            ) : (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1508344928928-7165b0c396be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
                style={styles.logo}
              />
            )}
            
            {isAdmin() && (
              <View style={styles.editIconContainer}>
                <Camera size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome to the DCBC Player Voting App
          </Text>
          <Text style={styles.welcomeSubtext}>
            Here are the upcoming games for this week
          </Text>
        </View>
        
        <View style={styles.upcomingGamesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week's Games</Text>
            <TouchableOpacity onPress={() => router.push('/games')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingGames.length > 0 ? (
            upcomingGames.map(game => (
              <TouchableOpacity 
                key={game.id} 
                style={styles.gameCard}
                onPress={() => router.push(`/game/${game.id}`)}
              >
                <View style={styles.gameCardHeader}>
                  <Text style={styles.gameTeam}>{getTeamName(game.teamId)}</Text>
                  <Text style={styles.gameVs}>vs</Text>
                  <Text style={styles.gameOpponent}>{game.opponent}</Text>
                </View>
                
                <View style={styles.gameCardDetails}>
                  <View style={styles.gameDetail}>
                    <Calendar size={16} color={Colors.primary} />
                    <Text style={styles.gameDetailText}>{formatDate(game.date)}</Text>
                  </View>
                  
                  <View style={styles.gameDetail}>
                    <MapPin size={16} color={Colors.primary} />
                    <Text style={styles.gameDetailText}>{game.location}</Text>
                  </View>
                </View>
                
                <View style={styles.gameCardFooter}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming games this week</Text>
            </View>
          )}
        </View>
        
        {(isAdmin() || isManager()) && (
          <View style={styles.adminSection}>
            <Text style={styles.adminSectionTitle}>Quick Actions</Text>
            
            <View style={styles.adminButtons}>
              <Button
                title="Add Game"
                onPress={() => router.push('/game/new')}
                style={styles.adminButton}
              />
              
              <Button
                title="Add Player"
                onPress={() => router.push('/player/new')}
                style={styles.adminButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 3,
    borderColor: Colors.primary + '30',
    position: 'relative',
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  welcomeSection: {
    padding: 16,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  upcomingGamesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  gameCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  gameTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  gameVs: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },
  gameOpponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  gameCardDetails: {
    padding: 16,
  },
  gameDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDetailText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  gameCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: Colors.gray[100],
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  adminSection: {
    padding: 16,
    marginTop: 8,
  },
  adminSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  adminButton: {
    flex: 1,
  },
});