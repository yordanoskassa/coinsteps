import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useHealthData } from '../hooks/useHealthData';
import { useAuth } from '../contexts/AuthContext';
import StepRing from '../components/StepRing';
import MiniAreaChart from '../components/MiniAreaChart';
import Avatar from '../components/Avatar';
import BettingGameModal from '../components/BettingGameModal';
import CreateChallengeModal from '../components/CreateChallengeModal';
import CameraModal from '../components/CameraModal';
import { ChallengeService, Challenge, Friend } from '../services/challengeService';
import { logSteps } from '../services/steps';
import { BettingService, WalletInfo, BettingStats } from '../services/betting';
import { solPriceService } from '../services/solPriceService';

const GOAL = 10000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [quickChallengePrefill, setQuickChallengePrefill] = useState<{ metrics: string[]; stake: number; duration: number } | null>(null);
  const [openChallenges, setOpenChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [bettingStats, setBettingStats] = useState<BettingStats | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
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

  // Load all data once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      try {
        // Load SOL price
        if (isMounted) {
          const price = await solPriceService.getCurrentPrice();
          if (isMounted) {
            setSolUsdPrice(price);
          }
        }

        // Load wallet data
        if (isMounted) {
          setIsLoadingWallet(true);
          const [walletData, statsData] = await Promise.all([
            BettingService.getWalletInfo().catch(() => ({ public_key: '', balance: 0 })),
            BettingService.getBettingStats().catch(() => ({ activeBets: 0, atRisk: 0, winStreak: 0, totalWinnings: 0 }))
          ]);
          if (isMounted) {
            setWalletInfo(walletData);
            setBettingStats(statsData);
            setIsLoadingWallet(false);
          }
        }

        // Load challenges and friends
        if (isMounted) {
          setIsLoadingChallenges(true);
          const [friendList, challenges, balance] = await Promise.all([
            ChallengeService.getFriendsList().catch(() => []),
            ChallengeService.getUserChallenges().catch(() => []),
            ChallengeService.getUserBalance().catch(() => 0),
          ]);
          if (isMounted) {
            setFriends(friendList);
            setUserBalance(balance);
            setOpenChallenges((challenges as Challenge[]).filter(c => c.status === 'pending' || c.status === 'active'));
            setIsLoadingChallenges(false);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        if (isMounted) {
          setIsLoadingWallet(false);
          setIsLoadingChallenges(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Post steps to backend when updated (basic debounce)
  useEffect(() => {
    if (steps <= 0) return;
    const id = setTimeout(async () => {
      const sourceType = source === 'healthkit' ? 'apple_health' : 'pedometer';
      logSteps(steps, sourceType).catch(() => {});
    }, 1200);
    return () => clearTimeout(id);
  }, [steps, source]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const [walletData, statsData, friendList, challenges, balance, price] = await Promise.all([
        BettingService.getWalletInfo().catch(() => ({ public_key: '', balance: 0 })),
        BettingService.getBettingStats().catch(() => ({ activeBets: 0, atRisk: 0, winStreak: 0, totalWinnings: 0 })),
        ChallengeService.getFriendsList().catch(() => []),
        ChallengeService.getUserChallenges().catch(() => []),
        ChallengeService.getUserBalance().catch(() => 0),
        solPriceService.getCurrentPrice(),
      ]);
      
      setWalletInfo(walletData);
      setBettingStats(statsData);
      setFriends(friendList);
      setUserBalance(balance);
      setSolUsdPrice(price);
      setOpenChallenges((challenges as Challenge[]).filter(c => c.status === 'pending' || c.status === 'active'));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Generate dynamic challenge options based on current health data
  const generateChallengeOptions = () => {
    const baseStakeSOL = 0.01; // Base stake in SOL
    const solToUSD = solUsdPrice || 150; // Use real SOL price or fallback
    
    return [
      {
        id: 'steps_10k',
        icon: 'footsteps',
        title: '10K Steps',
        target: 10000,
        current: steps,
        stakeSOL: baseStakeSOL * 0.5,
        multiplier: steps < 5000 ? 3.2 : steps < 8000 ? 2.5 : 1.8,
        difficulty: steps < 5000 ? 'Hard' : steps < 8000 ? 'Medium' : 'Easy'
      },
      {
        id: 'active_30min',
        icon: 'time',
        title: '30 Active Min',
        target: 30,
        current: Math.round(activeEnergy / 5),
        stakeSOL: baseStakeSOL * 0.75,
        multiplier: activeEnergy < 100 ? 4.1 : activeEnergy < 200 ? 3.2 : 2.1,
        difficulty: activeEnergy < 100 ? 'Hard' : activeEnergy < 200 ? 'Medium' : 'Easy'
      },
      {
        id: 'flights_15',
        icon: 'trending-up',
        title: '15 Flights',
        target: 15,
        current: flights,
        stakeSOL: baseStakeSOL * 1.0,
        multiplier: flights < 5 ? 5.0 : flights < 10 ? 4.1 : 2.8,
        difficulty: flights < 5 ? 'Hard' : flights < 10 ? 'Medium' : 'Easy'
      },
      {
        id: 'stand_12hrs',
        icon: 'body',
        title: '12 Stand Hours',
        target: 12,
        current: standHours,
        stakeSOL: baseStakeSOL * 0.4,
        multiplier: standHours < 6 ? 2.5 : standHours < 9 ? 1.8 : 1.4,
        difficulty: standHours < 6 ? 'Hard' : standHours < 9 ? 'Medium' : 'Easy'
      },
      {
        id: 'distance_5mi',
        icon: 'walk',
        title: '5 Mile Walk',
        target: 5.0,
        current: distance * 0.000621371,
        stakeSOL: baseStakeSOL * 1.25,
        multiplier: (distance * 0.000621371) < 2 ? 6.0 : (distance * 0.000621371) < 3.5 ? 5.0 : 3.5,
        difficulty: (distance * 0.000621371) < 2 ? 'Hard' : (distance * 0.000621371) < 3.5 ? 'Medium' : 'Easy'
      },
      {
        id: 'calories_500',
        icon: 'flame',
        title: '500 Cal Burn',
        target: 500,
        current: Math.round(activeEnergy),
        stakeSOL: baseStakeSOL * 0.9,
        multiplier: activeEnergy < 200 ? 4.5 : activeEnergy < 350 ? 3.7 : 2.3,
        difficulty: activeEnergy < 200 ? 'Hard' : activeEnergy < 350 ? 'Medium' : 'Easy'
      }
    ].map(option => ({
      ...option,
      stakeUSD: option.stakeSOL * solToUSD,
      potentialWinUSD: option.stakeSOL * option.multiplier * solToUSD
    }));
  };

  const chartData = React.useMemo(() => {
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.userSection}>
            {user?.avatar_seed && <Avatar seed={user.avatar_seed} size={48} />}
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>{user?.full_name || user?.username || 'User'}</Text>
              <Text style={styles.balanceText}>
                {userBalance.toFixed(2)} SOL{solUsdPrice ? ` (≈ $${(userBalance * solUsdPrice).toFixed(2)})` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.stepIndicator}>
            <Ionicons name="footsteps" size={16} color={colors.primary} />
            <Text style={styles.stepIndicatorText}>{steps.toLocaleString()}</Text>
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
            <View style={styles.challengeSection}>
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <View style={styles.balanceIcon}>
                    <Ionicons name="wallet" size={24} color="#FFD700" />
                  </View>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Coin Balance</Text>
                    <Text style={styles.balanceValue}>
                      {isLoadingWallet ? '...' : solUsdPrice ? `$${((walletInfo?.balance || 0) * solUsdPrice).toFixed(2)}` : `${(walletInfo?.balance || 0).toFixed(2)} SOL`}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.addFundsButton} onPress={handleRefresh}>
                    <Ionicons name="refresh" size={20} color="#1A1F3A" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.bettingStats}>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>
                      {isLoadingWallet ? '...' : (bettingStats?.activeBets || 0)}
                    </Text>
                    <Text style={styles.betStatLabel}>Active Challenges</Text>
                  </View>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>
                      {isLoadingWallet ? '...' : solUsdPrice ? `$${((bettingStats?.atRisk || 0) * solUsdPrice).toFixed(0)}` : `${(bettingStats?.atRisk || 0).toFixed(2)} SOL`}
                    </Text>
                    <Text style={styles.betStatLabel}>At Risk</Text>
                  </View>
                  <View style={styles.bettingStat}>
                    <Text style={styles.betStatValue}>
                      {userBalance.toFixed(2)} SOL
                    </Text>
                    <Text style={styles.betStatLabel}>Balance</Text>
                  </View>
                </View>
              </View>

              <View style={styles.quickBets}>
                <Text style={styles.quickBetsTitle}>Quick Challenges</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBetScroll}>
                  {generateChallengeOptions().map((option) => (
                <TouchableOpacity 
                  key={option.id}
                  style={styles.quickBetCard}
                  onPress={() => {
                    // Open Create Challenge with sensible defaults
                    const id: string = option.id;
                    const mapIdToMetric = (oid: string): string => {
                      if (oid.startsWith('steps_')) return 'steps';
                      if (oid.startsWith('active_')) return 'active_minutes';
                      if (oid.startsWith('distance_')) return 'distance';
                      if (oid.startsWith('calories_')) return 'calories';
                      // Fallbacks for flights/stand
                      return 'steps';
                    };
                    setQuickChallengePrefill({
                      metrics: [mapIdToMetric(id)],
                      stake: option.stakeSOL,
                      duration: 24,
                    });
                    setShowCreateChallenge(true);
                  }}
                >
                  <Ionicons name={option.icon as any} size={24} color="#1A1F3A" />
                  <Text style={styles.quickBetText}>{option.title}</Text>
                  <Text style={styles.quickBetAmount}>${option.stakeUSD.toFixed(0)}</Text>
                  <Text style={styles.quickBetOdds}>{option.multiplier.toFixed(1)}x</Text>
                </TouchableOpacity>
              ))}
              </ScrollView>
            </View>
          </View>


            {/* Challenge Friends */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Friends</Text>
              <Text style={styles.sectionSubtitle}>Create custom challenges and invite friends</Text>
              
              <TouchableOpacity style={styles.createChallengeButton} onPress={() => setShowCreateChallenge(true)}>
                <View style={styles.createChallengeIcon}>
                  <Ionicons name="rocket" size={24} color="#fff" />
                </View>
                <View style={styles.createChallengeContent}>
                  <Text style={styles.createChallengeTitle}>Start a Steps Challenge</Text>
                  <Text style={styles.createChallengeDesc}>Set your target, invite friends, and compete!</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.challengeTypesList}>
                <TouchableOpacity style={styles.challengeTypeItem} onPress={() => setShowCreateChallenge(true)}>
                  <Ionicons name="footsteps" size={20} color={colors.primary} />
                  <Text style={styles.challengeTypeText}>Steps Challenge</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.challengeTypeItem} onPress={() => setShowCreateChallenge(true)}>
                  <Ionicons name="fitness" size={20} color="#FF6B6B" />
                  <Text style={styles.challengeTypeText}>Active Minutes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.challengeTypeItem} onPress={() => setShowCreateChallenge(true)}>
                  <Ionicons name="flame" size={20} color="#FF5722" />
                  <Text style={styles.challengeTypeText}>Calories</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.challengeTypeItem} onPress={() => setShowCreateChallenge(true)}>
                  <Ionicons name="trophy" size={20} color="#9C27B0" />
                  <Text style={styles.challengeTypeText}>Custom Goal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Your Wallet */}
            <View style={styles.challengeSection}>
              <Text style={styles.sectionTitle}>Your Wallet</Text>
              <Text style={styles.sectionSubtitle}>Ready for some challenges?</Text>
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
                <TouchableOpacity onPress={() => setShowCamera(true)}>
                  <StatCard 
                    icon="camera" 
                    label="Camera" 
                    value="📸" 
                    target="Tap" 
                    progress={1}
                    color="#9C27B0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekly Challenge Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Challenges</Text>
              <Text style={styles.sectionSubtitle}>Longer commitment challenges</Text>
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

      <CreateChallengeModal
        visible={showCreateChallenge}
        onClose={() => setShowCreateChallenge(false)}
        onChallengeCreated={() => {
          setShowCreateChallenge(false);
          Alert.alert('Success', 'Challenge created and invitations sent!');
        }}
        initialMetrics={quickChallengePrefill?.metrics}
        initialStake={quickChallengePrefill?.stake}
        initialDuration={quickChallengePrefill?.duration}
      />

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={(uri) => {
          console.log('Photo taken:', uri);
          // You can handle the photo here - save to gallery, upload, etc.
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
  logoImage: { width: 36, height: 36, marginRight: 12 },
  userSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userInfo: { flex: 1, marginLeft: 12 },
  welcomeText: { color: colors.textMuted, fontSize: 14 },
  usernameText: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 2 },
  balanceText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
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
  
  // Challenge Section Styles
  challengeSection: {
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
    backgroundColor: colors.neon,
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
    backgroundColor: colors.neon,
  },
  
  quickBetText: {
    color: '#1A1F3A',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  
  quickBetAmount: {
    color: '#1A1F3A',
    fontSize: 12,
    marginBottom: 4,
  },
  
  quickBetOdds: {
    color: '#1A1F3A',
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
  
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  
  stepIndicatorText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Challenge Styles
  challengesList: {
    gap: 12,
  },
  
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
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
    fontSize: 14,
  },
  
  challengeReward: {
    alignItems: 'flex-end',
  },
  
  rewardAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  rewardOdds: {
    color: colors.neon,
    fontSize: 12,
    fontWeight: '600',
  },

  // Create Challenge Styles
  createChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },

  createChallengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  createChallengeContent: {
    flex: 1,
  },

  createChallengeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  createChallengeDesc: {
    color: colors.textMuted,
    fontSize: 14,
  },

  challengeTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  challengeTypeItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  challengeTypeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
