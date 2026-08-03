import { Workout } from '../types/gym';
import { DEFAULT_EXERCISES } from '../constants/exercises';

const STORAGE_KEYS = {
  WORKOUTS: 'iron_tracker_workouts',
  CUSTOM_EXERCISES: 'iron_tracker_custom_exercises',
  GEMINI_KEY: 'iron_tracker_gemini_key',
};

// Initial seed data so the user has immediate visual feedback & charts
const INITIAL_WORKOUTS: Workout[] = [
  {
    id: 'seed-1',
    exerciseName: 'Press de Banca',
    date: '28 jul. 2026',
    timestamp: Date.now() - 5 * 86400000,
    blocks: [
      { sets: 1, reps: 10, weight: 60, unit: 'kg' },
      { sets: 1, reps: 8, weight: 70, unit: 'kg' },
      { sets: 1, reps: 6, weight: 80, unit: 'kg' }
    ]
  },
  {
    id: 'seed-2',
    exerciseName: 'Sentadilla Libre',
    date: '29 jul. 2026',
    timestamp: Date.now() - 4 * 86400000,
    blocks: [
      { sets: 1, reps: 10, weight: 80, unit: 'kg' },
      { sets: 1, reps: 8, weight: 100, unit: 'kg' },
      { sets: 1, reps: 5, weight: 110, unit: 'kg' }
    ]
  },
  {
    id: 'seed-3',
    exerciseName: 'Press de Banca',
    date: '01 ago. 2026',
    timestamp: Date.now() - 1 * 86400000,
    blocks: [
      { sets: 1, reps: 10, weight: 65, unit: 'kg' },
      { sets: 1, reps: 8, weight: 75, unit: 'kg' },
      { sets: 1, reps: 5, weight: 85, unit: 'kg' }
    ]
  }
];

export const storageService = {
  getWorkouts(): Workout[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(INITIAL_WORKOUTS));
        return INITIAL_WORKOUTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_WORKOUTS;
    }
  },

  saveWorkouts(workouts: Workout[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  getCustomExercises(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addCustomExercise(name: string): string[] {
    const current = this.getCustomExercises();
    const cleanName = name.trim();
    if (cleanName && !current.includes(cleanName) && !DEFAULT_EXERCISES.includes(cleanName)) {
      const updated = [...current, cleanName];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
      return updated;
    }
    return current;
  },

  getGeminiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
  },

  setGeminiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
  }
};
