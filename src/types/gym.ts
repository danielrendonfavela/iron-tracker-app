export type UnitType = 'kg' | 'lb';

export interface SetBlock {
  id?: string;
  sets?: number;
  reps: number | string;
  weight: number | string;
  unit: UnitType;
}

export interface Workout {
  id: string;
  exerciseName: string;
  date: string;
  timestamp: number;
  blocks: SetBlock[];
}

export interface SessionExercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: number | string;
    weight: number | string;
    unit: UnitType;
  }[];
}

export type TabType = 'session' | 'coach' | 'charts' | 'history' | 'tools';

export interface AIOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  id?: string;
  data?: {
    name?: string;
    date?: string;
    blocks?: {
      sets?: number;
      reps?: number;
      weight?: number;
      unit?: UnitType;
    }[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
