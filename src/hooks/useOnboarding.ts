import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async (user: any) => {
      let isCompleted = false;

      // 1. Check LocalStorage
      const localStatus = localStorage.getItem('onboardingCompleted');
      if (localStatus === 'true') {
        isCompleted = true;
      }

      // 2. Check Firebase if user is logged in and not completed locally
      if (!isCompleted && user) {
        const firebaseStatus = await firebaseService.getOnboarding();
        if (firebaseStatus === true) {
          isCompleted = true;
          localStorage.setItem('onboardingCompleted', 'true');
        }
      }

      if (!isCompleted && !hasChecked) {
        setShowOnboarding(true);
      }
      setHasChecked(true);
    };

    const unsub = firebaseService.onAuthChange((user) => {
      checkOnboardingStatus(user);
    });

    return () => {
      if (unsub) unsub();
    };
  }, [hasChecked]);

  const completeOnboarding = async () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
    const user = firebaseService.getCurrentUser();
    if (user) {
      await firebaseService.saveOnboarding(true);
    }
  };

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    triggerOnboarding
  };
};
