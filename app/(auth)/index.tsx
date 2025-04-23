import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LogIn, UserPlus, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useTeamStore } from '@/store/team-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const { teams } = useTeamStore();
  const { isAdmin, updateAppSettings, appSettings } = useAuthStore();
  
  const handleChangeLogo = async () => {
    if (!isAdmin()) {
      Alert.alert("Permission Denied", "Only admins can change the logo.");
      return;
    }
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos.");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, you would upload this to a server
        // For now, we'll just store the URI in the app settings
        updateAppSettings({ logoUri: result.assets[0].uri });
        Alert.alert("Success", "Logo updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update logo. Please try again.");
      console.error("Error updating logo:", error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={isAdmin() ? handleChangeLogo : undefined}
          activeOpacity={isAdmin() ? 0.7 : 1}
        >
          {appSettings?.logoUri ? (
            <Image
              source={{ uri: appSettings.logoUri }}
              style={styles.logo}
              contentFit="cover"
            />
          ) : (
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1508344928928-7165b0c396be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
              style={styles.logo}
              contentFit="cover"
            />
          )}
          
          {isAdmin() && (
            <View style={styles.editIconContainer}>
              <Camera size={18} color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.subtitle}>Welcome to the DCBC Player Voting App</Text>
        
        {isAdmin() && (
          <TouchableOpacity 
            style={styles.changeLogo}
            onPress={handleChangeLogo}
          >
            <Text style={styles.changeLogoText}>Change Logo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.authButtons}>
        <Button
          title="Sign In"
          onPress={() => router.push('/(auth)/login')}
          variant="primary"
          icon={<LogIn size={20} color="white" />}
          style={styles.authButton}
        />
        <Button
          title="Register"
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          icon={<UserPlus size={20} color={Colors.primary} />}
          style={styles.authButton}
        />
      </View>
      
      <Text style={styles.teamsTitle}>Our Teams</Text>
      
      <ScrollView 
        style={styles.teamsContainer}
        contentContainerStyle={styles.teamsContent}
        showsVerticalScrollIndicator={false}
      >
        {teams.map((team) => (
          <TouchableOpacity key={team.id} style={styles.teamCard}>
            <View style={[styles.teamImageContainer, { backgroundColor: team.color + '20' }]}>
              {team.image ? (
                <Image
                  source={{ uri: team.image }}
                  style={styles.teamImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.teamImagePlaceholder, { backgroundColor: team.color }]} />
              )}
            </View>
            <Text style={styles.teamName}>{team.name}</Text>
            {team.description && (
              <Text style={styles.teamDescription}>{team.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Diamond Creek Baseball Club
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    position: 'relative',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 3,
    borderColor: Colors.primary + '30',
    position: 'relative',
    marginBottom: 16,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIconContainer: {
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
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  changeLogo: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  changeLogoText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  authButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  teamsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  teamsContainer: {
    flex: 1,
  },
  teamsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  teamCard: {
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
  teamImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  teamImage: {
    width: '100%',
    height: '100%',
  },
  teamImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});