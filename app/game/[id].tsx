import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  CheckCircle, 
  AlertCircle,
  Vote,
  Award,
  Edit,
  Trash,
  Users
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGameStore } from '@/store/game-store';
import { usePlayerStore } from '@/store/player-store';
import { useTeamStore } from '@/store/team-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import PointsAssigner from '@/components/PointsAssigner';
import VotingForm from '@/components/VotingForm';
import ParticipantSelector from '@/components/ParticipantSelector';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    games, 
    scores, 
    votes, 
    assignPoints, 
    submitVote, 
    hasPlayerVoted, 
    completeGame, 
    openVoting, 
    closeVoting, 
    deleteGame,
    updateParticipants,
    getParticipants,
    getPlayerVote,
  } = useGameStore();
  const { players } = usePlayerStore();
  const { getTeamById } = useTeamStore();
  const { user, isAdmin, isManager } = useAuthStore();
  
  const [showPointsAssigner, setShowPointsAssigner] = useState(false);
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isEditingVote, setIsEditingVote] = useState(false);
  
  const game = games.find((g) => g.id === id);
  
  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Game not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  const team = getTeamById(game.teamId);
  
  // Initialize selected participants from game data
  useEffect(() => {
    if (game && game.participants) {
      setSelectedParticipants(game.participants);
    }
  }, [game]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const gameScores = scores.filter((score) => score.gameId === id);
  const gameVotes = votes.filter((vote) => vote.gameId === id);
  const gameParticipants = players.filter(player => game.participants && game.participants.includes(player.id));
  
  // Get the current user's vote for this game
  const userVote = user?.playerId ? getPlayerVote(id, user.playerId) : null;
  
  const handleCompleteGame = () => {
    Alert.alert(
      'Complete Game',
      'Are you sure you want to mark this game as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            completeGame(id);
          }
        },
      ]
    );
  };
  
  const handleToggleVoting = () => {
    if (game.votingOpen) {
      Alert.alert(
        'Close Voting',
        'Are you sure you want to close voting for this game?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Close Voting', 
            onPress: () => {
              closeVoting(id);
            }
          },
        ]
      );
    } else {
      openVoting(id);
    }
  };
  
  const handleDeleteGame = () => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteGame(id);
            router.replace('/games');
          }
        },
      ]
    );
  };
  
  const handleAssignPoints = (playerPoints: { playerId: string; points: number }[]) => {
    assignPoints(id, playerPoints);
    setShowPointsAssigner(false);
    Alert.alert('Success', 'Points have been assigned successfully.');
  };
  
  const handleSubmitVote = (bestFielderId: string, bestBatterId: string) => {
    if (!user) return;
    
    submitVote({
      gameId: id,
      voterId: user.playerId || user.id,
      bestFielderId,
      bestBatterId,
    });
    
    setShowVotingForm(false);
    setIsEditingVote(false);
    Alert.alert('Success', 'Your vote has been submitted successfully.');
  };
  
  const handleSaveParticipants = () => {
    updateParticipants(id, selectedParticipants);
    setShowParticipantSelector(false);
    Alert.alert('Success', 'Game participants have been updated.');
  };
  
  const canVote = () => {
    if (!user || !game.votingOpen || !game.isCompleted) return false;
    
    // Admin can't vote
    if (isAdmin() || isManager()) return false;
    
    // Check if player has already voted
    if (user.playerId) {
      // If editing vote, always return true
      if (isEditingVote) return true;
      
      // Otherwise check if they've already voted
      return !hasPlayerVoted(id, user.playerId);
    }
    
    return false;
  };
  
  const handleEditVote = () => {
    setIsEditingVote(true);
    setShowVotingForm(true);
  };
  
  const renderGameDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.detailsHeader}>
        <Text style={styles.opponent}>vs {game.opponent}</Text>
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
      
      {team && (
        <View style={[styles.teamBadge, { backgroundColor: team.color + '20', borderColor: team.color }]}>
          <Text style={[styles.teamName, { color: team.color }]}>{team.name}</Text>
        </View>
      )}
      
      <View style={styles.detailsRow}>
        <Calendar size={18} color={Colors.primary} />
        <Text style={styles.detailsText}>{formatDate(game.date)}</Text>
      </View>
      
      <View style={styles.detailsRow}>
        <MapPin size={18} color={Colors.primary} />
        <Text style={styles.detailsText}>{game.location}</Text>
      </View>
      
      {game.result && (
        <View style={styles.detailsRow}>
          <Trophy 
            size={18} 
            color={game.result.startsWith('W') ? Colors.success : Colors.error} 
          />
          <Text 
            style={[
              styles.detailsText, 
              { 
                color: game.result.startsWith('W') ? Colors.success : Colors.error,
                fontWeight: 'bold'
              }
            ]}
          >
            {game.result}
          </Text>
        </View>
      )}
      
      <View style={styles.detailsRow}>
        <Users size={18} color={Colors.primary} />
        <Text style={styles.detailsText}>
          {game.participants ? game.participants.length : 0} player{!game.participants || game.participants.length !== 1 ? 's' : ''} participated
        </Text>
      </View>
      
      {/* Voting status badge */}
      {game.isCompleted && (
        <View style={styles.votingStatusContainer}>
          {game.votingOpen ? (
            <View style={styles.votingOpenBadge}>
              <Vote size={14} color="white" />
              <Text style={styles.votingStatusText}>Voting Open</Text>
            </View>
          ) : (
            <View style={styles.votingClosedBadge}>
              <Vote size={14} color="white" />
              <Text style={styles.votingStatusText}>Voting Closed</Text>
            </View>
          )}
          
          {!game.pointsAssigned && (isAdmin() || isManager()) && (
            <View style={styles.needsPointsBadge}>
              <Award size={14} color="white" />
              <Text style={styles.votingStatusText}>Needs Points</Text>
            </View>
          )}
        </View>
      )}
      
      {(isAdmin() || isManager()) && !game.isCompleted && (
        <View style={styles.adminActions}>
          <Button
            title="Manage Participants"
            onPress={() => setShowParticipantSelector(true)}
            variant="outline"
            style={styles.actionButton}
            icon={<Users size={16} color={Colors.primary} />}
          />
          
          <Button
            title="Mark as Completed"
            onPress={handleCompleteGame}
            variant="primary"
            style={styles.actionButton}
          />
        </View>
      )}
      
      {(isAdmin() || isManager()) && game.isCompleted && (
        <View style={styles.adminActions}>
          <Button
            title="Manage Participants"
            onPress={() => setShowParticipantSelector(true)}
            variant="outline"
            style={styles.actionButton}
            icon={<Users size={16} color={Colors.primary} />}
          />
          
          <Button
            title={game.votingOpen ? "Close Voting" : "Open Voting"}
            onPress={handleToggleVoting}
            variant={game.votingOpen ? "outline" : "primary"}
            style={styles.actionButton}
            icon={<Vote size={16} color={game.votingOpen ? Colors.primary : "white"} />}
          />
          
          {!game.pointsAssigned && (
            <Button
              title="Assign Points"
              onPress={() => setShowPointsAssigner(true)}
              variant="primary"
              style={styles.actionButton}
              icon={<Award size={16} color="white" />}
            />
          )}
        </View>
      )}
      
      {/* For regular players - show voting button if voting is open */}
      {!isAdmin() && !isManager() && user && game.isCompleted && game.votingOpen && (
        <TouchableOpacity 
          style={styles.playerVotingButton}
          onPress={() => setShowVotingForm(true)}
          disabled={hasPlayerVoted(id, user.playerId || '') && !isEditingVote}
        >
          <View style={styles.playerVotingButtonContent}>
            <Vote size={20} color="white" />
            <Text style={styles.playerVotingButtonText}>
              {hasPlayerVoted(id, user.playerId || '') && !isEditingVote 
                ? "You've already voted" 
                : "Vote for Best Players"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      {userVote && !isEditingVote && game.votingOpen && (
        <View style={styles.userVoteContainer}>
          <Text style={styles.userVoteTitle}>Your Vote</Text>
          <View style={styles.userVoteDetails}>
            <View style={styles.userVoteItem}>
              <Text style={styles.userVoteLabel}>Best Fielder:</Text>
              <Text style={styles.userVoteValue}>
                {players.find(p => p.id === userVote.bestFielderId)?.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.userVoteItem}>
              <Text style={styles.userVoteLabel}>Best Batter:</Text>
              <Text style={styles.userVoteValue}>
                {players.find(p => p.id === userVote.bestBatterId)?.name || 'Unknown'}
              </Text>
            </View>
          </View>
          <Button
            title="Edit Vote"
            onPress={handleEditVote}
            variant="outline"
            size="small"
            style={styles.editVoteButton}
            icon={<Edit size={14} color={Colors.primary} />}
          />
        </View>
      )}
    </View>
  );
  
  const renderGameScores = () => {
    // Only admins and managers can see game scores
    if (!isAdmin() && !isManager()) {
      return null;
    }
    
    if (!game.pointsAssigned || gameScores.length === 0) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Game Points</Text>
          <Text style={styles.emptyText}>
            {(isAdmin() || isManager()) && game.isCompleted 
              ? "Points haven't been assigned yet. Use the 'Assign Points' button to award points to players."
              : "Points haven't been assigned for this game yet."}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Game Points</Text>
        
        {gameScores
          .sort((a, b) => b.points - a.points)
          .map((score) => {
            const player = players.find((p) => p.id === score.playerId);
            if (!player) return null;
            
            return (
              <View key={score.playerId} style={styles.scoreItem}>
                <View style={styles.scorePlayerInfo}>
                  <Text style={styles.scorePlayerName}>{player.name}</Text>
                  <Text style={styles.scorePlayerPosition}>{player.position}</Text>
                </View>
                <View style={[styles.pointsBadge, getPointsBadgeStyle(score.points)]}>
                  <Text style={styles.pointsBadgeText}>{score.points} pts</Text>
                </View>
              </View>
            );
          })}
      </View>
    );
  };
  
  const getPointsBadgeStyle = (points: number) => {
    switch (points) {
      case 3:
        return styles.firstPlaceBadge;
      case 2:
        return styles.secondPlaceBadge;
      case 1:
        return styles.thirdPlaceBadge;
      default:
        return {};
    }
  };
  
  const renderVotingResults = () => {
    // Only admins can see voting results
    if (!isAdmin() && !isManager()) {
      return null;
    }
    
    if (gameVotes.length === 0) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Player Votes</Text>
          <Text style={styles.emptyText}>
            No votes have been submitted for this game yet.
          </Text>
        </View>
      );
    }
    
    // Count votes for best fielder
    const fielderVotes = new Map<string, number>();
    gameVotes.forEach((vote) => {
      if (vote.bestFielderId) {
        const currentCount = fielderVotes.get(vote.bestFielderId) || 0;
        fielderVotes.set(vote.bestFielderId, currentCount + 1);
      }
    });
    
    // Count votes for best batter
    const batterVotes = new Map<string, number>();
    gameVotes.forEach((vote) => {
      if (vote.bestBatterId) {
        const currentCount = batterVotes.get(vote.bestBatterId) || 0;
        batterVotes.set(vote.bestBatterId, currentCount + 1);
      }
    });
    
    // Convert to arrays and sort
    const sortedFielders = Array.from(fielderVotes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([playerId, votes]) => ({ playerId, votes }));
    
    const sortedBatters = Array.from(batterVotes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([playerId, votes]) => ({ playerId, votes }));
    
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Player Votes</Text>
        <Text style={styles.votingStatus}>
          {game.votingOpen ? 'Voting is currently open' : 'Voting is closed'}
        </Text>
        
        <View style={styles.voteSection}>
          <Text style={styles.voteCategory}>Best Fielder</Text>
          {sortedFielders.length > 0 ? (
            sortedFielders.map(({ playerId, votes }, index) => {
              const player = players.find((p) => p.id === playerId);
              if (!player) return null;
              
              return (
                <View key={playerId} style={styles.voteItem}>
                  <View style={styles.voteRank}>
                    <Text style={styles.voteRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.votePlayerInfo}>
                    <Text style={styles.votePlayerName}>{player.name}</Text>
                    <Text style={styles.votePlayerPosition}>{player.position}</Text>
                  </View>
                  <Text style={styles.voteCount}>{votes} vote{votes !== 1 ? 's' : ''}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No votes for best fielder yet.</Text>
          )}
        </View>
        
        <View style={styles.voteSection}>
          <Text style={styles.voteCategory}>Best Batter</Text>
          {sortedBatters.length > 0 ? (
            sortedBatters.map(({ playerId, votes }, index) => {
              const player = players.find((p) => p.id === playerId);
              if (!player) return null;
              
              return (
                <View key={playerId} style={styles.voteItem}>
                  <View style={styles.voteRank}>
                    <Text style={styles.voteRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.votePlayerInfo}>
                    <Text style={styles.votePlayerName}>{player.name}</Text>
                    <Text style={styles.votePlayerPosition}>{player.position}</Text>
                  </View>
                  <Text style={styles.voteCount}>{votes} vote{votes !== 1 ? 's' : ''}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No votes for best batter yet.</Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderParticipants = () => {
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Game Participants</Text>
        
        {gameParticipants.length > 0 ? (
          gameParticipants.map((player) => {
            // Check if this player has been voted as best fielder or batter
            const isVotedBestFielder = gameVotes.some(vote => vote.bestFielderId === player.id);
            const isVotedBestBatter = gameVotes.some(vote => vote.bestBatterId === player.id);
            
            return (
              <TouchableOpacity 
                key={player.id} 
                style={styles.participantItem}
                onPress={() => router.push(`/player/${player.id}`)}
              >
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{player.name}</Text>
                  <Text style={styles.participantPosition}>{player.position}</Text>
                </View>
                
                <View style={styles.participantBadges}>
                  {isVotedBestFielder && (
                    <View style={[styles.roleBadge, styles.fielderBadge]}>
                      <Text style={styles.roleBadgeText}>Fielder</Text>
                    </View>
                  )}
                  
                  {isVotedBestBatter && (
                    <View style={[styles.roleBadge, styles.batterBadge]}>
                      <Text style={styles.roleBadgeText}>Batter</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            {(isAdmin() || isManager())
              ? "No participants have been added yet. Use the 'Manage Participants' button to add players."
              : "No participants have been added for this game yet."}
          </Text>
        )}
      </View>
    );
  };
  
  if (showPointsAssigner) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <PointsAssigner
          players={gameParticipants.length > 0 ? gameParticipants : players}
          onAssignPoints={handleAssignPoints}
          onCancel={() => setShowPointsAssigner(false)}
        />
      </SafeAreaView>
    );
  }
  
  if (showVotingForm) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <VotingForm
          players={gameParticipants.length > 0 ? gameParticipants : players}
          onSubmitVote={handleSubmitVote}
          onCancel={() => {
            setShowVotingForm(false);
            setIsEditingVote(false);
          }}
          currentUserId={user?.playerId}
          initialFielderId={userVote?.bestFielderId}
          initialBatterId={userVote?.bestBatterId}
        />
      </SafeAreaView>
    );
  }
  
  if (showParticipantSelector) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ParticipantSelector
          players={players}
          selectedPlayerIds={selectedParticipants}
          onSelectionChange={setSelectedParticipants}
          onSave={handleSaveParticipants}
          onCancel={() => setShowParticipantSelector(false)}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {renderGameDetails()}
        {renderParticipants()}
        {renderGameScores()}
        {renderVotingResults()}
        
        {(isAdmin() || isManager()) && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
            <View style={styles.dangerZoneActions}>
              <Button
                title="Edit Game"
                onPress={() => router.push(`/game/edit/${id}`)}
                variant="outline"
                icon={<Edit size={16} color={Colors.primary} />}
                style={styles.dangerZoneButton}
              />
              <Button
                title="Delete Game"
                onPress={handleDeleteGame}
                variant="danger"
                icon={<Trash size={16} color="white" />}
                style={styles.dangerZoneButton}
              />
            </View>
          </View>
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
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsCard: {
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
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  opponent: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
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
  teamBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  votingStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  votingOpenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  votingClosedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[500],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  needsPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  votingStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  adminActions: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    marginTop: 8,
  },
  playerVotingButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerVotingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerVotingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  scorePlayerInfo: {
    flex: 1,
  },
  scorePlayerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  scorePlayerPosition: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  firstPlaceBadge: {
    backgroundColor: '#FFD700', // Gold
  },
  secondPlaceBadge: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdPlaceBadge: {
    backgroundColor: '#CD7F32', // Bronze
  },
  pointsBadgeText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  votingStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  voteSection: {
    marginBottom: 16,
  },
  voteCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  voteRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voteRankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  votePlayerInfo: {
    flex: 1,
  },
  votePlayerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  votePlayerPosition: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  participantPosition: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  participantBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fielderBadge: {
    backgroundColor: Colors.primary,
  },
  batterBadge: {
    backgroundColor: Colors.success,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dangerZone: {
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 12,
  },
  dangerZoneActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dangerZoneButton: {
    flex: 1,
  },
  userVoteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  userVoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  userVoteDetails: {
    marginBottom: 8,
  },
  userVoteItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  userVoteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    width: 100,
  },
  userVoteValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  editVoteButton: {
    alignSelf: 'flex-end',
  },
});