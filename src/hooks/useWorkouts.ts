import { useState, useEffect, useMemo } from 'react';
import { Workout, AIOperation, SetBlock } from '../types/gym';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { DEFAULT_EXERCISES } from '../constants/exercises';

const genId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial load from LocalStorage
    const localW = storageService.getWorkouts();
    const localEx = storageService.getCustomExercises();
    setWorkouts(localW);
    setCustomExercises(localEx);

    let unsubW: (() => void) | null = null;
    let unsubEx: (() => void) | null = null;

    // 2. Subscribe to Firebase Auth state changes so Firestore sync updates dynamically
    const unsubAuth = firebaseService.onAuthChange(() => {
      if (unsubW) {
        unsubW();
        unsubW = null;
      }
      if (unsubEx) {
        unsubEx();
        unsubEx = null;
      }

      if (firebaseService.isReady()) {
        setIsFirebaseActive(true);
        unsubW = firebaseService.subscribeWorkouts(fsWorkouts => {
          setWorkouts(fsWorkouts);
          storageService.saveWorkouts(fsWorkouts); // sync local copy
        });

        unsubEx = firebaseService.subscribeCustomExercises(fsEx => {
          setCustomExercises(fsEx);
        });
      } else {
        setIsFirebaseActive(false);
      }
    });

    return () => {
      if (unsubW) unsubW();
      if (unsubEx) unsubEx();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const reloadFirebaseConfig = () => {
    const isOk = firebaseService.init();
    setIsFirebaseActive(isOk);
    if (isOk) {
      firebaseService.subscribeWorkouts(fsWorkouts => {
        setWorkouts(fsWorkouts);
        storageService.saveWorkouts(fsWorkouts);
      });
      firebaseService.subscribeCustomExercises(fsEx => {
        setCustomExercises(fsEx);
      });
    }
  };

  const allExercises = useMemo(() => {
    return Array.from(new Set([...DEFAULT_EXERCISES, ...customExercises])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [customExercises]);

  const addCustomExercise = (name: string) => {
    const updated = storageService.addCustomExercise(name);
    setCustomExercises(updated);
    if (firebaseService.isReady()) {
      firebaseService.addCustomExercise(name);
    }
  };

  const addWorkout = (workoutData: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: genId()
    };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    storageService.saveWorkouts(updated);

    if (firebaseService.isReady()) {
      firebaseService.addWorkout(newWorkout);
    }
  };

  const updateWorkout = (id: string, updatedFields: Partial<Workout>) => {
    const updated = workouts.map(w => (w.id === id ? { ...w, ...updatedFields } : w));
    setWorkouts(updated);
    storageService.saveWorkouts(updated);

    if (firebaseService.isReady()) {
      firebaseService.updateWorkout(id, updatedFields);
    }
  };

  const deleteWorkout = (id: string) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    storageService.saveWorkouts(updated);

    if (firebaseService.isReady()) {
      firebaseService.deleteWorkout(id);
    }
  };

  const handleAIOperations = (ops: AIOperation[]) => {
    let currentWorkouts = [...workouts];

    for (const op of ops) {
      if (op.type === 'CREATE' && op.data?.name) {
        let dt = new Date();
        if (op.data.date) {
          const pd = new Date(op.data.date + 'T12:00:00');
          if (!isNaN(pd.getTime())) dt = pd;
        }
        const dStr = dt.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const blocks: SetBlock[] = [];
        (op.data.blocks || []).forEach(b => {
          const numSets = b.sets || 1;
          for (let i = 0; i < numSets; i++) {
            blocks.push({
              sets: 1,
              reps: b.reps || 0,
              weight: b.weight || 0,
              unit: b.unit || 'kg'
            });
          }
        });

        const newWorkout: Workout = {
          id: genId(),
          exerciseName: op.data.name,
          date: dStr,
          timestamp: dt.getTime(),
          blocks
        };
        currentWorkouts = [newWorkout, ...currentWorkouts];
        if (firebaseService.isReady()) {
          firebaseService.addWorkout(newWorkout);
        }
      } else if (op.type === 'UPDATE' && op.id && op.data) {
        let dt = new Date();
        if (op.data.date) {
          const pd = new Date(op.data.date + 'T12:00:00');
          if (!isNaN(pd.getTime())) dt = pd;
        }
        const dStr = dt.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const blocks: SetBlock[] = [];
        (op.data.blocks || []).forEach(b => {
          const numSets = b.sets || 1;
          for (let i = 0; i < numSets; i++) {
            blocks.push({
              sets: 1,
              reps: b.reps || 0,
              weight: b.weight || 0,
              unit: b.unit || 'kg'
            });
          }
        });

        const patch = {
          exerciseName: op.data?.name || '',
          date: dStr,
          timestamp: dt.getTime(),
          blocks
        };

        currentWorkouts = currentWorkouts.map(w =>
          w.id === op.id ? { ...w, ...patch } : w
        );

        if (firebaseService.isReady()) {
          firebaseService.updateWorkout(op.id, patch);
        }
      } else if (op.type === 'DELETE' && op.id) {
        currentWorkouts = currentWorkouts.filter(w => w.id !== op.id);
        if (firebaseService.isReady()) {
          firebaseService.deleteWorkout(op.id);
        }
      }
    }

    setWorkouts(currentWorkouts);
    storageService.saveWorkouts(currentWorkouts);
  };

  return {
    workouts,
    allExercises,
    isFirebaseActive,
    reloadFirebaseConfig,
    addCustomExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    handleAIOperations
  };
}
