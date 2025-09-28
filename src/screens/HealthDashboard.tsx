import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../hooks/useHealthData';
import { HealthMetricsService, AIHealthScore, HealthMetrics, HealthTrend } from '../services/healthMetrics';

const { width } = Dimensions.get('window');

interface HealthCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  target?: number;
  progress?: number;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, value, unit, icon, color, target, progress }) => (
  <View style={[styles.healthCard, { borderLeftColor: color }]}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardUnit}>{unit}</Text>
    </View>
    {target && progress !== undefined && (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% of {target}</Text>
      </View>
    )}
  </View>
);

interface ScoreBreakdownProps {
  breakdown: AIHealthScore['breakdown'];
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => (
  <View style={styles.breakdownContainer}>
    <Text style={styles.breakdownTitle}>Score Breakdown</Text>
    {Object.entries(breakdown).map(([key, value]) => (
      <View key={key} style={styles.breakdownItem}>
        <Text style={styles.breakdownLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
        <View style={styles.breakdownBar}>
          <View style={[styles.breakdownFill, { width: `${value}%` }]} />
        </View>
        <Text style={styles.breakdownValue}>{value}</Text>
      </View>
    ))}
  </View>
);

export default function HealthDashboard() {
  const { healthData, isLoading: healthLoading, refreshHealthData } = useHealthData();
  const [aiScore, setAiScore] = useState<AIHealthScore | null>(null);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAIScore = async () => {
    try {
      setIsLoadingAI(true);
      const score = await HealthMetricsService.requestAIHealthScore();
      setAiScore(score);
    } catch (error) {
      console.error('Failed to load AI score:', error);
      Alert.alert('Error', 'Failed to load AI health analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const loadTrends = async () => {
    try {
      const trendsData = await HealthMetricsService.getHealthTrends();
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const submitTodaysMetrics = async () => {
    if (!healthData) {
      Alert.alert('No Data', 'Please sync your health data first');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const metrics: HealthMetrics = {
        steps: healthData.steps || 0,
        activeMinutes: healthData.activeTime || 0,
        sleepHours: healthData.sleepHours || 0,
        heartRate: healthData.heartRate || 0,
        caloriesBurned: healthData.caloriesBurned || 0,
        date: today,
        source: 'healthkit'
      };

      await HealthMetricsService.submitDailyMetrics(metrics);
      Alert.alert('Success', 'Health metrics submitted successfully!');
      
      // Refresh AI score after submitting metrics
      await loadAIScore();
    } catch (error) {
      console.error('Failed to submit metrics:', error);
      Alert.alert('Error', 'Failed to submit health metrics');
    }
  };

  const completeDayAnalysis = async () => {
    try {
      setIsLoadingAI(true);
      const analysis = await HealthMetricsService.markDayComplete();
      setAiScore(analysis);
      
      if (analysis.dayEndSummary) {
        Alert.alert(
          'Day Complete! 🎉',
          analysis.dayEndSummary,
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Failed to complete day:', error);
      Alert.alert('Error', 'Failed to complete day analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshHealthData(),
      loadAIScore(),
      loadTrends()
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadAIScore();
    loadTrends();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* AI Health Score Card */}
      {aiScore && (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.aiScoreCard}
        >
          <View style={styles.aiScoreHeader}>
            <Text style={styles.aiScoreTitle}>AI Health Score</Text>
            <Text style={[styles.aiScoreValue, { color: getScoreColor(aiScore.overallScore) }]}>
              {aiScore.overallScore}
            </Text>
          </View>
          <ScoreBreakdown breakdown={aiScore.breakdown} />
        </LinearGradient>
      )}

      {/* Health Metrics Cards */}
      <View style={styles.metricsGrid}>
        <HealthCard
          title="Steps"
          value={healthData?.steps?.toLocaleString() || '0'}
          unit="steps"
          icon="walk"
          color="#4CAF50"
          target={10000}
          progress={((healthData?.steps || 0) / 10000) * 100}
        />
        <HealthCard
          title="Active Time"
          value={healthData?.activeTime || 0}
          unit="minutes"
          icon="fitness"
          color="#FF9800"
          target={30}
          progress={((healthData?.activeTime || 0) / 30) * 100}
        />
        <HealthCard
          title="Sleep"
          value={healthData?.sleepHours?.toFixed(1) || '0.0'}
          unit="hours"
          icon="bed"
          color="#9C27B0"
          target={8}
          progress={((healthData?.sleepHours || 0) / 8) * 100}
        />
        <HealthCard
          title="Heart Rate"
          value={healthData?.heartRate || 0}
          unit="bpm"
          icon="heart"
          color="#F44336"
        />
        <HealthCard
          title="Calories"
          value={healthData?.caloriesBurned?.toLocaleString() || '0'}
          unit="cal"
          icon="flame"
          color="#FF5722"
        />
      </View>

      {/* Trends Section */}
      {trends.length > 0 && (
        <View style={styles.trendsContainer}>
          <Text style={styles.sectionTitle}>Weekly Trends</Text>
          {trends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendLeft}>
                <Ionicons
                  name={getTrendIcon(trend.trend)}
                  size={20}
                  color={getTrendColor(trend.trend)}
                />
                <Text style={styles.trendMetric}>{trend.metric}</Text>
              </View>
              <View style={styles.trendRight}>
                <Text style={[styles.trendChange, { color: getTrendColor(trend.trend) }]}>
                  {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                </Text>
                <Text style={styles.trendAverage}>{trend.weeklyAverage}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* AI Insights */}
      {aiScore && (
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {aiScore.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons name="bulb" size={16} color="#FFC107" />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {aiScore && aiScore.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {aiScore.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={submitTodaysMetrics}
          disabled={healthLoading}
        >
          {healthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.buttonText}>Submit Today's Metrics</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={completeDayAnalysis}
          disabled={isLoadingAI}
        >
          {isLoadingAI ? (
            <ActivityIndicator color="#667eea" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#667eea" />
              <Text style={[styles.buttonText, { color: '#667eea' }]}>Complete Day</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  aiScoreCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aiScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiScoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  breakdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  breakdownBar: {
    flex: 2,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  breakdownValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
  },
  metricsGrid: {
    padding: 16,
    gap: 12,
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  trendsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendMetric: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  trendRight: {
    alignItems: 'flex-end',
  },
  trendChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendAverage: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  recommendationsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
