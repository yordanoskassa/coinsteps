import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pedometer } from 'expo-sensors';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import GradientBackground from '../components/GradientBackground';
import StepRing from '../components/StepRing';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MiniAreaChart from '../components/MiniAreaChart';

const GOAL = 10000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [steps, setSteps] = useState(0);
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let sub: any;
    Pedometer.isAvailableAsync().then(() => {
      Pedometer.requestPermissionsAsync().then(({ status }) => {
        const granted = status === 'granted' || status === 'undetermined';
        setPermission(granted);
        if (granted) {
          // Subscribe to live steps since start of day
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          Pedometer.getStepCountAsync(start, now).then((res) => setSteps(res.steps || 0));
          sub = Pedometer.watchStepCount((data) => {
            setSteps((prev) => Math.max(prev, data.steps));
          });
        }
      });
    });
    return () => sub && sub.remove && sub.remove();
  }, []);

  const chartData = useMemo(() => {
    // mock hourly distribution with 24 points
    const hours = Array.from({ length: 24 }, (_, i) => i);
    let total = 0;
    return hours.map((h) => {
      const mult = h > 6 && h < 22 ? (h < 9 || h > 18 ? 0.8 : 1.4) : 0.25;
      total += Math.round(Math.max(0, Math.sin((h / 24) * Math.PI) * 400 * mult));
      return { x: h, y: total };
    });
  }, []);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
        <View style={styles.headerRow}>
          <Ionicons name="menu-outline" size={28} color={colors.text} />
          <Text style={styles.headerTitle}>Home</Text>
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
        </View>

        <View style={styles.ringWrap}>
          <StepRing steps={steps} goal={GOAL} />
          <View style={styles.metricsRow}>
            <Metric label="Kcal" value={Math.round(steps * 0.04).toString()} />
            <Metric label="Miles" value={(steps * 0.0005).toFixed(1)} />
          </View>
        </View>

        <BlurView intensity={40} tint="dark" style={styles.card}>
          <Text style={styles.cardTitle}>Today</Text>
          <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
            <MiniAreaChart data={chartData} width={320} height={180} />
          </View>
        </BlurView>

        {permission === false && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionText}>Enable Motion & Fitness to track your steps.</Text>
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <LinearGradient colors={["#1A1C3C", "#0F1130"]} style={styles.metricBox}>
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  ringWrap: { alignItems: 'center', marginTop: 12 },
  metricsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  metricBox: {
    width: 120,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  metricVal: { color: colors.text, fontSize: 18, fontWeight: '700' },
  metricLabel: { color: colors.textMuted, marginTop: 4 },
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: 20,
  },
  cardTitle: { color: colors.text, fontWeight: '700', padding: 16 },
  permissionBanner: {
    backgroundColor: '#341A1A',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  permissionText: { color: '#FFB4B4', textAlign: 'center' },
});
