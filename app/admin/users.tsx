import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, 
  Shield, 
  ChevronRight, 
  Search,
  UserCog
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { usePlayerStore } from '@/store/player-store';
import { UserRole, User as UserType } from '@/types';
import Button from '@/components/Button';

export default function UserManagementScreen() {
  const router = useRouter();
  const { 
    getAllUsers, 
    isAdmin, 
    isMasterAdmin,
    promoteToAdmin,
    promoteToManager,
    demoteToPlayer,
    user
  } = useAuthStore();
  const { getPlayerById } = usePlayerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin()) {
      router.replace('/');
    }
  }, [isAdmin]);
  
  const users = getAllUsers();
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePromoteToAdmin = (userId: string, userName: string) => {
    Alert.alert(
      'Promote to Admin',
      `Are you sure you want to promote ${userName} to Admin? This will give them full access to the system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Promote', 
          onPress: () => {
            promoteToAdmin(userId);
            Alert.alert('Success', `${userName} has been promoted to Admin.`);
          }
        },
      ]
    );
  };
  
  const handlePromoteToManager = (userId: string, userName: string) => {
    Alert.alert(
      'Promote to Manager',
      `Are you sure you want to promote ${userName} to Manager? This will give them access to manage games and players.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Promote', 
          onPress: () => {
            promoteToManager(userId);
            Alert.alert('Success', `${userName} has been promoted to Manager.`);
          }
        },
      ]
    );
  };
  
  const handleDemoteToPlayer = (userId: string, userName: string) => {
    Alert.alert(
      'Demote to Player',
      `Are you sure you want to demote ${userName} to Player? This will remove their administrative privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Demote', 
          style: 'destructive',
          onPress: () => {
            demoteToPlayer(userId);
            Alert.alert('Success', `${userName} has been demoted to Player.`);
          }
        },
      ]
    );
  };
  
  const renderRoleBadge = (role: UserRole) => {
    let color = Colors.primary;
    let label = 'Player';
    
    switch (role) {
      case UserRole.MasterAdmin:
        color = Colors.error;
        label = 'Master Admin';
        break;
      case UserRole.Admin:
        color = Colors.secondary;
        label = 'Admin';
        break;
      case UserRole.Manager:
        color = Colors.warning;
        label = 'Manager';
        break;
    }
    
    return (
      <View style={[styles.roleBadge, { backgroundColor: color }]}>
        <Text style={styles.roleBadgeText}>{label}</Text>
      </View>
    );
  };
  
  const renderUserItem = ({ item }: { item: UserType }) => {
    const linkedPlayer = item.playerId ? getPlayerById(item.playerId) : null;
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <View style={styles.userImageContainer}>
            {linkedPlayer?.image ? (
              <Image
                source={{ uri: linkedPlayer.image }}
                style={styles.userImage}
              />
            ) : (
              <View style={styles.userImagePlaceholder}>
                <User size={20} color={Colors.gray[500]} />
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            {linkedPlayer && (
              <Text style={styles.playerLink}>Linked to: {linkedPlayer.name}</Text>
            )}
          </View>
          
          {renderRoleBadge(item.role)}
        </View>
        
        <View style={styles.userActions}>
          {isMasterAdmin() && item.role !== UserRole.MasterAdmin && item.role !== UserRole.Admin && (
            <Button
              title="Make Admin"
              onPress={() => handlePromoteToAdmin(item.id, item.name)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          )}
          
          {isAdmin() && item.role !== UserRole.MasterAdmin && item.role !== UserRole.Admin && item.role !== UserRole.Manager && (
            <Button
              title="Make Manager"
              onPress={() => handlePromoteToManager(item.id, item.name)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          )}
          
          {isAdmin() && (item.role === UserRole.Manager || item.role === UserRole.Admin) && (
            <Button
              title="Demote to Player"
              onPress={() => handleDemoteToPlayer(item.id, item.name)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray[500]}
        />
      </View>
      
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  userItem: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImageContainer: {
    marginRight: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  playerLink: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    minWidth: 120,
  },
});