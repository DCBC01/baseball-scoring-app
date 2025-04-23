import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, CheckCircle } from 'lucide-react-native';
import { TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import PlayerCard from '@/components/PlayerCard';
import Button from '@/components/Button';

export default function PlayerLinkScreen() {
  const router = useRouter();
  const { players } = usePlayerStore();
  const { user, linkPlayerToUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLinkPlayer = () => {
    if (!selectedPlayerId || !user) {
      Alert.alert('Selection Required', 'Please select your player profile.');
      return;
    }
    
    linkPlayerToUser(user.id, selectedPlayerId);
    Alert.alert(
      'Profile Linked',
      'Your account has been successfully linked to your player profile.',
      [
        { 
          text: 'Continue', 
          onPress: () => router.replace('/(tabs)') 
        }
      ]
    );
  };
  
  const handleSkip = () => {
    Alert.alert(
      'Skip Player Link',
      'You can link your player profile later from your account settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => router.replace('/(tabs)') 
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Link Your Player Profile</Text>
        <Text style={styles.subtitle}>
          Select your player profile from the roster to link it to your account.
          This will allow you to vote and receive points.
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
        
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.playerItem,
                selectedPlayerId === item.id && styles.selectedPlayerItem
              ]} 
              onPress={() => setSelectedPlayerId(item.id)}
            >
              <PlayerCard player={item} />
              {selectedPlayerId === item.id && (
                <View style={styles.checkmarkContainer}>
                  <CheckCircle size={24} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Link Player"
            onPress={handleLinkPlayer}
            disabled={!selectedPlayerId}
            style={styles.linkButton}
          />
          <Button
            title="Skip for Now"
            onPress={handleSkip}
            variant="outline"
            style={styles.skipButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
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
  playerItem: {
    marginBottom: 12,
    position: 'relative',
  },
  selectedPlayerItem: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 16,
  },
  linkButton: {
    marginBottom: 12,
  },
  skipButton: {},
});