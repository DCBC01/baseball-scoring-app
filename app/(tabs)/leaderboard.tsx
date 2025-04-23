import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Shield, Swords } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { Player } from '@/types';

type LeaderboardTab = 'points' | 'fielder' | 'batter';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('points');
  const { players } = usePlayerStore();
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  
  // Redirect if not admin - this ensures managers can't access this page
  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/');
    }
  }, [isAdmin, router]);
  
  const getSortedPlayers = (): Player[] => {
    const sortedPlayers = [...players];
    
    switch (activeTab) {
      case 'points':
        return sortedPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
      case 'fielder':
        return sortedPlayers.sort((a, b) => b.bestFielder - a.bestFielder);
      case 'batter':
        return sortedPlayers.sort((a, b) => b.bestBatter - a.bestBatter);
      default:
        return sortedPlayers;
    }
  };
  
  const getStatValue = (player: Player): number => {
    switch (activeTab) {
      case 'points':
        return player.totalPoints;
      case 'fielder':
        return player.bestFielder;
      case 'batter':
        return player.bestBatter;
      default:
        return 0;
    }
  };
  
  const getStatLabel = (): string => {
    switch (activeTab) {
      case 'points':
        return 'Points';
      case 'fielder':
        return 'Best Fielder Votes';
      case 'batter':
        return 'Best Batter Votes';
      default:
        return '';
    }
  };
  
  const renderLeaderboardItem = ({ item, index }: { item: Player; index: number }) => {
    const statValue = getStatValue(item);
    const position = index + 1;
    
    // Determine medal color for top 3
    let medalColor = '';
    if (position === 1) medalColor = '#FFD700'; // Gold
    else if (position === 2) medalColor = '#C0C0C0'; // Silver
    else if (position === 3) medalColor = '#CD7F32'; // Bronze
    
    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.positionContainer}>
          {position <= 3 ? (
            <View style={[styles.medal, { backgroundColor: medalColor }]}>
              <Text style={styles.medalText}>{position}</Text>
            </View>
          ) : (
            <Text style={styles.positionText}>{position}</Text>
          )}
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerPosition}>{item.position}</Text>
        </View>
        
        <View style={styles.statContainer}>
          <Text style={styles.statValue}>{statValue}</Text>
          <Text style={styles.statLabel}>{getStatLabel()}</Text>
        </View>
      </View>
    );
  };
  
  // If not admin, don't render anything (will redirect)
  if (!isAdmin()) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Season Leaderboard</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'points' && styles.activeTab]}
          onPress={() => setActiveTab('points')}
        >
          <Trophy size={20} color={activeTab === 'points' ? Colors.primary : Colors.gray[500]} />
          <Text style={[styles.tabText, activeTab === 'points' && styles.activeTabText]}>
            Points
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fielder' && styles.activeTab]}
          onPress={() => setActiveTab('fielder')}
        >
          <Shield size={20} color={activeTab === 'fielder' ? Colors.primary : Colors.gray[500]} />
          <Text style={[styles.tabText, activeTab === 'fielder' && styles.activeTabText]}>
            Fielder
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'batter' && styles.activeTab]}
          onPress={() => setActiveTab('batter')}
        >
          <Swords size={20} color={activeTab === 'batter' ? Colors.primary : Colors.gray[500]} />
          <Text style={[styles.tabText, activeTab === 'batter' && styles.activeTabText]}>
            Batter
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={getSortedPlayers()}
        keyExtractor={(item) => item.id}
        renderItem={renderLeaderboardItem}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    marginLeft: 6,
    color: Colors.gray[500],
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  positionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[500],
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  playerPosition: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});