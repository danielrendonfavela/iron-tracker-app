import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseEnvConfigured } from '../config/firebase';
import { Workout } from '../types/gym';

export interface FirebaseStatus {
  isConfigured: boolean;
  user: User | null;
  error: string | null;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private user: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.init();
  }

  public init(): boolean {
    if (!isFirebaseEnvConfigured()) {
      return false;
    }

    try {
      if (!getApps().length) {
        this.app = initializeApp(firebaseConfig);
      } else {
        this.app = getApps()[0];
      }

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      onAuthStateChanged(this.auth, u => {
        this.user = u;
        this.authListeners.forEach(listener => listener(u));
      });

      // Auto sign in anonymously if not authenticated
      if (!this.auth.currentUser) {
        signInAnonymously(this.auth).catch(() => {});
      }

      return true;
    } catch (e: any) {
      console.error('Error initializing Firebase:', e);
      return false;
    }
  }

  public isReady(): boolean {
    return !!this.db && !!this.user;
  }

  public getCurrentUser(): User | null {
    return this.user;
  }

  public onAuthChange(callback: (user: User | null) => void): Unsubscribe {
    this.authListeners.push(callback);
    callback(this.user);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  // Authentication Methods
  public async registerWithEmail(email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> {
    if (!this.auth) return { success: false, error: 'Firebase no configurado' };
    try {
      const res = await createUserWithEmailAndPassword(this.auth, email, pass);
      if (res.user && name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar usuario' };
    }
  }

  public async loginWithEmail(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    if (!this.auth) return { success: false, error: 'Firebase no configurado' };
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Credenciales incorrectas' };
    }
  }

  public async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (!this.auth) return { success: false, error: 'Firebase no configurado' };
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión con Google' };
    }
  }

  public async logout(): Promise<void> {
    if (!this.auth) return;
    await firebaseSignOut(this.auth);
    await signInAnonymously(this.auth).catch(() => {});
  }

  // Firestore Subscriptions per User
  public subscribeWorkouts(
    onSuccess: (workouts: Workout[]) => void,
    onError?: (err: any) => void
  ): Unsubscribe | null {
    if (!this.db || !this.user) return null;

    const colRef = collection(this.db, 'users', this.user.uid, 'workouts');
    return onSnapshot(
      colRef,
      snapshot => {
        const list: Workout[] = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Workout, 'id'>)
        }));
        list.sort((a, b) => b.timestamp - a.timestamp);
        onSuccess(list);
      },
      err => {
        console.error('Firestore workouts error:', err);
        if (onError) onError(err);
      }
    );
  }

  public subscribeCustomExercises(onSuccess: (exercises: string[]) => void): Unsubscribe | null {
    if (!this.db || !this.user) return null;

    const colRef = collection(this.db, 'users', this.user.uid, 'exercises');
    return onSnapshot(colRef, snapshot => {
      const names = snapshot.docs.map(d => d.data().name as string);
      onSuccess(names);
    });
  }

  public async addWorkout(workout: Workout): Promise<boolean> {
    if (!this.db || !this.user) return false;
    try {
      const docRef = doc(this.db, 'users', this.user.uid, 'workouts', workout.id);
      await setDoc(docRef, {
        exerciseName: workout.exerciseName,
        date: workout.date,
        timestamp: workout.timestamp,
        blocks: workout.blocks
      });
      return true;
    } catch (e) {
      console.error('Error saving workout:', e);
      return false;
    }
  }

  public async updateWorkout(id: string, updatedFields: Partial<Workout>): Promise<boolean> {
    if (!this.db || !this.user) return false;
    try {
      const docRef = doc(this.db, 'users', this.user.uid, 'workouts', id);
      await updateDoc(docRef, updatedFields);
      return true;
    } catch (e) {
      console.error('Error updating workout:', e);
      return false;
    }
  }

  public async deleteWorkout(id: string): Promise<boolean> {
    if (!this.db || !this.user) return false;
    try {
      const docRef = doc(this.db, 'users', this.user.uid, 'workouts', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting workout:', e);
      return false;
    }
  }

  public async addCustomExercise(name: string): Promise<boolean> {
    if (!this.db || !this.user) return false;
    try {
      const docRef = doc(collection(this.db, 'users', this.user.uid, 'exercises'));
      await setDoc(docRef, { name: name.trim(), createdAt: Date.now() });
      return true;
    } catch (e) {
      console.error('Error adding custom exercise:', e);
      return false;
    }
  }

  // Save Whoop Integration Credentials per User
  public async saveWhoopToken(token: string): Promise<boolean> {
    if (!this.db || !this.user) return false;
    try {
      const docRef = doc(this.db, 'users', this.user.uid, 'settings', 'whoop');
      await setDoc(docRef, { token: token.trim(), updatedAt: Date.now() });
      return true;
    } catch (e) {
      console.error('Error saving Whoop token:', e);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
