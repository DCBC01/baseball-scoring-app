import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react-native';
import { TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types';
import PlayerCard from './PlayerCard';
import Button from '@/components/Button';

type ParticipantSelectorProps = {
  players: Player[];
  selectedPlayerIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function ParticipantSelector({
  players,
  selectedPlayerIds,
  onSelectionChange,
  onSave,
  onCancel,
}: ParticipantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectionChange(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      onSelectionChange([...selectedPlayerIds, playerId]);
    }
  };
  
  const renderPlayerItem = ({ item }: { item: Player }) => {
    const isSelected = selectedPlayerIds.includes(item.id);
    
    return (
      <View style={styles.playerItemContainer}>
        <TouchableOpacity 
          style={[
            styles.playerItem, 
            isSelected && styles.selectedPlayerItem
          ]} 
          onPress={() => togglePlayerSelection(item.id)}
          activeOpacity={0.7}
        >
          <PlayerCard player={item} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.selectionCircle,
            isSelected && styles.selectedCircle
          ]}
          onPress={() => togglePlayerSelection(item.id)}
          activeOpacity={0.6}
        >
          {isSelected ? (
            <CheckCircle size={20} color="white" />
          ) : (
            <View style={styles.emptyCircle} />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Game Participants</Text>
      </View>
      
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionCount}>
          {selectedPlayerIds.length} player{selectedPlayerIds.length !== 1 ? 's' : ''} selected
        </Text>
      </View>
      
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
      
      <Text style={styles.instructions}>
        Tap on a player or the circle to select/deselect them
      </Text>
      
      {filteredPlayers.length > 0 ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? "No players match your search" 
              : "No players available"}
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Save Participants"
          onPress={onSave}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  selectionInfo: {
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
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.text,
  },
  instructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  playerItemContainer: {
    marginBottom: 12,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerItem: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
  },
  selectedPlayerItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  selectionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'absolute',
    right: 12,
    zIndex: 10,
  },
  selectedCircle: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[400],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});