import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react-native';
import { TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types';
import PlayerCard from './PlayerCard';
import Button from '@/components/Button';

type VotingFormProps = {
  players: Player[];
  onSubmitVote: (bestFielderId: string, bestBatterId: string) => void;
  onCancel: () => void;
  currentUserId?: string;
  initialFielderId?: string;
  initialBatterId?: string;
};

export default function VotingForm({
  players,
  onSubmitVote,
  onCancel,
  currentUserId,
  initialFielderId,
  initialBatterId,
}: VotingFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFielder, setSelectedFielder] = useState<string | null>(initialFielderId || null);
  const [selectedBatter, setSelectedBatter] = useState<string | null>(initialBatterId || null);
  
  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Remove current user from the list if they have a player ID
  const eligiblePlayers = filteredPlayers.filter(player => 
    player.id !== currentUserId
  );
  
  const handleSelectFielder = (playerId: string) => {
    // If already selected, deselect it
    if (selectedFielder === playerId) {
      setSelectedFielder(null);
    } else {
      setSelectedFielder(playerId);
    }
  };
  
  const handleSelectBatter = (playerId: string) => {
    // If already selected, deselect it
    if (selectedBatter === playerId) {
      setSelectedBatter(null);
    } else {
      setSelectedBatter(playerId);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedFielder || !selectedBatter) {
      Alert.alert('Incomplete Selection', 'Please select both a best fielder and best batter');
      return;
    }
    
    onSubmitVote(selectedFielder, selectedBatter);
  };
  
  const renderPlayerItem = ({ item }: { item: Player }) => {
    const isFielder = selectedFielder === item.id;
    const isBatter = selectedBatter === item.id;
    
    return (
      <View style={styles.playerContainer}>
        <PlayerCard player={item} />
        
        <View style={styles.selectionContainer}>
          <TouchableOpacity 
            style={[
              styles.selectionButton,
              isFielder && styles.selectedButton
            ]}
            onPress={() => handleSelectFielder(item.id)}
          >
            {isFielder ? (
              <CheckCircle size={20} color="white" />
            ) : (
              <View style={styles.emptyCircle} />
            )}
            <Text style={[
              styles.selectionText,
              isFielder && styles.selectedText
            ]}>
              Fielder
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.selectionButton,
              isBatter && styles.selectedButton,
              isBatter && { backgroundColor: Colors.success }
            ]}
            onPress={() => handleSelectBatter(item.id)}
          >
            {isBatter ? (
              <CheckCircle size={20} color="white" />
            ) : (
              <View style={styles.emptyCircle} />
            )}
            <Text style={[
              styles.selectionText,
              isBatter && styles.selectedText
            ]}>
              Batter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Vote for Best Players</Text>
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Select one player as the best fielder and one as the best batter from this game.
        </Text>
        <Text style={styles.instructionsText}>
          Tap on a selection to toggle it on/off.
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
      
      <View style={styles.selectionSummary}>
        <View style={styles.selectionItem}>
          <Text style={styles.selectionLabel}>Best Fielder:</Text>
          <Text style={styles.selectionValue}>
            {selectedFielder 
              ? players.find(p => p.id === selectedFielder)?.name || 'Unknown'
              : 'Not selected'}
          </Text>
        </View>
        
        <View style={styles.selectionItem}>
          <Text style={styles.selectionLabel}>Best Batter:</Text>
          <Text style={styles.selectionValue}>
            {selectedBatter 
              ? players.find(p => p.id === selectedBatter)?.name || 'Unknown'
              : 'Not selected'}
          </Text>
        </View>
      </View>
      
      {eligiblePlayers.length > 0 ? (
        <ScrollView style={styles.playersList}>
          {eligiblePlayers.map(player => renderPlayerItem({ item: player }))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? "No players match your search" 
              : "No players available for voting"}
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
          title="Submit Vote"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={!selectedFielder || !selectedBatter}
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
  instructions: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
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
  selectionSummary: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  selectionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    width: 100,
  },
  selectionValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  playersList: {
    flex: 1,
  },
  playerContainer: {
    marginBottom: 12,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  selectionText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.text,
  },
  selectedText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[400],
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
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