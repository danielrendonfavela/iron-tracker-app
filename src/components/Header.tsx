import React, { useState, useEffect } from 'react';
import { Flame, Timer, Play, Pause, RotateCcw, Cloud, Settings, User as UserIcon } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface HeaderProps {
  formattedTime: string;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  isFirebaseActive: boolean;
  onReloadFirebase?: () => void;
  onOpenProfileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  formattedTime,
  isRunning,
  onToggleTimer,
  onResetTimer,
  isFirebaseActive,
  onOpenProfileDrawer
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = firebaseService.onAuthChange(u => {
      setCurrentUser(u);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const userDisplayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    (currentUser?.isAnonymous ? 'Invitado' : 'Usuario');

  return (
    <header className="bg-zinc-100 dark:bg-zinc-950 border-b-2 border-red-600 p-4 pt-safe pt-[env(safe-area-inset-top)] sticky top-0 z-30 flex flex-col gap-3 shadow-lg shadow-black/10 dark:shadow-black/50">
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        {/* Marca & Botón Drawer Perfil */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-zinc-900 dark:text-white uppercase">
            <Flame className="w-6 h-6 text-red-600 fill-red-600 animate-pulse" /> IRON TRACKER
          </h1>

          <div className="flex items-center gap-1">
            {/* Botón de Perfil & Ajustes (Abre Drawer Lateral Nativo) */}
            <button
              onClick={onOpenProfileDrawer}
              className="p-1.5 rounded-lg border border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-red-600 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Abrir Perfil y Ajustes"
            >
              <UserIcon className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black uppercase max-w-[70px] truncate hidden sm:inline">
                {userDisplayName}
              </span>
              <span className={`w-2 h-2 rounded-full ${isFirebaseActive || firebaseService.isReady() ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </button>

            {/* Botón rápido Cloud / Estado */}
            <button
              onClick={onOpenProfileDrawer}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                isFirebaseActive
                  ? 'border-green-600/60 bg-green-950/30 text-green-400'
                  : 'border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Estado de Sincronización y Configuración"
            >
              {(isFirebaseActive || firebaseService.isReady()) ? <Cloud className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Cronómetro */}
        <div className="flex items-center gap-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 px-3 py-1.5 rounded-lg shadow-sm">
          <Timer className={`w-4 h-4 ${isRunning ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />
          <span
            className={`font-mono text-lg font-black w-[54px] text-center tracking-tight ${
              isRunning ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {formattedTime}
          </span>
          <div className="flex gap-1 border-l border-zinc-300 dark:border-zinc-800 pl-2 ml-1">
            <button
              onClick={onToggleTimer}
              title={isRunning ? 'Pausar' : 'Iniciar'}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current text-red-500" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={onResetTimer}
              title="Reiniciar"
              className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
