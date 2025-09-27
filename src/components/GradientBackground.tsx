import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#080A1A", "#0E1030", "#0A0B1A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(124,92,255,0.25)", "transparent"]}
        style={[styles.glow, { top: -80, right: -60 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["rgba(0,209,255,0.25)", "transparent"]}
        style={[styles.glow, { bottom: -120, left: -80 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.9,
  },
});
