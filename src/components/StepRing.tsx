import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  size?: number;
  steps: number;
  goal: number;
}

export default function StepRing({ size = 240, steps, goal }: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(steps / goal, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.ringGradient[0]} />
            <Stop offset="60%" stopColor={colors.ringGradient[1]} />
            <Stop offset="100%" stopColor={colors.ringGradient[2]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2B2E57"
          strokeWidth={stroke}
          opacity={0.35}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
        <Text style={styles.sub}>Steps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    marginTop: 4,
    color: colors.textMuted,
  },
});
