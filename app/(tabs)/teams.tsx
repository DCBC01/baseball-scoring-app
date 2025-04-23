import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { useTeamStore } from '@/store/team-store';
import { usePlayerStore } from '@/store/player-store';
import { Team } from '@/types';

export default function TeamsScreen() {
  const router = useRouter();
  const { teams } = useTeamStore();
  const { getPlayersByTeam } = usePlayerStore();
  
  const handleTeamPress = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };
  
  const renderTeamItem = ({ item }: { item: Team }) => {
    const playerCount = getPlayersByTeam(item.id).length;
    
    return (
      <TouchableOpacity 
        style={styles.teamCard}
        onPress={() => handleTeamPress(item.id)}
      >
        <View style={[styles.teamImageContainer, { backgroundColor: item.color + '20' }]}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.teamImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.teamImagePlaceholder, { backgroundColor: item.color }]} />
          )}
        </View>
        
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.teamDescription}>{item.description}</Text>
          )}
          <Text style={styles.playerCount}>{playerCount} players</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Baseball Teams</Text>
      </View>
      
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  teamCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamImageContainer: {
    width: '100%',
    height: 140,
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
    padding: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  playerCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});