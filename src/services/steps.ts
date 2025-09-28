import { api } from './apiClient';
import { AuthService } from './auth';

export type StepPayload = {
  date: string; // YYYY-MM-DD
  steps: number;
  source: 'apple_health' | 'pedometer' | 'manual';
};

export async function logSteps(steps: number, source: StepPayload['source']) {
  const token = await AuthService.getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  const today = new Date();
  const date = today.toISOString().slice(0, 10);
  const payload: StepPayload = { date, steps, source };
  
  await api.post('/steps', payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}
