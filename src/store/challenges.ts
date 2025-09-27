import AsyncStorage from '@react-native-async-storage/async-storage';

export type Challenge = {
  id: string;
  title: string;
  stake: number; // coins
  goal: number; // steps
  participants: { id: string; name: string; steps: number }[];
  date: string; // ISO day
  status: 'active' | 'completed';
};

const KEY = 'stepbet:challenges';

export async function getChallenges(): Promise<Challenge[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('getChallenges', e);
    return [];
  }
}

export async function saveChallenges(items: Challenge[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('saveChallenges', e);
  }
}

export async function addChallenge(item: Challenge) {
  const list = await getChallenges();
  list.unshift(item);
  await saveChallenges(list);
}
