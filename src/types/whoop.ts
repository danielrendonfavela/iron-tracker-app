export interface WhoopRecoveryData {
  recoveryScore: number; // 0 to 100%
  restingHeartRate: number; // bpm
  hrv: number; // ms
  skinTempCelsius?: number;
  spo2Percentage?: number;
  state: 'RED' | 'YELLOW' | 'GREEN';
}

export interface WhoopStrainData {
  strainScore: number; // 0 to 21
  activeCalories: number;
  avgHeartRate: number;
  maxHeartRate: number;
}

export interface WhoopSleepData {
  sleepQualityPercentage: number;
  hoursSlept: number;
  remSleepDurationMinutes: number;
  deepSleepDurationMinutes: number;
}

export interface WhoopSummary {
  date: string;
  recovery: WhoopRecoveryData;
  strain: WhoopStrainData;
  sleep: WhoopSleepData;
}
