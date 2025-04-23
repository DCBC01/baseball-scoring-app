import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types';

type PlayerCardProps = {
  player: Player;
  onPress?: () => void;
  showStats?: boolean;
  selected?: boolean;
};

export default function PlayerCard({ 
  player, 
  onPress, 
  showStats = false,
  selected = false
}: PlayerCardProps) {
  return (
    <Pressable 
      style={[styles.container, selected && styles.selected]} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {player.image ? (
          <Image
            source={{ uri: player.image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <User size={30} color={Colors.gray[500]} />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.position}>{player.position}</Text>
        {player.number && (
          <View style={styles.numberContainer}>
            <Text style={styles.number}>#{player.number}</Text>
          </View>
        )}
      </View>
      {showStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.bestFielder}</Text>
            <Text style={styles.statLabel}>Fielder</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.bestBatter}</Text>
            <Text style={styles.statLabel}>Batter</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  position: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  numberContainer: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  number: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray[200],
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});