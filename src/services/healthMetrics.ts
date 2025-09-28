import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthMetrics {
  steps: number;
  activeMinutes: number;
  sleepHours: number;
  heartRate: number;
  caloriesBurned: number;
  date: string;
  source: string;
}

export interface AIHealthScore {
  overallScore: number; // 0-100
  breakdown: {
    cardiovascular: number;
    activity: number;
    recovery: number;
    consistency: number;
    improvement: number;
  };
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  achievements: string[];
  dayEndSummary?: string;
}

export interface HealthTrend {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
  weeklyAverage: number;
}

export class HealthMetricsService {
  static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  static async submitDailyMetrics(metrics: HealthMetrics): Promise<{ success: boolean }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/health/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(metrics),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit health metrics');
    }

    return await response.json();
  }

  static async getHealthHistory(days: number = 30): Promise<HealthMetrics[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/health/history?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch health history');
    }

    return await response.json();
  }

  static async requestAIHealthScore(): Promise<AIHealthScore> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/health/ai-score`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get AI health score');
    }

    return await response.json();
  }

  static async markDayComplete(): Promise<AIHealthScore> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/health/day-complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to complete day analysis');
    }

    return await response.json();
  }

  static async getHealthTrends(): Promise<HealthTrend[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/health/trends`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch health trends');
    }

    return await response.json();
  }
}
