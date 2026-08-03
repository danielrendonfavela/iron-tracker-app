import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';

export type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('iron_theme');
    return (saved as Theme) || 'system';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    const unsub = firebaseService.onAuthChange((user) => {
      if (user) {
        const unsubTheme = firebaseService.subscribeTheme((cloudTheme) => {
          if (cloudTheme && (cloudTheme === 'dark' || cloudTheme === 'light' || cloudTheme === 'system')) {
            setThemeState(cloudTheme as Theme);
            localStorage.setItem('iron_theme', cloudTheme);
          }
        });
        return () => {
          if (unsubTheme) unsubTheme();
        };
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('iron_theme', newTheme);
    
    // Sync to cloud if user is logged in
    firebaseService.saveTheme(newTheme);
  };

  return { theme, resolvedTheme, setTheme };
}

