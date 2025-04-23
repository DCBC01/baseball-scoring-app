import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Search, Award } from 'lucide-react-native';
import { TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types';
import PlayerCard from './PlayerCard';
import Button from '@/components/Button';

type PointsAssignerProps = {
  players: Player[];
  onAssignPoints: (playerPoints: { playerId: string; points: number }[]) => void;
  onCancel: () => void;
};

export default function PointsAssigner({
  players,
  onAssignPoints,
  onCancel,
}: PointsAssignerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<{ playerId: string; points: number }[]>([]);
  
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectPlayer = (playerId: string, points: number) => {
    // Check if player is already selected
    const existingIndex = selectedPlayers.findIndex(p => p.playerId === playerId);
    
    if (existingIndex >= 0) {
      // If already selected with same points, remove them
      if (selectedPlayers[existingIndex].points === points) {
        setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== playerId));
      } else {
        // If selected with different points, update the points
        const updatedPlayers = [...selectedPlayers];
        updatedPlayers[existingIndex] = { playerId, points };
        setSelectedPlayers(updatedPlayers);
      }
    } else {
      // Check if we already have a player with these points
      const existingPlayerWithPoints = selectedPlayers.find(p => p.points === points);
      
      if (existingPlayerWithPoints) {
        Alert.alert(
          'Replace Player',
          `${players.find(p => p.id === existingPlayerWithPoints.playerId)?.name} already has ${points} points. Do you want to replace them?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Replace', 
              onPress: () => {
                setSelectedPlayers([
                  ...selectedPlayers.filter(p => p.points !== points),
                  { playerId, points }
                ]);
              }
            }
          ]
        );
      } else {
        // Add new player with points
        setSelectedPlayers([...selectedPlayers, { playerId, points }]);
      }
    }
  };
  
  const getPlayerPoints = (playerId: string) => {
    const player = selectedPlayers.find(p => p.playerId === playerId);
    return player ? player.points : 0;
  };
  
  const handleSave = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert('No Points Assigned', 'Are you sure you want to continue without assigning any points?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => onAssignPoints([]) }
      ]);
      return;
    }
    
    onAssignPoints(selectedPlayers);
  };
  
  const renderPlayerItem = ({ item }: { item: Player }) => {
    const playerPoints = getPlayerPoints(item.id);
    const isSelected = playerPoints > 0;
    
    return (
      <View style={[styles.playerItem, isSelected && styles.selectedPlayerItem]}>
        <PlayerCard player={item} />
        
        <View style={styles.pointsContainer}>
          <TouchableOpacity
            style={[
              styles.pointsButton,
              playerPoints === 3 && styles.pointsButtonSelected,
              playerPoints === 3 && styles.firstPlaceButton
            ]}
            onPress={() => handleSelectPlayer(item.id, 3)}
          >
            <Text style={[
              styles.pointsButtonText,
              playerPoints === 3 && styles.pointsButtonTextSelected
            ]}>1st</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.pointsButton,
              playerPoints === 2 && styles.pointsButtonSelected,
              playerPoints === 2 && styles.secondPlaceButton
            ]}
            onPress={() => handleSelectPlayer(item.id, 2)}
          >
            <Text style={[
              styles.pointsButtonText,
              playerPoints === 2 && styles.pointsButtonTextSelected
            ]}>2nd</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.pointsButton,
              playerPoints === 1 && styles.pointsButtonSelected,
              playerPoints === 1 && styles.thirdPlaceButton
            ]}
            onPress={() => handleSelectPlayer(item.id, 1)}
          >
            <Text style={[
              styles.pointsButtonText,
              playerPoints === 1 && styles.pointsButtonTextSelected
            ]}>3rd</Text>
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
        <Text style={styles.title}>Assign Game Points</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Select the top 3 players from this game to award points
      </Text>
      
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
      
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} assigned points
        </Text>
        
        {selectedPlayers.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSelectedPlayers([])}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.pointsLegend}>
        <View style={styles.legendItem}>
          <Award size={16} color="#FFD700" />
          <Text style={styles.legendText}>1st Place: 3 points</Text>
        </View>
        <View style={styles.legendItem}>
          <Award size={16} color="#C0C0C0" />
          <Text style={styles.legendText}>2nd Place: 2 points</Text>
        </View>
        <View style={styles.legendItem}>
          <Award size={16} color="#CD7F32" />
          <Text style={styles.legendText}>3rd Place: 1 point</Text>
        </View>
      </View>
      
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayerItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Save Points"
          onPress={handleSave}
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
    marginBottom: 8,
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  selectionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: Colors.error,
    fontWeight: '500',
    fontSize: 12,
  },
  pointsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  playerItem: {
    marginBottom: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
  },
  selectedPlayerItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: Colors.gray[100],
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  pointsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  pointsButtonSelected: {
    backgroundColor: Colors.primary,
  },
  firstPlaceButton: {
    backgroundColor: '#FFD700', // Gold
  },
  secondPlaceButton: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdPlaceButton: {
    backgroundColor: '#CD7F32', // Bronze
  },
  pointsButtonText: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  pointsButtonTextSelected: {
    color: 'white',
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
});