import { WhoopSummary, WhoopRecoveryData, WhoopStrainData, WhoopSleepData } from '../types/whoop';

const WHOOP_STORAGE_KEY = 'iron_tracker_whoop_data';
const WHOOP_CLIENT_ID_KEY = 'iron_tracker_whoop_client_id';

// Default / Sample Whoop Summary for immediate testing
const MOCK_WHOOP_SUMMARY: WhoopSummary = {
  date: new Date().toISOString().split('T')[0],
  recovery: {
    recoveryScore: 84,
    restingHeartRate: 52,
    hrv: 78,
    skinTempCelsius: 36.4,
    spo2Percentage: 98.5,
    state: 'GREEN'
  },
  strain: {
    strainScore: 14.2,
    activeCalories: 650,
    avgHeartRate: 135,
    maxHeartRate: 172
  },
  sleep: {
    sleepQualityPercentage: 91,
    hoursSlept: 7.8,
    remSleepDurationMinutes: 110,
    deepSleepDurationMinutes: 95
  }
};

export const whoopService = {
  getStoredWhoopData(): WhoopSummary {
    try {
      const stored = localStorage.getItem(WHOOP_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored Whoop data:', e);
    }
    return MOCK_WHOOP_SUMMARY;
  },

  saveWhoopData(data: WhoopSummary): void {
    localStorage.setItem(WHOOP_STORAGE_KEY, JSON.stringify(data));
  },

  setWhoopState(state: 'GREEN' | 'YELLOW' | 'RED'): WhoopSummary {
    const current = this.getStoredWhoopData();
    let score = 84;
    if (state === 'YELLOW') score = 55;
    if (state === 'RED') score = 28;

    const updated: WhoopSummary = {
      ...current,
      recovery: {
        ...current.recovery,
        recoveryScore: score,
        state
      }
    };
    this.saveWhoopData(updated);
    return updated;
  },

  getWhoopClientId(): string {
    return localStorage.getItem(WHOOP_CLIENT_ID_KEY) || '';
  },

  setWhoopClientId(id: string): void {
    localStorage.setItem(WHOOP_CLIENT_ID_KEY, id.trim());
  },

  // Generate official Whoop OAuth Authorization URL
  getOAuthUrl(redirectUri: string): string {
    const clientId = this.getWhoopClientId();
    if (!clientId) return '';

    const scopes = encodeURIComponent(
      'offline read:recovery read:cycles read:workout read:sleep read:profile'
    );
    return `https://api.prod.whoop.com/oauth/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&state=iron_tracker`;
  }
};
