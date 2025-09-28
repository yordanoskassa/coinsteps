import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stepbet:device_id';

function randomId() {
  // lightweight UUID v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing) return existing;
    const id = randomId();
    await AsyncStorage.setItem(KEY, id);
    return id;
  } catch {
    return randomId();
  }
}
