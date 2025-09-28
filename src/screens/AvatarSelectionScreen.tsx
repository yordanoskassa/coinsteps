import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Avatar from '../components/Avatar';

interface AvatarSelectionScreenProps {
  onAvatarSelected: (seed: string) => void;
  onSkip?: () => void;
}

const AVATAR_SEEDS = [
  'adventurous-fox', 'brave-lion', 'clever-owl', 'daring-eagle',
  'energetic-tiger', 'friendly-bear', 'graceful-swan', 'happy-dolphin',
  'intelligent-raven', 'joyful-panda', 'kind-elephant', 'loyal-wolf',
  'mighty-rhino', 'noble-horse', 'optimistic-monkey', 'peaceful-dove',
  'quick-cheetah', 'radiant-phoenix', 'strong-gorilla', 'wise-turtle',
  'zealous-falcon', 'amazing-shark', 'brilliant-parrot', 'cosmic-whale'
];

export default function AvatarSelectionScreen({ onAvatarSelected, onSkip }: AvatarSelectionScreenProps) {
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedSeed) {
      onAvatarSelected(selectedSeed);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Avatar</Text>
        <Text style={styles.subtitle}>Pick an avatar that represents you in challenges</Text>
      </View>

      <ScrollView contentContainerStyle={styles.avatarGrid} showsVerticalScrollIndicator={false}>
        {AVATAR_SEEDS.map((seed) => (
          <TouchableOpacity
            key={seed}
            style={[
              styles.avatarOption,
              selectedSeed === seed && styles.selectedAvatar
            ]}
            onPress={() => setSelectedSeed(seed)}
          >
            <Avatar seed={seed} size={64} />
            {selectedSeed === seed && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, !selectedSeed && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!selectedSeed}
        >
          <Text style={[styles.buttonText, !selectedSeed && styles.disabledText]}>
            Continue
          </Text>
        </TouchableOpacity>
        
        {onSkip && (
          <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={onSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 32,
    gap: 16,
  },
  
  avatarOption: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  
  selectedAvatar: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  footer: {
    paddingBottom: 32,
    gap: 12,
  },
  
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  confirmButton: {
    backgroundColor: colors.primary,
  },
  
  disabledButton: {
    backgroundColor: colors.textMuted + '40',
  },
  
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textMuted + '40',
  },
  
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  disabledText: {
    color: colors.textMuted,
  },
  
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
