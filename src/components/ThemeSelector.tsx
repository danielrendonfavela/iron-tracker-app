import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded border border-zinc-300 dark:border-zinc-800">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded transition-colors ${theme === 'light' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="Claro"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'bg-zinc-800 text-white shadow border border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="Oscuro"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded transition-colors ${theme === 'system' ? 'bg-zinc-800 text-white shadow border border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="Sistema"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
};
