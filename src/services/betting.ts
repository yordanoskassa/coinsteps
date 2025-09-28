import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BetData {
  betType: string;
  target: number;
  unit: string;
  stakeAmount: number;
  durationHours: number;
  multiplier: number;
  difficulty: string;
  description: string;
}

export interface BetResponse {
  success: boolean;
  betId: string;
  transactionSignature?: string;
  error?: string;
}

export interface UserBet {
  betId: string;
  betType: string;
  target: number;
  unit: string;
  stakeAmount: number;
  potentialWin: number;
  status: 'active' | 'completed' | 'failed' | 'pending';
  createdAt: string;
  expiresAt: string;
  currentProgress?: number;
  description: string;
}

export interface WalletInfo {
  public_key: string;
  balance: number;
}

export interface BettingStats {
  activeBets: number;
  atRisk: number;
  winStreak: number;
  totalWinnings: number;
}

export class BettingService {
  static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  static async placeBet(betData: BetData): Promise<BetResponse> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bets/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(betData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to place bet');
    }

    return await response.json();
  }

  static async getUserBets(): Promise<UserBet[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bets/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch bets');
    }

    return await response.json();
  }

  static async submitHealthData(betId: string, healthData: any): Promise<{ success: boolean }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bets/${betId}/submit-health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(healthData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit health data');
    }

    return await response.json();
  }

  static async getBetStatus(betId: string): Promise<UserBet> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bets/${betId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch bet status');
    }

    return await response.json();
  }

  static async getWalletInfo(): Promise<WalletInfo> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/wallet/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch wallet info');
    }

    return await response.json();
  }

  static async getBettingStats(): Promise<BettingStats> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const bets = await this.getUserBets();
      
      // Calculate stats from user bets
      const activeBets = bets.filter(bet => bet.status === 'active').length;
      const atRisk = bets
        .filter(bet => bet.status === 'active')
        .reduce((sum, bet) => sum + bet.stakeAmount, 0);
      
      // Calculate win streak (consecutive completed bets)
      let winStreak = 0;
      const sortedBets = bets
        .filter(bet => bet.status === 'completed' || bet.status === 'failed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      for (const bet of sortedBets) {
        if (bet.status === 'completed') {
          winStreak++;
        } else {
          break;
        }
      }

      // Calculate total winnings
      const totalWinnings = bets
        .filter(bet => bet.status === 'completed')
        .reduce((sum, bet) => sum + (bet.potentialWin - bet.stakeAmount), 0);

      return {
        activeBets,
        atRisk,
        winStreak,
        totalWinnings
      };
    } catch (error) {
      // Return default stats if there's an error
      return {
        activeBets: 0,
        atRisk: 0,
        winStreak: 0,
        totalWinnings: 0
      };
    }
  }
}
