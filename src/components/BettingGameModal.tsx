import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface BettingOption {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  multiplier: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  icon: string;
  color: string;
}

interface BettingGameModalProps {
  visible: boolean;
  onClose: () => void;
  healthStats: {
    steps: number;
    heartRate: number;
    sleepHours: number;
    standHours: number;
    workouts: number;
    activeEnergy: number;
    flights: number;
    distance: number;
    hrv: number;
    vo2Max: number;
  };
}

const BETTING_OPTIONS: BettingOption[] = [
  // Daily Challenges
  { id: 'steps_10k', title: '10K Steps', description: 'Hit 10,000 steps today', target: 10000, unit: 'steps', multiplier: 1.8, difficulty: 'easy', icon: 'footsteps', color: '#4CAF50' },
  { id: 'steps_15k', title: '15K Steps', description: 'Reach 15,000 steps today', target: 15000, unit: 'steps', multiplier: 3.2, difficulty: 'medium', icon: 'footsteps', color: '#FF9800' },
  { id: 'steps_20k', title: '20K Steps', description: 'Achieve 20,000 steps today', target: 20000, unit: 'steps', multiplier: 5.5, difficulty: 'hard', icon: 'footsteps', color: '#F44336' },
  
  { id: 'active_30', title: '30 Active Min', description: 'Stay active for 30 minutes', target: 30, unit: 'min', multiplier: 2.1, difficulty: 'easy', icon: 'time', color: '#2196F3' },
  { id: 'active_60', title: '60 Active Min', description: 'Stay active for 1 hour', target: 60, unit: 'min', multiplier: 3.8, difficulty: 'medium', icon: 'time', color: '#9C27B0' },
  
  { id: 'flights_10', title: '10 Flights', description: 'Climb 10 flights of stairs', target: 10, unit: 'flights', multiplier: 2.5, difficulty: 'easy', icon: 'trending-up', color: '#00BCD4' },
  { id: 'flights_20', title: '20 Flights', description: 'Climb 20 flights of stairs', target: 20, unit: 'flights', multiplier: 4.2, difficulty: 'medium', icon: 'trending-up', color: '#FF5722' },
  
  { id: 'stand_12', title: '12 Stand Hours', description: 'Stand for 12 hours today', target: 12, unit: 'hours', multiplier: 2.0, difficulty: 'easy', icon: 'body', color: '#607D8B' },
  
  // Weekly Challenges
  { id: 'distance_25', title: '25 Mile Week', description: 'Walk/run 25 miles this week', target: 25, unit: 'miles', multiplier: 3.5, difficulty: 'medium', icon: 'walk', color: '#8BC34A' },
  { id: 'workouts_5', title: '5 Workouts', description: 'Complete 5 workouts this week', target: 5, unit: 'workouts', multiplier: 4.0, difficulty: 'medium', icon: 'fitness', color: '#CDDC39' },
  { id: 'calories_3000', title: '3000 Cal Burn', description: 'Burn 3000 calories this week', target: 3000, unit: 'cal', multiplier: 3.8, difficulty: 'medium', icon: 'flame', color: '#FF6B6B' },
  
  // Advanced Challenges
  { id: 'hr_under_65', title: 'Resting HR <65', description: 'Keep resting heart rate under 65 bpm', target: 65, unit: 'bpm', multiplier: 6.0, difficulty: 'hard', icon: 'heart', color: '#E91E63' },
  { id: 'sleep_8h', title: '8+ Hours Sleep', description: 'Get 8+ hours of sleep nightly for a week', target: 8, unit: 'hours', multiplier: 4.5, difficulty: 'medium', icon: 'moon', color: '#673AB7' },
  { id: 'hrv_50', title: 'HRV Above 50', description: 'Maintain HRV above 50ms for 3 days', target: 50, unit: 'ms', multiplier: 7.2, difficulty: 'hard', icon: 'pulse', color: '#009688' },
  { id: 'vo2_improve', title: 'VO2 Max Boost', description: 'Improve VO2 Max by 5% this month', target: 5, unit: '%', multiplier: 8.5, difficulty: 'extreme', icon: 'speedometer', color: '#795548' },
];

const DIFFICULTY_COLORS = {
  easy: '#4CAF50',
  medium: '#FF9800', 
  hard: '#F44336',
  extreme: '#9C27B0'
};

export default function BettingGameModal({ visible, onClose, healthStats }: BettingGameModalProps) {
  const [selectedBet, setSelectedBet] = useState<BettingOption | null>(null);
  const [betAmount, setBetAmount] = useState(10);

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getCurrentProgress = (option: BettingOption) => {
    switch (option.id.split('_')[0]) {
      case 'steps': return healthStats.steps;
      case 'active': return Math.round(healthStats.activeEnergy / 5); // Rough conversion
      case 'flights': return healthStats.flights;
      case 'stand': return healthStats.standHours;
      case 'distance': return Math.round(healthStats.distance * 0.000621371); // meters to miles
      case 'workouts': return healthStats.workouts;
      case 'calories': return Math.round(healthStats.activeEnergy);
      case 'hr': return healthStats.heartRate;
      case 'sleep': return healthStats.sleepHours;
      case 'hrv': return healthStats.hrv;
      case 'vo2': return healthStats.vo2Max;
      default: return 0;
    }
  };

  const getSuccessChance = (option: BettingOption) => {
    const current = getCurrentProgress(option);
    const progress = current / option.target;
    
    if (progress >= 1) return 95;
    if (progress >= 0.8) return 75;
    if (progress >= 0.6) return 60;
    if (progress >= 0.4) return 45;
    if (progress >= 0.2) return 30;
    return 15;
  };

  const placeBet = () => {
    if (!selectedBet) return;
    
    // TODO: Implement actual betting logic
    console.log(`Placing bet: ${selectedBet.title} for $${betAmount}`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Betting Game</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Choose a challenge and bet on your success!</Text>
          
          {BETTING_OPTIONS.map((option) => {
            const current = getCurrentProgress(option);
            const successChance = getSuccessChance(option);
            const isSelected = selectedBet?.id === option.id;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.betOption, isSelected && styles.selectedBet]}
                onPress={() => setSelectedBet(option)}
              >
                <View style={styles.betHeader}>
                  <View style={[styles.betIcon, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={24} color={option.color} />
                  </View>
                  <View style={styles.betInfo}>
                    <Text style={styles.betTitle}>{option.title}</Text>
                    <Text style={styles.betDescription}>{option.description}</Text>
                  </View>
                  <View style={styles.betMeta}>
                    <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[option.difficulty] + '20' }]}>
                      <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[option.difficulty] }]}>
                        {getDifficultyLabel(option.difficulty)}
                      </Text>
                    </View>
                    <Text style={styles.multiplier}>{option.multiplier}x</Text>
                  </View>
                </View>
                
                <View style={styles.betStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Current</Text>
                    <Text style={styles.statValue}>{current} {option.unit}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Target</Text>
                    <Text style={styles.statValue}>{option.target} {option.unit}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Success Rate</Text>
                    <Text style={[styles.statValue, { color: successChance > 60 ? '#4CAF50' : successChance > 30 ? '#FF9800' : '#F44336' }]}>
                      {successChance}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedBet && (
          <View style={styles.footer}>
            <View style={styles.betAmountSection}>
              <Text style={styles.betAmountLabel}>Bet Amount</Text>
              <View style={styles.betAmountButtons}>
                {[5, 10, 25, 50].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[styles.amountButton, betAmount === amount && styles.selectedAmount]}
                    onPress={() => setBetAmount(amount)}
                  >
                    <Text style={[styles.amountText, betAmount === amount && styles.selectedAmountText]}>
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.placeBetButton} onPress={placeBet}>
              <Text style={styles.placeBetText}>
                Place Bet - Win ${Math.round(betAmount * selectedBet.multiplier)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  
  closeButton: {
    padding: 8,
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  betOption: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  selectedBet: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  
  betHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  betIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  betInfo: {
    flex: 1,
  },
  
  betTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  betDescription: {
    color: colors.textMuted,
    fontSize: 14,
  },
  
  betMeta: {
    alignItems: 'flex-end',
  },
  
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  multiplier: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
  },
  
  betStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  
  betAmountSection: {
    marginBottom: 16,
  },
  
  betAmountLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  betAmountButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  
  amountButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  selectedAmount: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  
  amountText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  
  selectedAmountText: {
    color: colors.primary,
  },
  
  placeBetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  placeBetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
