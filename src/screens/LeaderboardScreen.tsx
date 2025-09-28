import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { ChallengeService, Challenge, Friend } from '../services/challengeService';
import { solPriceService } from '../services/solPriceService';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [openChallenges, setOpenChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
  const [acceptingChallenge, setAcceptingChallenge] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingChallenges(true);
      const [friendList, openChallenges, userChallenges, price] = await Promise.all([
        ChallengeService.getFriendsList().catch(() => []),
        ChallengeService.getOpenChallenges().catch(() => []),
        ChallengeService.getUserChallenges().catch(() => []),
        solPriceService.getCurrentPrice(),
      ]);
      setFriends(friendList);
      setOpenChallenges(openChallenges);
      setUserChallenges((userChallenges as Challenge[]).filter(c => c.status === 'pending' || c.status === 'active'));
      setSolUsdPrice(price);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const acceptChallenge = async (challengeId: string) => {
    try {
      setAcceptingChallenge(challengeId);
      const result = await ChallengeService.acceptChallenge(challengeId);
      if (result.status === 'active') {
        Alert.alert('Success', 'Challenge accepted and activated! Stakes have been deducted. 🚀');
      } else {
        Alert.alert('Success', 'Challenge accepted! Waiting for more participants to activate. ⏳');
      }
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Failed to accept challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge. Please try again.');
    } finally {
      setAcceptingChallenge(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Open Bets & Leaders</Text>
        <Text style={styles.subtitle}>Join open challenges or view your active ones</Text>

        {/* Open Challenges from Other Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Open Challenges</Text>
          <Text style={styles.sectionSubtitle}>Join challenges created by other users</Text>
          
          {isLoadingChallenges ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading challenges...</Text>
            </View>
          ) : openChallenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>No open challenges</Text>
              <Text style={styles.emptySubtext}>Be the first to create one!</Text>
            </View>
          ) : (
            openChallenges.map((ch) => (
              <View key={ch.id} style={styles.challengeItem}>
                <View style={styles.challengeIcon}>
                  <Ionicons name="people" size={20} color={colors.primary} />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>
                    {ch.metrics?.join(', ')} Challenge
                  </Text>
                  <Text style={styles.challengeDesc}>
                    Stake: {ch.stake} SOL{solUsdPrice ? ` (≈ $${(ch.stake * solUsdPrice).toFixed(2)})` : ''}
                  </Text>
                  <Text style={styles.challengeDesc}>
                    Duration: {ch.duration}h • Created by @{ch.creator_username}
                  </Text>
                  <Text style={styles.challengeDesc}>
                    {ch.participantCount || 0} participant{(ch.participantCount || 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.challengeReward}>
                  <TouchableOpacity 
                    style={[styles.acceptButton, acceptingChallenge === ch.id && styles.acceptButtonLoading]}
                    onPress={() => acceptChallenge(ch.id)}
                    disabled={acceptingChallenge === ch.id}
                  >
                    {acceptingChallenge === ch.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={16} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* User's Active Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Your Active Challenges</Text>
          <Text style={styles.sectionSubtitle}>Track your progress and rankings</Text>
          
          {userChallenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>No active challenges</Text>
              <Text style={styles.emptySubtext}>Accept or create challenges to see them here</Text>
            </View>
          ) : (
            userChallenges.map((ch) => {
              // Compute leader
              const progress = ch.progress || {};
              const participants = ch.participants || [];
              let leaderUser: string | null = null;
              let leaderValue = -Infinity;
              participants.forEach(u => {
                const val = typeof progress[u] === 'number' ? (progress[u] as number) : 0;
                if (val > leaderValue) { leaderValue = val; leaderUser = u; }
              });
              const youAreLeading = leaderUser === user?.username;
              const friendMap = new Map(friends.map(f => [f.username, f] as [string | undefined, Friend]));
              const leaderFriend = friendMap.get(leaderUser || '');

              return (
                <View key={ch.id} style={styles.challengeItem}>
                  <View style={styles.challengeIcon}>
                    <Ionicons name="trophy" size={20} color={colors.neon} />
                  </View>
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeTitle}>
                      {ch.metrics?.join(', ')} • {ch.stake} SOL
                    </Text>
                    <Text style={styles.challengeDesc}>
                      {ch.status.toUpperCase()} • Ends {new Date(ch.endsAt).toLocaleDateString()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {youAreLeading ? (
                        <Avatar seed={user?.avatar_seed || user?.username || 'you'} size={20} />
                      ) : leaderFriend?.avatar_seed ? (
                        <Avatar seed={leaderFriend.avatar_seed} size={20} />
                      ) : null}
                      <Text style={[styles.challengeDesc, { marginLeft: 8 }]}>
                        Leader: {youAreLeading ? 'You' : leaderFriend?.name || `@${leaderUser}` } ({Math.max(0, leaderValue)})
                      </Text>
                    </View>
                  </View>
                  <View style={styles.challengeReward}>
                    <TouchableOpacity>
                      <Ionicons name="open" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 16,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
  acceptButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  acceptButtonLoading: {
    backgroundColor: colors.primaryGlow,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
