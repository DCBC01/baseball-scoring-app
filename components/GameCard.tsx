import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, MapPin, Trophy, CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Game } from '@/types';
import { useTeamStore } from '@/store/team-store';

type GameCardProps = {
  game: Game;
  onPress: () => void;
  showTeam?: boolean;
};

export default function GameCard({ game, onPress, showTeam = false }: GameCardProps) {
  const { getTeamById } = useTeamStore();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const team = showTeam ? getTeamById(game.teamId) : null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={Colors.primary} />
          <Text style={styles.date}>{formatDate(game.date)}</Text>
        </View>
        <View style={styles.statusContainer}>
          {game.isCompleted ? (
            <View style={[styles.statusBadge, styles.completedBadge]}>
              <CheckCircle size={14} color="white" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.upcomingBadge]}>
              <AlertCircle size={14} color="white" />
              <Text style={styles.statusText}>Upcoming</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.opponent}>vs {game.opponent}</Text>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.location}>{game.location}</Text>
        </View>
        
        {showTeam && team && (
          <View style={[styles.teamBadge, { backgroundColor: team.color + '20', borderColor: team.color }]}>
            <Text style={[styles.teamName, { color: team.color }]}>{team.name}</Text>
          </View>
        )}
        
        {game.result && (
          <View style={styles.resultContainer}>
            <Trophy size={14} color={game.result.startsWith('W') ? Colors.success : Colors.error} />
            <Text style={[
              styles.result, 
              { color: game.result.startsWith('W') ? Colors.success : Colors.error }
            ]}>
              {game.result}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        {game.isCompleted && (
          <>
            <View style={[styles.badge, game.pointsAssigned ? styles.badgeSuccess : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {game.pointsAssigned ? 'Points Assigned' : 'Needs Points'}
              </Text>
            </View>
            <View style={[styles.badge, game.votingOpen ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={styles.badgeText}>
                {game.votingOpen ? 'Voting Open' : 'Voting Closed'}
              </Text>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: Colors.success,
  },
  upcomingBadge: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    marginBottom: 12,
  },
  opponent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  teamBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  result: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: Colors.success + '20',
  },
  badgeWarning: {
    backgroundColor: Colors.warning + '20',
  },
  badgePending: {
    backgroundColor: Colors.error + '20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});