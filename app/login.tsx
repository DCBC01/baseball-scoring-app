import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { User, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { usePlayerStore } from '@/store/player-store';
import Button from '@/components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { players } = usePlayerStore();
  const [loginType, setLoginType] = useState<'player' | 'admin'>('player');
  
  const handleAdminLogin = () => {
    // In a real app, you would have proper authentication
    // For demo purposes, we'll just log in as admin
    login({
      id: 'admin',
      name: 'Admin',
      isAdmin: true,
    });
    
    // Use push instead of replace to avoid the navigation error
    router.push('/');
  };
  
  const handlePlayerLogin = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    
    if (player) {
      login({
        id: `player-${playerId}`,
        name: player.name,
        isAdmin: false,
        playerId: player.id,
      });
      
      // Use push instead of replace to avoid the navigation error
      router.push('/');
    } else {
      Alert.alert('Error', 'Player not found');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1508344928928-7165b0c396be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.logo}
            contentFit="cover"
          />
        </View>
        
        <Text style={styles.title}>Baseball Player Scoring</Text>
        <Text style={styles.subtitle}>Track performance across the season</Text>
        
        <View style={styles.loginTypeContainer}>
          <TouchableOpacity
            style={[
              styles.loginTypeButton,
              loginType === 'player' && styles.activeLoginType,
            ]}
            onPress={() => setLoginType('player')}
          >
            <User size={20} color={loginType === 'player' ? Colors.primary : Colors.gray[500]} />
            <Text
              style={[
                styles.loginTypeText,
                loginType === 'player' && styles.activeLoginTypeText,
              ]}
            >
              Player
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.loginTypeButton,
              loginType === 'admin' && styles.activeLoginType,
            ]}
            onPress={() => setLoginType('admin')}
          >
            <Shield size={20} color={loginType === 'admin' ? Colors.primary : Colors.gray[500]} />
            <Text
              style={[
                styles.loginTypeText,
                loginType === 'admin' && styles.activeLoginTypeText,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>
        
        {loginType === 'admin' ? (
          <View style={styles.adminLoginContainer}>
            <Text style={styles.loginInstructions}>
              Log in as an administrator to manage games, players, and view statistics.
            </Text>
            <Button
              title="Login as Admin"
              onPress={handleAdminLogin}
              style={styles.loginButton}
            />
          </View>
        ) : (
          <View style={styles.playerLoginContainer}>
            <Text style={styles.loginInstructions}>
              Select your name from the list to log in and vote for best players.
            </Text>
            <View style={styles.playerList}>
              {players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerItem}
                  onPress={() => handlePlayerLogin(player.id)}
                >
                  <View style={styles.playerImageContainer}>
                    {player.image ? (
                      <Image
                        source={{ uri: player.image }}
                        style={styles.playerImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.playerImagePlaceholder}>
                        <User size={20} color={Colors.gray[500]} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: Colors.primary,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  loginTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 120,
  },
  activeLoginType: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  loginTypeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: Colors.gray[500],
  },
  activeLoginTypeText: {
    color: Colors.primary,
  },
  adminLoginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playerLoginContainer: {
    width: '100%',
  },
  loginInstructions: {
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.textSecondary,
  },
  loginButton: {
    minWidth: 200,
  },
  playerList: {
    width: '100%',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playerImageContainer: {
    marginRight: 12,
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});