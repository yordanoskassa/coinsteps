import Constants from 'expo-constants';

const manifestExtra = (Constants.expoConfig as any)?.extra || {};

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  manifestExtra.EXPO_PUBLIC_API_URL ||
  'https://4d26bbfe273c.ngrok-free.app';
