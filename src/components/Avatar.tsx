import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';

interface AvatarProps {
  seed: string;
  size?: number;
}

export default function Avatar({ seed, size = 48 }: AvatarProps) {
  const avatar = useMemo(() => {
    return createAvatar(lorelei, {
      seed,
      size,
      backgroundColor: ['transparent'],
    }).toString();
  }, [seed, size]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <SvgXml xml={avatar} width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
