import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { ChallengeService, Challenge, Friend } from '../services/challengeService';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [openChallenges, setOpenChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);

  useEffect(() => {
    // Load friends and open challenges for leaderboard section
    const load = async () => {
      try {
        setIsLoadingChallenges(true);
        const [friendList, challenges] = await Promise.all([
          ChallengeService.getFriendsList().catch(() => []),
          ChallengeService.getUserChallenges().catch(() => []),
        ]);
        setFriends(friendList);
        // Show pending or active
        setOpenChallenges((challenges as Challenge[]).filter(c => c.status === 'pending' || c.status === 'active'));
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    load();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.bg }]}>
      <Text style={styles.header}>Open Bets & Leaders</Text>
      <Text style={styles.subtitle}>Your active and pending challenges</Text>

      {isLoadingChallenges ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : openChallenges.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No open bets yet</Text>
          <Text style={styles.emptySubtext}>Create challenges from the Home screen to see them here</Text>
        </View>
      ) : (
        openChallenges.map((ch) => {
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
                <Text style={styles.challengeTitle}>{ch.metrics?.join(', ')} • {ch.stake} SOL</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    fontSize: 14,
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
});
