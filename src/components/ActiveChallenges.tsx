import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ChallengeService } from '../services/challengeService';

interface Challenge {
  id: string;
  metrics: string[];
  duration: number;
  stake: number;
  participants: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  winner?: string;
  dailyCompletions?: { [key: string]: boolean };
}

interface ActiveChallengesProps {
  onRefresh?: () => void;
}

export default function ActiveChallenges({ onRefresh }: ActiveChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingDaily, setCompletingDaily] = useState<string | null>(null);
  const [solUsd, setSolUsd] = useState<number | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    loadChallenges();
    fetchSolUsd();
  }, []);

  const fetchSolUsd = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const json = await res.json();
      const price = json?.solana?.usd;
      if (typeof price === 'number') setSolUsd(price);
    } catch (e) {
      // ignore pricing fetch errors
    }
  };

  const openDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedChallenge(null);
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const userChallenges = await ChallengeService.getUserChallenges();
      setChallenges(userChallenges.filter(c => c.status === 'active' || c.status === 'pending'));
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const markDailyComplete = async (challengeId: string, metrics: string[]) => {
    try {
      setCompletingDaily(challengeId);
      
      // Call backend to mark daily completion
      await ChallengeService.markDailyCompletion(challengeId, metrics);
      
      // Update local state
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { 
              ...challenge, 
              dailyCompletions: { 
                ...challenge.dailyCompletions, 
                [new Date().toISOString().split('T')[0]]: true 
              }
            }
          : challenge
      ));

      Alert.alert('Success', 'Daily challenge completed! Keep it up! 🎉');
      onRefresh?.();
      
    } catch (error) {
      console.error('Failed to mark daily completion:', error);
      Alert.alert('Error', 'Failed to mark completion. Please try again.');
    } finally {
      setCompletingDaily(null);
    }
  };

  const acceptChallenge = async (challengeId: string) => {
    try {
      const result = await ChallengeService.acceptChallenge(challengeId);
      if (result.status === 'active') {
        Alert.alert('Success', 'Challenge accepted and activated! Stakes have been deducted. 🚀');
      } else {
        Alert.alert('Success', 'Challenge accepted! Waiting for more participants to activate. ⏳');
      }
      loadChallenges(); // Refresh the list
      onRefresh?.();
    } catch (error) {
      console.error('Failed to accept challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge. Please try again.');
    }
  };

  const startChallenge = async (challengeId: string) => {
    try {
      await ChallengeService.startChallenge(challengeId);
      Alert.alert('Success', 'Challenge started! All participants have been notified. 🚀');
      loadChallenges(); // Refresh the list
      onRefresh?.();
    } catch (error) {
      console.error('Failed to start challenge:', error);
      Alert.alert('Error', 'Failed to start challenge. Please try again.');
    }
  };

  const endChallengeEarly = async (challengeId: string) => {
    Alert.alert(
      'End Challenge Early',
      'Are you sure you want to end this challenge early? Stakes will be refunded to all participants.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Challenge',
          style: 'destructive',
          onPress: async () => {
            try {
              await ChallengeService.endChallengeEarly(challengeId);
              Alert.alert('Success', 'Challenge ended early. Stakes have been refunded. 💰');
              loadChallenges(); // Refresh the list
              onRefresh?.();
            } catch (error) {
              console.error('Failed to end challenge:', error);
              Alert.alert('Error', 'Failed to end challenge. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getMetricIcon = (metric: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      steps: 'walk',
      active_minutes: 'time',
      calories: 'flame',
      distance: 'location',
      heart_rate: 'heart',
      sleep: 'moon',
    };
    return icons[metric] || 'fitness';
  };

  const getMetricColor = (metric: string) => {
    const colors: { [key: string]: string } = {
      steps: '#4CAF50',
      active_minutes: '#FF9800',
      calories: '#F44336',
      distance: '#2196F3',
      heart_rate: '#E91E63',
      sleep: '#9C27B0',
    };
    return colors[metric] || '#6366F1';
  };

  const isCompletedToday = (challenge: Challenge) => {
    const today = new Date().toISOString().split('T')[0];
    return challenge.dailyCompletions?.[today] || false;
  };

  const getRemainingTime = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No active challenges</Text>
          <Text style={styles.emptySubtext}>Create a challenge to get started!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Active Challenges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesList}>
        {challenges.map((challenge) => (
          <TouchableOpacity
            key={challenge.id}
            style={styles.challengeCard}
            activeOpacity={0.9}
            onPress={() => openDetails(challenge)}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.metricsRow}>
                {challenge.metrics.slice(0, 3).map((metric, index) => (
                  <View 
                    key={metric} 
                    style={[styles.metricBadge, { backgroundColor: getMetricColor(metric) }]}
                  >
                    <Ionicons 
                      name={getMetricIcon(metric)} 
                      size={12} 
                      color="#fff" 
                    />
                  </View>
                ))}
                {challenge.metrics.length > 3 && (
                  <Text style={styles.moreMetrics}>+{challenge.metrics.length - 3}</Text>
                )}
              </View>
              <Text style={styles.timeRemaining}>{getRemainingTime(challenge.endsAt)}</Text>
            </View>

            <View style={styles.challengeInfo}>
              <Text style={styles.participantCount}>
                {challenge.participants.length} participants
              </Text>
              <Text style={styles.stakeAmount}>
                {challenge.stake} SOL{solUsd ? ` (≈ $${(challenge.stake * solUsd).toFixed(2)})` : ''}
              </Text>
            </View>

            <View style={styles.challengeActions}>
              {challenge.status === 'pending' ? (
                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptChallenge(challenge.id)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => startChallenge(challenge.id)}
                  >
                    <Ionicons name="play-circle" size={16} color="#fff" />
                    <Text style={styles.startButtonText}>Start Challenge</Text>
                  </TouchableOpacity>
                </View>
              ) : challenge.status === 'active' && !isCompletedToday(challenge) ? (
                <View style={styles.activeActions}>
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      completingDaily === challenge.id && styles.completeButtonLoading
                    ]}
                    onPress={() => markDailyComplete(challenge.id, challenge.metrics)}
                    disabled={completingDaily === challenge.id}
                  >
                    {completingDaily === challenge.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.completeButtonText}>Mark Complete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => endChallengeEarly(challenge.id)}
                  >
                    <Ionicons name="stop-circle" size={16} color="#fff" />
                    <Text style={styles.endButtonText}>End Early</Text>
                  </TouchableOpacity>
                </View>
              ) : isCompletedToday(challenge) ? (
                <View style={styles.completedActions}>
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.completedText}>Completed Today</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => endChallengeEarly(challenge.id)}
                  >
                    <Ionicons name="stop-circle" size={16} color="#fff" />
                    <Text style={styles.endButtonText}>End Early</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Ionicons name="time" size={16} color={colors.textMuted} />
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={detailsVisible} transparent animationType="fade" onRequestClose={closeDetails}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Challenge Details</Text>
              <TouchableOpacity onPress={closeDetails}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedChallenge && (
              <View style={styles.modalContent}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <Text style={styles.modalValue}>{selectedChallenge.status}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Stake</Text>
                  <Text style={styles.modalValue}>
                    {selectedChallenge.stake} SOL{solUsd ? ` (≈ $${(selectedChallenge.stake * solUsd).toFixed(2)})` : ''}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Metrics</Text>
                  <Text style={styles.modalValue}>{selectedChallenge.metrics.join(', ')}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Duration</Text>
                  <Text style={styles.modalValue}>{selectedChallenge.duration}h</Text>
                </View>
                <View style={[styles.modalRow, { alignItems: 'flex-start' }]}>
                  <Text style={styles.modalLabel}>Opponents</Text>
                  <View style={{ flex: 1 }}>
                    {selectedChallenge.participants.length <= 1 ? (
                      <Text style={styles.modalValue}>Waiting for others to accept…</Text>
                    ) : (
                      <Text style={styles.modalValue}>
                        {selectedChallenge.participants.slice(1).join(', ')}
                      </Text>
                    )}
                  </View>
                </View>

                {selectedChallenge.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.startButton, { marginTop: 12 }]}
                    onPress={() => {
                      acceptChallenge(selectedChallenge.id);
                      closeDetails();
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.startButtonText}>Accept Challenge</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  challengesList: {
    flexDirection: 'row',
  },
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  moreMetrics: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  timeRemaining: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neon,
  },
  challengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  stakeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  challengeActions: {
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  completeButtonLoading: {
    backgroundColor: colors.primaryGlow,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  completedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 167, 194, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(163, 167, 194, 0.3)',
  },
  pendingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 140,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedActions: {
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    gap: 8,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalLabel: {
    color: colors.textMuted,
    fontSize: 14,
    width: 100,
  },
  modalValue: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
