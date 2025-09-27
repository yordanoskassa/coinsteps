import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const data = [
  { id: '1', name: 'You', steps: 9231 },
  { id: '2', name: 'Ava', steps: 12045 },
  { id: '3', name: 'Liam', steps: 10400 },
  { id: '4', name: 'Maya', steps: 8120 },
  { id: '5', name: 'Noah', steps: 7560 },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
        <Text style={styles.header}>Leaderboard</Text>
        <FlatList
          data={[...data].sort((a,b)=>b.steps-a.steps)}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={[styles.rank, index < 3 && { color: colors.accent }]}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.steps}>{item.steps.toLocaleString()} steps</Text>
              </View>
              <Text style={styles.badge}>{Math.round(item.steps / 1000)}k</Text>
            </View>
          )}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111335', padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10,
  },
  rank: { width: 28, textAlign: 'center', color: colors.textMuted, fontWeight: '700' },
  name: { color: colors.text, fontWeight: '700' },
  steps: { color: colors.textMuted, marginTop: 2 },
  badge: {
    color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    overflow: 'hidden', fontWeight: '700'
  }
});
