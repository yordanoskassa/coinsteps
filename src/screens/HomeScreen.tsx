import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useHealthData } from '../hooks/useHealthData';
import { useAuth } from '../contexts/AuthContext';
import StepRing from '../components/StepRing';
import MiniAreaChart from '../components/MiniAreaChart';
import Avatar from '../components/Avatar';
import BettingGameModal from '../components/BettingGameModal';
import { logSteps } from '../services/steps';

const GOAL = 10000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [showBettingModal, setShowBettingModal] = useState(false);
  const { 
    steps, 
    distance, 
    flights, 
    activeEnergy,
    heartRate,
    sleepHours,
    standHours,
    workouts,
    hrv,
    vo2Max,
    isLoading, 
    hasPermission, 
    source, 
    error 
  } = useHealthData();

  // Post steps to backend when updated (basic debounce)
  useEffect(() => {
    if (steps <= 0) return;
    const id = setTimeout(async () => {
      const sourceType = source === 'healthkit' ? 'apple_health' : 'pedometer';
      logSteps(steps, sourceType).catch(() => {});
    }, 1200);
    return () => clearTimeout(id);
  }, [steps, source]);

  const chartData = useMemo(() => {
    // Build a realistic-looking hourly cumulative series based on today's total steps.
    // Heavier activity in morning commute and early evening, low activity at night.
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Base weights per hour (sum will be normalized). Peaks around 8-9 and 17-19.
    const baseWeights = hours.map((h) => {
      if (h >= 6 && h <= 9) return 1.4;       // morning ramp + commute
      if (h >= 10 && h <= 12) return 1.0;     // late morning
      if (h >= 13 && h <= 16) return 0.9;     // afternoon
      if (h >= 17 && h <= 19) return 1.6;     // evening peak
      if (h >= 20 && h <= 21) return 0.7;     // wind-down
      return 0.25;                             // night/very low
    });

    // Add a small randomness to make it look organic, but keep deterministic per hour.
    const jittered = baseWeights.map((w, h) => {
      const rand = ((h * 9301 + 49297) % 233280) / 233280; // deterministic pseudo-random
      const jitter = (rand - 0.5) * 0.15; // ±7.5%
      return Math.max(0.05, w * (1 + jitter));
    });

    const weightSum = jittered.reduce((a, b) => a + b, 0);
    const targetSteps = Math.max(0, steps);
    const perHour = jittered.map((w) => (w / weightSum) * targetSteps);

    // Convert to cumulative for area chart
    let running = 0;
    return hours.map((h) => {
      running += perHour[h];
      return { x: h, y: Math.round(running) };
    });
  }, [steps]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.userSection}>
            {user?.avatar_seed && <Avatar seed={user.avatar_seed} size={48} />}
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.usernameText}>{user?.full_name || user?.username}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading health data...</Text>
          </View>
        ) : (
          <>
            {/* Betting Balance & Quick Actions */}
            <View style={styles.bettingSection}>
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <View style={styles.balanceIcon}>
                    <Ionicons name="wallet" size={24} color="#FFD700" />
                  </View>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Coin Balance</Text>
                    <Text style={styles.balanceValue}>$127.50</Text>
                  </View>
                  <TouchableOpacity style={styles.addFundsButton}>
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.bettingStats}>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>3</Text>
                    <Text style={styles.betStatLabel}>Active Bets</Text>
                  </View>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>$45</Text>
                    <Text style={styles.betStatLabel}>At Risk</Text>
                  </View>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>12</Text>
                    <Text style={styles.betStatLabel}>Win Streak</Text>
                  </View>
                </View>
              </View>

              <View style={styles.quickBets}>
                <Text style={styles.quickBetsTitle}>Quick Bets</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBetScroll}>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="footsteps" size={24} color={colors.primary} />
                    <Text style={styles.quickBetText}>10K Steps</Text>
                    <Text style={styles.quickBetAmount}>$10</Text>
                    <Text style={styles.quickBetOdds}>2.5x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: '#FF6B6B20' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="time" size={24} color="#FF6B6B" />
                    <Text style={styles.quickBetText}>30 Active Min</Text>
                    <Text style={styles.quickBetAmount}>$15</Text>
                    <Text style={styles.quickBetOdds}>3.2x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: '#4ECDC420' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="trending-up" size={24} color="#4ECDC4" />
                    <Text style={styles.quickBetText}>15 Flights</Text>
                    <Text style={styles.quickBetAmount}>$20</Text>
                    <Text style={styles.quickBetOdds}>4.1x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: '#45B7D120' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="body" size={24} color="#45B7D1" />
                    <Text style={styles.quickBetText}>12 Stand Hours</Text>
                    <Text style={styles.quickBetAmount}>$8</Text>
                    <Text style={styles.quickBetOdds}>1.8x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: '#96CEB420' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="walk" size={24} color="#96CEB4" />
                    <Text style={styles.quickBetText}>5 Mile Walk</Text>
                    <Text style={styles.quickBetAmount}>$25</Text>
                    <Text style={styles.quickBetOdds}>5.0x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickBetCard, { backgroundColor: '#FD79A820' }]}
                    onPress={() => setShowBettingModal(true)}
                  >
                    <Ionicons name="flame" size={24} color="#FD79A8" />
                    <Text style={styles.quickBetText}>500 Cal Burn</Text>
                    <Text style={styles.quickBetAmount}>$18</Text>
                    <Text style={styles.quickBetOdds}>3.7x</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Primary Stats - Steps Focus */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Activity</Text>
              <Text style={styles.sectionSubtitle}>Your step progress and hourly breakdown</Text>
              
              <View style={styles.stepTrackerCard}>
                <View style={styles.stepRingContainer}>
                  <StepRing steps={steps} goal={GOAL} />
                  <View style={styles.stepDetails}>
                    <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
                    <Text style={styles.stepGoal}>of {GOAL.toLocaleString()} steps</Text>
                    <Text style={styles.stepPercentage}>
                      {Math.round((steps / GOAL) * 100)}% complete
                    </Text>
                  </View>
                </View>
                
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Hourly Progress</Text>
                  <MiniAreaChart data={chartData} width={300} height={100} />
                </View>
              </View>
            </View>

            {/* Daily Achievable Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Targets</Text>
              <Text style={styles.sectionSubtitle}>Perfect for daily bets</Text>
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="footsteps" 
                  label="Steps" 
                  value={steps.toLocaleString()} 
                  target="10,000" 
                  progress={steps / GOAL}
                  color={colors.primary}
                />
                <StatCard 
                  icon="time" 
                  label="Active Minutes" 
                  value={Math.round(activeEnergy / 5).toString()} 
                  target="30" 
                  progress={Math.min(1, (activeEnergy / 5) / 30)}
                  color="#FF6B6B"
                />
                <StatCard 
                  icon="trending-up" 
                  label="Flights" 
                  value={flights.toString()} 
                  target="10" 
                  progress={Math.min(1, flights / 10)}
                  color="#4ECDC4"
                />
                <StatCard 
                  icon="body" 
                  label="Stand Hours" 
                  value={standHours.toString()} 
                  target="12" 
                  progress={standHours / 12}
                  color="#45B7D1"
                />
              </View>
            </View>

            {/* Weekly Challenge Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Challenges</Text>
              <Text style={styles.sectionSubtitle}>Longer commitment bets</Text>
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="walk" 
                  label="Distance" 
                  value={(distance * 0.000621371).toFixed(1)} 
                  target="25.0" 
                  progress={Math.min(1, (distance * 0.000621371) / 25)}
                  color="#96CEB4"
                  unit="mi"
                />
                <StatCard 
                  icon="fitness" 
                  label="Workouts" 
                  value={workouts.toString()} 
                  target="5" 
                  progress={workouts / 5}
                  color="#FFEAA7"
                />
                <StatCard 
                  icon="flame" 
                  label="Active Energy" 
                  value={Math.round(activeEnergy).toString()} 
                  target="400" 
                  progress={Math.min(1, activeEnergy / 400)}
                  color="#FD79A8"
                  unit="cal"
                />
              </View>
            </View>

            {/* Advanced Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advanced Metrics</Text>
              <Text style={styles.sectionSubtitle}>For fitness enthusiasts</Text>
              <View style={styles.statsGrid}>
                <StatCard 
                  icon="heart" 
                  label="Resting HR" 
                  value={heartRate.toString()} 
                  target="<70" 
                  progress={Math.min(1, (70 - heartRate) / 10)}
                  color="#E17055"
                  unit="bpm"
                />
                <StatCard 
                  icon="moon" 
                  label="Sleep" 
                  value={sleepHours.toFixed(1)} 
                  target="8.0" 
                  progress={sleepHours / 8}
                  color="#6C5CE7"
                  unit="hrs"
                />
                <StatCard 
                  icon="pulse" 
                  label="HRV" 
                  value={hrv.toString()} 
                  target="45" 
                  progress={hrv / 45}
                  color="#00B894"
                  unit="ms"
                />
                <StatCard 
                  icon="speedometer" 
                  label="VO2 Max" 
                  value={vo2Max.toString()} 
                  target="50" 
                  progress={vo2Max / 50}
                  color="#A29BFE"
                  unit="ml/kg/min"
                />
              </View>
            </View>

            {source && (
              <Text style={styles.sourceText}>
                Data from {source === 'healthkit' ? 'Apple Health' : 'Pedometer'}
              </Text>
            )}
          </>
        )}

        {hasPermission === false && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionText}>
              {error || 'Enable Motion & Fitness to track your steps.'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <BettingGameModal 
        visible={showBettingModal}
        onClose={() => setShowBettingModal(false)}
        healthStats={{
          steps,
          distance,
          flights,
          activeEnergy,
          heartRate,
          sleepHours,
          standHours,
          workouts,
          hrv,
          vo2Max,
        }}
      />
    </View>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  target: string;
  progress: number;
  color: string;
  unit?: string;
}

function StatCard({ icon, label, value, target, progress, color, unit }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      
      <View style={styles.statContent}>
        <Text style={styles.statValue}>
          {value}
          {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>
        <Text style={styles.statTarget}>of {target}</Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: color }]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  userSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userInfo: { flex: 1, marginLeft: 12 },
  welcomeText: { color: colors.textMuted, fontSize: 14 },
  usernameText: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 2 },
  logoutButton: { padding: 8, borderRadius: 8 },
  
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
  
  primarySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryChart: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
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
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  statLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  
  statContent: {
    marginBottom: 12,
  },
  
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  
  statUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
  },
  
  statTarget: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  sourceText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  
  permissionBanner: {
    backgroundColor: '#341A1A',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  permissionText: { color: '#FFB4B4', textAlign: 'center' },
  
  // Betting Section Styles
  bettingSection: {
    marginBottom: 32,
  },
  
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFD70020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  balanceInfo: {
    flex: 1,
  },
  
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  
  balanceValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  
  addFundsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  bettingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  bettingStat: {
    alignItems: 'center',
  },
  
  betStatValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  betStatLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  
  quickBets: {
    marginTop: 8,
  },
  
  quickBetsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  quickBetScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  
  quickBetCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  
  quickBetText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  
  quickBetAmount: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  
  quickBetOdds: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Step Tracker Styles
  stepTrackerCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  
  stepRingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  stepDetails: {
    flex: 1,
    marginLeft: 24,
  },
  
  stepCount: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  stepGoal: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  
  stepPercentage: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  chartContainer: {
    alignItems: 'center',
  },
  
  chartTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
