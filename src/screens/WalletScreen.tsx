import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(120);
  const [wins, setWins] = useState(4);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
        <Text style={styles.header}>Wallet</Text>
        <View style={styles.cardLarge}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceVal}>{balance} coins</Text>
          <Text style={styles.balanceSub}>Wins: {wins}</Text>
        </View>

        <TouchableOpacity style={styles.action} onPress={() => setBalance((b) => b + 10)}>
          <Ionicons name="add-circle-outline" color="#fff" size={20} />
          <Text style={styles.actionText}>Add 10 coins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.action, { backgroundColor: colors.success }]} onPress={() => setBalance((b) => Math.max(0, b - 20))}>
          <Ionicons name="cash-outline" color="#021" size={20} />
          <Text style={[styles.actionText, { color: '#021' }]}>Withdraw 20</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  cardLarge: {
    backgroundColor: '#12143A', padding: 18, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 14,
  },
  balanceLabel: { color: colors.textMuted },
  balanceVal: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 6 },
  balanceSub: { color: colors.textMuted, marginTop: 4 },
  action: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  actionText: { color: '#fff', fontWeight: '700' },
});
