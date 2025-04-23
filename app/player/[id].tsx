import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { 
  User, 
  Mail,
  Phone,
  Calendar,
  Edit, 
  Trash 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { players, deletePlayer } = usePlayerStore();
  const { scores, games, getGamesByPlayer } = useGameStore();
  const { isAdmin, user } = useAuthStore();
  
  const player = players.find((p) => p.id === id);
  
  if (!player) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Player not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  // Get all scores for this player
  const playerScores = scores.filter((score) => score.playerId === id);
  
  // Get games this player participated in
  const playerGames = getGamesByPlayer ? getGamesByPlayer(id) : [];
  const gamesPlayed = playerGames.length;
  
  // Check if viewing own profile
  const isOwnProfile = user?.playerId === id;
  
  const handleDeletePlayer = () => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deletePlayer(id);
            router.replace('/players');
          }
        },
      ]
    );
  };
  
  const handleContactPress = (type: 'email' | 'phone', value?: string) => {
    if (!value) return;
    
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {player.image ? (
              <Image
                source={{ uri: player.image }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={Colors.gray[500]} />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            {player.jerseyNumber && (
              <View style={styles.numberContainer}>
                <Text style={styles.number}>#{player.jerseyNumber}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {player.email ? (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContactPress('email', player.email)}
            >
              <Mail size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{player.email}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.contactItem}>
              <Mail size={20} color={Colors.gray[400]} />
              <Text style={styles.contactTextEmpty}>No email provided</Text>
            </View>
          )}
          
          {player.phone ? (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContactPress('phone', player.phone)}
            >
              <Phone size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{player.phone}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.contactItem}>
              <Phone size={20} color={Colors.gray[400]} />
              <Text style={styles.contactTextEmpty}>No phone number provided</Text>
            </View>
          )}
          
          <View style={styles.contactItem}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.contactText}>{gamesPlayed} games played</Text>
          </View>
        </View>
        
        {/* Only show performance history to the player themselves */}
        {isOwnProfile && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Performance History</Text>
            
            {playerScores.length > 0 ? (
              playerScores.map((score) => {
                const game = games.find(g => g.id === score.gameId);
                return (
                  <View key={score.gameId} style={styles.scoreItem}>
                    <View style={styles.scoreGameInfo}>
                      <Text style={styles.scoreGameId}>
                        {game ? `vs ${game.opponent}` : `Game #${score.gameId}`}
                      </Text>
                      {game && (
                        <Text style={styles.scoreGameDate}>
                          {new Date(game.date).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.pointsBadge, getPointsBadgeStyle(score.points)]}>
                      <Text style={styles.pointsBadgeText}>{score.points} pts</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                No performance points recorded yet.
              </Text>
            )}
          </View>
        )}
        
        {isAdmin() && (
          <View style={styles.adminActions}>
            <Button
              title="Edit Player"
              onPress={() => router.push(`/player/edit/${id}`)}
              variant="outline"
              icon={<Edit size={16} color={Colors.primary} />}
              style={styles.adminButton}
            />
            <Button
              title="Delete Player"
              onPress={handleDeletePlayer}
              variant="danger"
              icon={<Trash size={16} color="white" />}
              style={styles.adminButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getPointsBadgeStyle = (points: number) => {
  switch (points) {
    case 3:
      return styles.firstPlaceBadge;
    case 2:
      return styles.secondPlaceBadge;
    case 1:
      return styles.thirdPlaceBadge;
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  numberContainer: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  number: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  contactTextEmpty: {
    fontSize: 16,
    color: Colors.gray[400],
    fontStyle: 'italic',
    marginLeft: 12,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  scoreGameInfo: {
    flex: 1,
  },
  scoreGameId: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  scoreGameDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  firstPlaceBadge: {
    backgroundColor: '#FFD700', // Gold
  },
  secondPlaceBadge: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdPlaceBadge: {
    backgroundColor: '#CD7F32', // Bronze
  },
  pointsBadgeText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  adminButton: {
    flex: 1,
  },
});