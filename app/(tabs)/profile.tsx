import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  LogOut, 
  Link, 
  Award,
  Edit,
  Check,
  X
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { usePlayerStore } from '@/store/player-store';
import { UserRole } from '@/types';
import Button from '@/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { getPlayerById } = usePlayerStore();
  
  const linkedPlayer = user?.playerId ? getPlayerById(user.playerId) : null;
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          }
        },
      ]
    );
  };
  
  const handleLinkPlayer = () => {
    router.push('/(auth)/player-link');
  };
  
  const handleStartEditing = () => {
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setIsEditing(true);
  };
  
  const handleCancelEditing = () => {
    setIsEditing(false);
  };
  
  const handleSaveProfile = () => {
    if (!user) return;
    
    // Basic email validation
    if (editEmail && !/\S+@\S+\.\S+/.test(editEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    updateUser({
      email: editEmail,
      phone: editPhone
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Your profile has been updated successfully');
  };
  
  const getRoleLabel = () => {
    switch (user?.role) {
      case UserRole.MasterAdmin:
        return 'Master Admin';
      case UserRole.Admin:
        return 'Admin';
      case UserRole.Manager:
        return 'Team Manager';
      case UserRole.Player:
        return 'Player';
      default:
        return 'User';
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {linkedPlayer?.image ? (
              <Image
                source={{ uri: linkedPlayer.image }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={Colors.gray[500]} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <View style={styles.roleBadge}>
            <Shield size={14} color="white" />
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            {!isEditing && (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleStartEditing}
              >
                <Edit size={16} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.infoCard}>
            {isEditing ? (
              // Editing mode
              <>
                <View style={styles.editItem}>
                  <Mail size={20} color={Colors.primary} />
                  <View style={styles.editInputContainer}>
                    <Text style={styles.editLabel}>Email</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                
                <View style={styles.editItem}>
                  <Phone size={20} color={Colors.primary} />
                  <View style={styles.editInputContainer}>
                    <Text style={styles.editLabel}>Phone</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    style={[styles.editActionButton, styles.cancelButton]} 
                    onPress={handleCancelEditing}
                  >
                    <X size={16} color={Colors.error} />
                    <Text style={[styles.editActionText, styles.cancelText]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.editActionButton, styles.saveButton]} 
                    onPress={handleSaveProfile}
                  >
                    <Check size={16} color={Colors.success} />
                    <Text style={[styles.editActionText, styles.saveText]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // View mode
              <>
                <View style={styles.infoItem}>
                  <Mail size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Phone size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Award size={20} color={Colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Player Profile</Text>
                    <Text style={styles.infoValue}>
                      {linkedPlayer ? linkedPlayer.name : 'Not linked'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
        
        {!linkedPlayer && !isEditing && (
          <Button
            title="Link Player Profile"
            onPress={handleLinkPlayer}
            variant="outline"
            icon={<Link size={16} color={Colors.primary} />}
            style={styles.linkButton}
          />
        )}
        
        {!isEditing && (
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={16} color={Colors.primary} />}
            style={styles.logoutButton}
          />
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  editItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  editInputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  editLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  editInput: {
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  saveButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  editActionText: {
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelText: {
    color: Colors.error,
  },
  saveText: {
    color: Colors.success,
  },
  linkButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
});