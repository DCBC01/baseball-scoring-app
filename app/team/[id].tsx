import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { 
  Users, 
  Calendar, 
  Edit, 
  ChevronRight 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTeamStore } from '@/store/team-store';
import { usePlayerStore } from '@/store/player-store';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import PlayerCard from '@/components/PlayerCard';
import GameCard from '@/components/GameCard';
import Button from '@/components/Button';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTeamById } = useTeamStore();
  const { getPlayersByTeam } = usePlayerStore();
  const { getGamesByTeam } = useGameStore();
  const { isAdmin } = useAuthStore();
  
  const team = getTeamById(id);
  const players = getPlayersByTeam(id);
  const games = getGamesByTeam(id);
  
  // Sort games by date (newest first)
  const sortedGames = [...games].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Take only the next 3 games
  const upcomingGames = sortedGames.filter(game => !game.isCompleted).slice(0, 3);
  
  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Team not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  const handlePlayerPress = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };
  
  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };
  
  const handleEditTeam = () => {
    router.push(`/team/edit/${id}`);
  };
  
  const handleViewAllGames = () => {
    // Navigate to games tab with this team pre-selected
    router.push('/games');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={[styles.teamImageContainer, { backgroundColor: team.color + '20' }]}>
          {team.image ? (
            <Image
              source={{ uri: team.image }}
              style={styles.teamImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.teamImagePlaceholder, { backgroundColor: team.color }]} />
          )}
        </View>
        
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.description && (
            <Text style={styles.teamDescription}>{team.description}</Text>
          )}
          <Text style={styles.playerCount}>{players.length} players</Text>
        </View>
        
        {isAdmin() && (
          <Button
            title="Edit"
            onPress={handleEditTeam}
            variant="outline"
            size="small"
            icon={<Edit size={16} color={Colors.primary} />}
            style={styles.editButton}
          />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={Colors.text} />
              <Text style={styles.sectionTitle}>Team Players</Text>
            </View>
          </View>
          
          {players.length > 0 ? (
            <FlatList
              data={players}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PlayerCard 
                  player={item} 
                  onPress={() => handlePlayerPress(item.id)}
                  showStats={false}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playersList}
            />
          ) : (
            <Text style={styles.emptyText}>No players assigned to this team yet.</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Calendar size={20} color={Colors.text} />
              <Text style={styles.sectionTitle}>Upcoming Games</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleViewAllGames}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {upcomingGames.length > 0 ? (
            upcomingGames.map(game => (
              <GameCard 
                key={game.id}
                game={game} 
                onPress={() => handleGamePress(game.id)}
                showTeam={false}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming games scheduled for this team.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
  },
  teamImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  teamImage: {
    width: '100%',
    height: '100%',
  },
  teamImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  teamInfo: {
    marginBottom: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  playerCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  playersList: {
    paddingBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
});