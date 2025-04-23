import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Search } from 'lucide-react-native';
import { TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types';
import PlayerCard from './PlayerCard';

type PlayerSelectorProps = {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  selectedPlayerId?: string;
  title?: string;
};

export default function PlayerSelector({
  players,
  onSelectPlayer,
  selectedPlayerId,
  title = 'Select a Player',
}: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray[500]}
        />
      </View>
      
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onPress={() => onSelectPlayer(item)}
            selected={selectedPlayerId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 16,
  },
});