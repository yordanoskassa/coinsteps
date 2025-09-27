import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import GradientBackground from '../components/GradientBackground';
import { addChallenge, Challenge, getChallenges } from '../store/challenges';
import { Ionicons } from '@expo/vector-icons';

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('Daily Duel');
  const [stake, setStake] = useState('10');
  const [goal, setGoal] = useState('8000');
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const load = async () => setChallenges(await getChallenges());
  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    const item: Challenge = {
      id: Math.random().toString(36).slice(2),
      title,
      stake: Number(stake || '0'),
      goal: Number(goal || '0'),
      participants: [
        { id: 'me', name: 'You', steps: 0 },
        { id: 'p2', name: 'Rival', steps: 0 },
      ],
      date: new Date().toISOString().slice(0, 10),
      status: 'active',
    };
    await addChallenge(item);
    setTitle('Daily Duel');
    await load();
  };

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
        <Text style={styles.header}>Challenges</Text>

        <View style={styles.formRow}>
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="10k Steps Showdown" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input label="Stake" value={stake} onChangeText={setStake} keyboardType="numeric" placeholder="10" style={{ flex: 1 }} />
            <Input label="Goal" value={goal} onChangeText={setGoal} keyboardType="numeric" placeholder="10000" style={{ flex: 1 }} />
          </View>
          <TouchableOpacity style={styles.button} onPress={onCreate}>
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.buttonText}>Create Challenge</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={challenges}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>Goal {item.goal.toLocaleString()} steps • Stake {item.stake} coins</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.participants}>{item.participants.map(p => p.name).join(' vs ')}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>No challenges yet. Create your first!</Text>}
        />
      </View>
    </GradientBackground>
  );
}

function Input({ label, style, ...props }: any) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  formRow: { gap: 12, marginBottom: 12 },
  label: { color: colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: '#0F1130',
    color: colors.text,
    borderRadius: 12,
    padding: 12,
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#111335',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginTop: 12,
  },
  cardTitle: { color: colors.text, fontWeight: '700' },
  cardSub: { color: colors.textMuted, marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  participants: { color: colors.text },
});
