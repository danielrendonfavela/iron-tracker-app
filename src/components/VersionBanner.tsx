import React, { useState, useEffect } from 'react';

export const VersionBanner: React.FC = () => {
  const [initialBuildTime, setInitialBuildTime] = useState<number | null>(null);

  const checkVersion = async (isInitial = false) => {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.buildTime) {
        if (isInitial) {
          setInitialBuildTime(data.buildTime);
        } else if (initialBuildTime && data.buildTime > initialBuildTime) {
          // Automatic seamless reload: 0-clicks required from user
          window.location.reload();
        }
      }
    } catch (e) {
      // Ignore network failures
    }
  };

  useEffect(() => {
    checkVersion(true);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion(false);
      }
    };

    const interval = setInterval(() => checkVersion(false), 20000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [initialBuildTime]);

  return null; // 100% Invisible background auto-updater
};
