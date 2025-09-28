import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import GradientBackground from '../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ChallengeService, Challenge } from '../services/challengeService';
import CreateChallengeModal from '../components/CreateChallengeModal';
import ActiveChallenges from '../components/ActiveChallenges';

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const userChallenges = await ChallengeService.getUserChallenges();
      setChallenges(userChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      Alert.alert('Error', 'Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleChallengeCreated = () => {
    setShowCreateModal(false);
    loadChallenges();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'completed': return colors.primary;
      default: return colors.textMuted;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ActiveChallenges onRefresh={loadChallenges} />

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>
                
                <Text style={styles.cardTitle}>
                  {item.metrics.join(', ').toUpperCase()} Challenge
                </Text>
                
                <Text style={styles.cardSub}>
                  Target: {item.target} • Stake: {item.stake} SOL • Duration: {item.duration}h
                </Text>
                
                <View style={styles.rowBetween}>
                  <Text style={styles.participants}>
                    {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No challenges yet. Create your first challenge to get started!
              </Text>
            }
          />
        )}

        <CreateChallengeModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onChallengeCreated={handleChallengeCreated}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  headerTitle: { 
    color: colors.text, 
    fontSize: 24, 
    fontWeight: '800' 
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardTitle: { 
    color: colors.text, 
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSub: { 
    color: colors.textMuted, 
    fontSize: 14,
    marginBottom: 12,
  },
  rowBetween: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  participants: { 
    color: colors.text,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    lineHeight: 24,
  },
});
