import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, PlusCircle, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import { useTeamStore } from '@/store/team-store';
import GameCard from '@/components/GameCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { Game, Team } from '@/types';

export default function GamesScreen() {
  const router = useRouter();
  const { games } = useGameStore();
  const { isManager } = useAuthStore();
  const { teams } = useTeamStore();
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // Filter games by selected team
  const filteredGames = selectedTeamId 
    ? games.filter(game => game.teamId === selectedTeamId)
    : games;
  
  // Sort games by date (newest first)
  const sortedGames = [...filteredGames].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };
  
  const handleAddGame = () => {
    router.push('/game/new');
  };
  
  const renderTeamFilter = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <Filter size={16} color={Colors.textSecondary} />
        <Text style={styles.filterTitle}>Filter by Team</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teamFilters}
      >
        <TouchableOpacity
          style={[
            styles.teamFilterItem,
            selectedTeamId === null && styles.teamFilterItemSelected
          ]}
          onPress={() => setSelectedTeamId(null)}
        >
          <Text 
            style={[
              styles.teamFilterText,
              selectedTeamId === null && styles.teamFilterTextSelected
            ]}
          >
            All Teams
          </Text>
        </TouchableOpacity>
        
        {teams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={[
              styles.teamFilterItem,
              selectedTeamId === team.id && styles.teamFilterItemSelected,
              { borderColor: team.color }
            ]}
            onPress={() => setSelectedTeamId(team.id)}
          >
            <Text 
              style={[
                styles.teamFilterText,
                selectedTeamId === team.id && styles.teamFilterTextSelected,
                selectedTeamId === team.id && { color: team.color }
              ]}
            >
              {team.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Schedule</Text>
        {isManager() && (
          <Button
            title="Add Game"
            onPress={handleAddGame}
            variant="primary"
            size="small"
            icon={<PlusCircle size={16} color="white" />}
          />
        )}
      </View>
      
      {renderTeamFilter()}
      
      {sortedGames.length === 0 ? (
        <EmptyState
          title="No Games Yet"
          message={selectedTeamId 
            ? "There are no games scheduled for this team yet."
            : "There are no games scheduled yet."}
          icon={<Calendar size={40} color={Colors.gray[500]} />}
          actionLabel={isManager() ? "Add Game" : undefined}
          onAction={isManager() ? handleAddGame : undefined}
        />
      ) : (
        <FlatList
          data={sortedGames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GameCard 
              game={item} 
              onPress={() => handleGamePress(item.id)} 
              showTeam={selectedTeamId === null}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  teamFilters: {
    paddingBottom: 8,
  },
  teamFilterItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    marginRight: 8,
  },
  teamFilterItemSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  teamFilterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  teamFilterTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
});