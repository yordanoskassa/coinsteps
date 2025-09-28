import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeService, Friend } from '../services/challengeService';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from './Avatar';

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
  initialMetrics?: string[];
  initialStake?: number; // SOL
  initialDuration?: number; // hours
}

interface HealthMetric {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  unit: string;
  color: string;
}

const healthMetrics: HealthMetric[] = [
  { id: 'steps', name: 'Steps', icon: 'walk', unit: 'steps', color: '#4CAF50' },
  { id: 'active_minutes', name: 'Active Minutes', icon: 'time', unit: 'minutes', color: '#FF9800' },
  { id: 'calories', name: 'Calories Burned', icon: 'flame', unit: 'calories', color: '#F44336' },
  { id: 'distance', name: 'Distance', icon: 'location', unit: 'km', color: '#2196F3' },
  { id: 'heart_rate', name: 'Avg Heart Rate', icon: 'heart', unit: 'bpm', color: '#E91E63' },
  { id: 'sleep', name: 'Sleep Hours', icon: 'moon', unit: 'hours', color: '#9C27B0' },
];

const durationOptions = [
  { label: '12 Hours', value: 12 },
  { label: '24 Hours', value: 24 },
  { label: '3 Days', value: 72 },
  { label: '7 Days', value: 168 },
  { label: 'Other', value: -1 },
];

export default function CreateChallengeModal({ visible, onClose, onChallengeCreated, initialMetrics, initialStake, initialDuration }: CreateChallengeModalProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['steps']);
  const [duration, setDuration] = useState(24);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [message, setMessage] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    if (visible) {
      // Prefill from initial props if provided
      if (initialMetrics && initialMetrics.length) setSelectedMetrics(initialMetrics);
      if (typeof initialStake === 'number') setStakeAmount(String(initialStake));
      if (typeof initialDuration === 'number') setDuration(initialDuration);
      loadFriends();
      loadUserBalance();
    }
  }, [visible, initialMetrics, initialStake, initialDuration]);

  const loadUserBalance = async () => {
    try {
      const balance = await ChallengeService.getUserBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error('Failed to load user balance:', error);
      setUserBalance(0);
    }
  };

  const loadFriends = async () => {
    try {
      setIsLoadingFriends(true);
      const friendsList = await ChallengeService.getFriendsList();
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.id === friend.id);
      if (isSelected) {
        return prev.filter(f => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const createChallenge = async () => {
    // Allow creating a solo challenge (no friends). We'll show a gentle warning instead of blocking.
    if (!selectedFriends.length) {
      Alert.alert(
        'No Friends Selected',
        'You did not select any friends. You can still create a solo challenge and invite friends later.',
        [{ text: 'Continue', style: 'default' }, { text: 'Cancel', style: 'cancel', onPress: () => {} }]
      );
      // We continue; no early return needed
    }

    if (!selectedMetrics.length) {
      Alert.alert('Error', 'Please select at least one health metric');
      return;
    }

    if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid stake amount');
      return;
    }

    // Handle custom duration
    let finalDuration = duration;
    if (duration === -1) {
      if (!customDuration || isNaN(Number(customDuration)) || Number(customDuration) <= 0) {
        Alert.alert('Error', 'Please enter a valid custom duration in hours');
        return;
      }
      finalDuration = Number(customDuration);
    }

    try {
      setIsLoading(true);
      
      // Check user balance before creating challenge
      const userBalance = await ChallengeService.getUserBalance();
      if (userBalance < Number(stakeAmount)) {
        Alert.alert('Insufficient Balance', `You have ${userBalance} SOL but need ${stakeAmount} SOL to create this challenge.`);
        return;
      }
      
      if (userBalance <= 0) {
        Alert.alert('No Balance', 'You need SOL to create challenges. Please add funds to your account.');
        return;
      }
      
      await ChallengeService.createChallenge({
        metrics: selectedMetrics,
        duration: finalDuration,
        stake: Number(stakeAmount),
        message: message.trim(),
        // Prefer email for invitations, fallback to username if email missing
        friends: selectedFriends.map(f => f.email || f.username || '').filter(Boolean),
      });

      Alert.alert('Success', 'Challenge created successfully!');
      resetForm();
      onChallengeCreated();
      onClose();

    } catch (error) {
      console.error('Failed to create challenge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create challenge. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMetrics(['steps']);
    setDuration(24);
    setCustomDuration('');
    setShowCustomDuration(false);
    setStakeAmount('0.1');
    setMessage('');
    setSelectedFriends([]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.placeholder} />
            <Text style={styles.headerTitle}>Create Challenge</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Health Metrics Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Health Metrics</Text>
            <View style={styles.metricsGrid}>
              {healthMetrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  style={[
                    styles.metricCard,
                    selectedMetrics.includes(metric.id) && styles.metricCardSelected
                  ]}
                  onPress={() => toggleMetricSelection(metric.id)}
                >
                  <View style={[styles.metricIcon, { backgroundColor: metric.color }]}>
                    <Ionicons name={metric.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[
                    styles.metricName,
                    selectedMetrics.includes(metric.id) && { color: metric.color }
                  ]}>
                    {metric.name}
                  </Text>
                  <View style={[
                    styles.checkbox,
                    selectedMetrics.includes(metric.id) && { backgroundColor: metric.color, borderColor: metric.color }
                  ]}>
                    {selectedMetrics.includes(metric.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationGrid}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationOption,
                    duration === option.value && styles.durationOptionSelected
                  ]}
                  onPress={() => {
                    if (option.value === -1) {
                      setShowCustomDuration(true);
                      setDuration(-1);
                    } else {
                      setShowCustomDuration(false);
                      setDuration(option.value);
                    }
                  }}
                >
                  <Text style={[
                    styles.durationOptionText,
                    duration === option.value && styles.durationOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {showCustomDuration && (
              <View style={styles.customDurationContainer}>
                <Text style={styles.customDurationLabel}>Enter custom duration (hours):</Text>
                <TextInput
                  style={styles.customDurationInput}
                  placeholder="e.g., 48"
                  placeholderTextColor="#666"
                  value={customDuration}
                  onChangeText={setCustomDuration}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Stake Amount */}
          <View style={styles.inputGroup}>
            <View style={styles.stakeHeader}>
              <Text style={styles.inputLabel}>Stake Amount (SOL)</Text>
              <Text style={styles.balanceText}>
                Balance: {userBalance !== null ? `${userBalance.toFixed(2)} SOL` : 'Loading...'}
              </Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={stakeAmount}
              onChangeText={setStakeAmount}
              placeholder="0.1"
              placeholderTextColor="rgba(232, 234, 246, 0.5)"
              keyboardType="numeric"
            />
            {userBalance !== null && Number(stakeAmount) > userBalance && (
              <Text style={styles.errorText}>
                Insufficient balance. You have {userBalance.toFixed(2)} SOL
              </Text>
            )}
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Add a motivational message for your friends..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#A3A7C2"
            />
          </View>

          {/* Friends Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Friends</Text>
            {isLoadingFriends ? (
              <ActivityIndicator style={styles.loader} />
            ) : friends.length === 0 ? (
              <Text style={styles.noFriendsText}>
                No other users found. Registered users will appear here!
              </Text>
            ) : (
              <View style={styles.friendsList}>
                {friends.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendCard,
                      selectedFriends.some(f => f.id === friend.id) && styles.selectedFriend
                    ]}
                    onPress={() => toggleFriendSelection(friend)}
                  >
                    <Avatar 
                      seed={friend.avatar_seed || friend.name} 
                      size={40}
                    />
                    <View style={styles.friendDetails}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendEmail}>{friend.email || `@${friend.username}`}</Text>
                    </View>
                    {selectedFriends.some(f => f.id === friend.id) && (
                      <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Selected Friends Display */}
          {selectedFriends.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Friends ({selectedFriends.length})</Text>
              <View style={styles.selectedFriendsList}>
                {selectedFriends.map((friend) => (
                  <View key={friend.id} style={styles.selectedFriendChip}>
                    <Avatar 
                      seed={friend.avatar_seed || friend.name} 
                      size={24}
                    />
                    <Text style={styles.selectedFriendName}>{friend.name}</Text>
                    <TouchableOpacity onPress={() => toggleFriendSelection(friend)}>
                      <Ionicons name="close-circle" size={20} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, (!selectedMetrics.length || isLoading) && styles.disabledButton]}
            onPress={createChallenge}
            disabled={!selectedMetrics.length || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Challenge</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E1A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1A1F3A',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E8EAF6',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
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
    color: '#E8EAF6',
    marginBottom: 12,
  },
  challengeTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  challengeTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  challengeTypeCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  challengeTypeIcon: {
    marginBottom: 8,
  },
  challengeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8EAF6',
    textAlign: 'center',
  },
  challengeTypeTextSelected: {
    color: '#6366F1',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAF6',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#E8EAF6',
  },
  stakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  friendItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAF6',
  },
  friendEmail: {
    fontSize: 14,
    color: '#A3A7C2',
  },
  selectedFriendsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedFriendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 8,
  },
  selectedFriendName: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  addFriendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#2A2E4A',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Missing styles
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8EAF6',
    textAlign: 'center',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#E8EAF6',
  },
  textArea: {
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#E8EAF6',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addFriendForm: {
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  noFriendsText: {
    color: '#A3A7C2',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  selectedFriend: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  friendInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1A1F3A',
  },
  disabledButton: {
    backgroundColor: '#2A2E4A',
  },
  
  // New metric selection styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
  },
  metricCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8EAF6',
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A3A7C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Duration selection styles
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366F1',
  },
  durationOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAF6',
    textAlign: 'center',
  },
  durationOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  customDurationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  customDurationLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  customDurationInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

// ... (rest of the code remains the same)
