import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { 
  Users, 
  Edit, 
  Trash, 
  CheckCircle,
  ArrowLeft,
  Search
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTeamStore } from '@/store/team-store';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import PlayerCard from '@/components/PlayerCard';

export default function EditTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTeamById, updateTeam, deleteTeam } = useTeamStore();
  const { players, getPlayersByTeam, addPlayerToTeam, removePlayerFromTeam } = usePlayerStore();
  const { isAdmin } = useAuthStore();
  
  const team = getTeamById(id);
  const teamPlayers = getPlayersByTeam(id);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3498db');
  const [image, setImage] = useState('');
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/');
      return;
    }
    
    if (team) {
      setName(team.name);
      setDescription(team.description);
      setColor(team.color);
      setImage(team.image || '');
    }
  }, [team, isAdmin]);
  
  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Team not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  const handleSubmit = () => {
    if (!name) {
      Alert.alert('Missing Information', 'Please enter a team name');
      return;
    }
    
    const updatedTeam = {
      ...team,
      name,
      description,
      color,
      image: image || undefined,
    };
    
    updateTeam(updatedTeam);
    Alert.alert('Success', 'Team updated successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTeam(id);
            router.replace('/teams');
          }
        },
      ]
    );
  };
  
  const handleTogglePlayer = (playerId: string) => {
    const isPlayerInTeam = teamPlayers.some(player => player.id === playerId);
    
    if (isPlayerInTeam) {
      removePlayerFromTeam(playerId, id);
    } else {
      addPlayerToTeam(playerId, id);
    }
  };
  
  const predefinedColors = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#34495e', // Dark Blue
    '#d35400', // Dark Orange
    '#c0392b', // Dark Red
    '#16a085', // Dark Green
  ];
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderTeamForm = () => (
    <>
      <Text style={styles.title}>Edit Team</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Team Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter team name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.gray[400]}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter team description"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={Colors.gray[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Team Color</Text>
        <View style={styles.colorContainer}>
          {predefinedColors.map(colorOption => (
            <TouchableOpacity
              key={colorOption}
              style={[
                styles.colorOption,
                { backgroundColor: colorOption },
                color === colorOption && styles.colorOptionSelected,
              ]}
              onPress={() => setColor(colorOption)}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Team Image URL (Optional)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter image URL"
            value={image}
            onChangeText={setImage}
            placeholderTextColor={Colors.gray[400]}
          />
        </View>
        
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.imagePreview}
              contentFit="cover"
            />
          </View>
        )}
      </View>
      
      <Button
        title="Update Team"
        onPress={handleSubmit}
        style={styles.submitButton}
      />
      
      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
        <Button
          title="Delete Team"
          onPress={handleDeleteTeam}
          variant="danger"
          icon={<Trash size={16} color="white" />}
        />
      </View>
    </>
  );
  
  const renderPlayerSelector = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowPlayerSelector(false)} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Team Players</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Tap on players or the circle to add or remove them from this team
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
          {teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''} in team
        </Text>
      </View>
      
      <ScrollView style={styles.playerList}>
        {filteredPlayers.map(player => {
          const isSelected = teamPlayers.some(p => p.id === player.id);
          
          return (
            <TouchableOpacity 
              key={player.id}
              style={[styles.playerItem, isSelected && styles.selectedPlayerItem]} 
              onPress={() => handleTogglePlayer(player.id)}
            >
              <PlayerCard player={player} />
              
              <TouchableOpacity 
                style={[styles.selectionCircle, isSelected && styles.selectedCircle]}
                onPress={() => handleTogglePlayer(player.id)}
              >
                {isSelected ? (
                  <CheckCircle size={20} color={Colors.primary} />
                ) : null}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <Button
        title="Done"
        onPress={() => setShowPlayerSelector(false)}
        style={styles.doneButton}
      />
    </>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {showPlayerSelector ? renderPlayerSelector() : (
          <>
            {renderTeamForm()}
            
            <View style={styles.playersSection}>
              <View style={styles.playersSectionHeader}>
                <Text style={styles.playersSectionTitle}>Team Players</Text>
                <Button
                  title="Manage Players"
                  onPress={() => setShowPlayerSelector(true)}
                  variant="outline"
                  size="small"
                  icon={<Users size={16} color={Colors.primary} />}
                />
              </View>
              
              {teamPlayers.length > 0 ? (
                teamPlayers.map(player => (
                  <PlayerCard 
                    key={player.id}
                    player={player} 
                    onPress={() => router.push(`/player/${player.id}`)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No players assigned to this team yet. Click "Manage Players" to add players.
                </Text>
              )}
            </View>
          </>
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
    padding: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  imagePreviewContainer: {
    marginTop: 12,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  dangerZone: {
    marginTop: 32,
    marginBottom: 32,
    padding: 16,
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 12,
  },
  playersSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playersSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
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
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  selectionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  playerList: {
    flex: 1,
  },
  playerItem: {
    marginBottom: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  selectedPlayerItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  selectionCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderColor: Colors.primary,
    borderWidth: 0,
    backgroundColor: Colors.primary + '20',
  },
  doneButton: {
    marginTop: 16,
  },
});