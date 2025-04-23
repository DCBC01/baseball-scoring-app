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
import { User, Camera, X, Tag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useTeamStore } from '@/store/team-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function EditPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { players, updatePlayer } = usePlayerStore();
  const { teams } = useTeamStore();
  const { isAdmin } = useAuthStore();
  
  const player = players.find(p => p.id === id);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [number, setNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  
  // Load player data
  useEffect(() => {
    if (player) {
      setName(player.name);
      setPosition(player.position);
      setNumber(player.number?.toString() || '');
      setImage(player.image || null);
      setSelectedTeamIds(player.teamIds || []);
    }
  }, [player]);
  
  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/');
    }
  }, [isAdmin]);
  
  if (!player) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Player not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  const handleSubmit = () => {
    if (!name || !position) {
      Alert.alert('Missing Information', 'Please provide a name and position.');
      return;
    }
    
    updatePlayer({
      ...player,
      name,
      position,
      number: number ? parseInt(number) : undefined,
      image: image || undefined,
      teamIds: selectedTeamIds,
    });
    
    router.back();
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
  };
  
  const toggleTeamSelection = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Edit Player</Text>
        
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.imagePickerPlaceholder}>
                  <User size={40} color={Colors.gray[400]} />
                </View>
                <View style={styles.cameraIconContainer}>
                  <Camera size={16} color="white" />
                </View>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.imagePickerText}>Player Photo</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter player name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Position</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter player position"
              value={position}
              onChangeText={setPosition}
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Jersey Number (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter jersey number"
              value={number}
              onChangeText={(text) => {
                // Allow only numbers
                if (/^\d*$/.test(text)) {
                  setNumber(text);
                }
              }}
              keyboardType="numeric"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Teams</Text>
          <View style={styles.teamsHeader}>
            <Tag size={16} color={Colors.textSecondary} />
            <Text style={styles.teamsHeaderText}>Select the teams this player belongs to</Text>
          </View>
          
          <View style={styles.teamsContainer}>
            {teams.map(team => (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.teamOption,
                  selectedTeamIds.includes(team.id) && styles.teamOptionSelected,
                  selectedTeamIds.includes(team.id) && { borderColor: team.color, backgroundColor: team.color + '20' }
                ]}
                onPress={() => toggleTeamSelection(team.id)}
              >
                <Text 
                  style={[
                    styles.teamText,
                    selectedTeamIds.includes(team.id) && styles.teamTextSelected,
                    selectedTeamIds.includes(team.id) && { color: team.color }
                  ]}
                >
                  {team.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  imagePickerPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  teamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamsHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  teamsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    marginBottom: 4,
  },
  teamOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  teamText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  teamTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});