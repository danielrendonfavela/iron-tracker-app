import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { SessionTab } from './components/tabs/SessionTab';
import { CoachTab } from './components/tabs/CoachTab';
import { ProgressTab } from './components/tabs/ProgressTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { ToolsTab } from './components/tabs/ToolsTab';
import { ProfileDrawer } from './components/ProfileDrawer';
import { AuthModal } from './components/AuthModal';

import { VersionBanner } from './components/VersionBanner';
import { useTimer } from './hooks/useTimer';
import { useWorkouts } from './hooks/useWorkouts';
import { useTheme } from './hooks/useTheme';
import { TabType } from './types/gym';
import { WhoopSummary } from './types/whoop';
import { firebaseService } from './services/firebaseService';
import { whoopService } from './services/whoopService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('session');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [whoopData, setWhoopData] = useState<WhoopSummary>(whoopService.getStoredWhoopData());

  const { isRunning, formattedTime, toggleTimer, resetTimer } = useTimer();
  useTheme(); // Init theme hook

  const {
    workouts,
    allExercises,
    isFirebaseActive,
    reloadFirebaseConfig,
    addCustomExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    handleAIOperations
  } = useWorkouts();

  useEffect(() => {
    const unsub = firebaseService.onAuthChange(u => {
      setCurrentUser(u);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans pb-24 selection:bg-red-600/40">
      <VersionBanner />
      <Header
        formattedTime={formattedTime}
        isRunning={isRunning}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        isFirebaseActive={isFirebaseActive}
        onReloadFirebase={reloadFirebaseConfig}
        onOpenProfileDrawer={() => setShowProfileDrawer(true)}
      />

      <main className="max-w-md mx-auto p-4">
        {activeTab === 'session' && (
          <SessionTab
            exercises={allExercises}
            onAddExerciseName={addCustomExercise}
            onSaveSession={addWorkout}
          />
        )}
        {activeTab === 'coach' && (
          <CoachTab workouts={workouts} onAIOperations={handleAIOperations} />
        )}
        {activeTab === 'charts' && (
          <ProgressTab exercises={allExercises} workouts={workouts} />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            workouts={workouts}
            onUpdateWorkout={updateWorkout}
            onDeleteWorkout={deleteWorkout}
          />
        )}
        {activeTab === 'tools' && <ToolsTab />}
      </main>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Drawer lateral nativo */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        currentUser={currentUser}
        isFirebaseActive={isFirebaseActive}
        whoopData={whoopData}
        onWhoopUpdate={setWhoopData}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenToolsTab={() => setActiveTab('tools')}
      />

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
