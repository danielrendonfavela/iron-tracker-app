import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export const VersionBanner: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [initialBuildTime, setInitialBuildTime] = useState<number | null>(null);

  const checkVersion = async (isInitial = false) => {
    try {
      // Add query param to bypass browser cache
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.buildTime) {
        if (isInitial) {
          setInitialBuildTime(data.buildTime);
        } else if (initialBuildTime && data.buildTime > initialBuildTime) {
          setHasUpdate(true);
        }
      }
    } catch (e) {
      // Ignore network errors when checking version
    }
  };

  useEffect(() => {
    // Initial fetch to record current build time
    checkVersion(true);

    // Check version when user returns to app (visibilitychange)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion(false);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(() => checkVersion(false), 30000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [initialBuildTime]);

  const handleReload = () => {
    window.location.reload();
  };

  if (!hasUpdate) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-bold py-2 px-4 sticky top-0 z-50 flex items-center justify-between shadow-lg shadow-red-950/50 animate-bounce">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>¡Nueva versión disponible en UAT!</span>
      </div>
      <button
        onClick={handleReload}
        className="bg-black hover:bg-zinc-900 text-white px-2.5 py-1 rounded text-[11px] uppercase tracking-wider font-extrabold border border-white/20"
      >
        Actualizar ahora
      </button>
    </div>
  );
};
