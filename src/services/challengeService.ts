import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
  avatar_seed?: string;
}

export interface ChallengeInvite {
  challengeId: string;
  challengeType: 'steps' | 'active_minutes' | 'calories' | 'custom';
  targetValue: number;
  duration: number; // hours
  stakeAmount: number; // SOL
  createdBy: string;
  invitedFriends: Friend[];
  message?: string;
  deadline: string;
}

export interface Challenge {
  id: string;
  type: string;
  target: number;
  duration: number;
  stakeAmount: number;
  participants: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  winner?: string;
  metrics: string[];
  stake: number;
  dailyCompletions?: { [key: string]: boolean };
  progress?: { [username: string]: number };
}

export class ChallengeService {
  static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  static async getFriendsList(): Promise<Friend[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Load real friends like Friends screen does
    const response = await fetch(`${API_BASE_URL}/friends`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch friends list');
    }

    const friendsData = await response.json();

    // Shape to Friend[]
    const friends: Friend[] = (friendsData || []).map((f: any) => ({
      id: f.username,
      name: f.full_name || f.username,
      email: f.email, // may be undefined depending on backend payload
      username: f.username,
      avatar_seed: f.avatar_seed,
    }));

    return friends;
  }

  static async addFriend(email: string, name?: string): Promise<Friend> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/friends/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add friend');
    }

    return await response.json();
  }

  static async createChallenge(challengeData: {
    metrics: string[];
    duration: number;
    stake: number;
    friends: string[];
    message?: string;
  }): Promise<Challenge> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(challengeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create challenge');
    }

    return await response.json();
  }

  static async sendChallengeInvites(challengeId: string, friends: Friend[], message?: string): Promise<{ success: boolean; sentCount: number }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ friends, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send invites');
    }

    return await response.json();
  }

  static async getUserChallenges(): Promise<Challenge[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user challenges');
    }

    return await response.json();
  }

  static async getUserBalance(): Promise<number> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user info');
    }

    const user = await response.json();
    return user.sol_balance || 0;
  }

  static async acceptChallenge(challengeId: string): Promise<{ success: boolean; status: string }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to accept challenge');
    }

    return await response.json();
  }

  static async joinChallenge(challengeId: string): Promise<{ success: boolean }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to join challenge');
    }

    return await response.json();
  }

  static async markDailyCompletion(challengeId: string, metrics: string[]): Promise<{ success: boolean }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/complete-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ metrics }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark daily completion');
    }

    return await response.json();
  }

  static async startChallenge(challengeId: string): Promise<{ success: boolean; notifications_sent?: number }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start challenge');
    }

    return await response.json();
  }

  static async endChallengeEarly(challengeId: string, reason?: string): Promise<{ success: boolean; refunded_amount?: number }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/end-early`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ reason: reason || 'User requested early termination' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to end challenge');
    }

    return await response.json();
  }

  static async checkChallengeProgress(challengeId: string): Promise<{ success: boolean; notifications_sent?: number }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/check-progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to check progress');
    }

    return await response.json();
  }

  static async getOpenChallenges(): Promise<Challenge[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/challenges/open`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch open challenges');
    }

    return await response.json();
  }
}
