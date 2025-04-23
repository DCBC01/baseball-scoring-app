import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, PlusCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import PlayerCard from '@/components/PlayerCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

export default function PlayersScreen() {
  const router = useRouter();
  const { players } = usePlayerStore();
  const { isAdmin } = useAuthStore();
  
  const handlePlayerPress = (playerId: string) => {
    if (isAdmin) {
      router.push(`/player/${playerId}`);
    }
  };
  
  const handleAddPlayer = () => {
    router.push('/player/new');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Roster</Text>
        {isAdmin && (
          <Button
            title="Add Player"
            onPress={handleAddPlayer}
            variant="primary"
            size="small"
            icon={<PlusCircle size={16} color="white" />}
          />
        )}
      </View>
      
      {players.length === 0 ? (
        <EmptyState
          title="No Players Yet"
          message="There are no players on the roster yet. Add players to get started."
          icon={<Users size={40} color={Colors.gray[500]} />}
          actionLabel={isAdmin ? "Add Player" : undefined}
          onAction={isAdmin ? handleAddPlayer : undefined}
        />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlayerCard 
              player={item} 
              onPress={isAdmin ? () => handlePlayerPress(item.id) : undefined}
              showStats={false}
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
  listContent: {
    padding: 16,
  },
});