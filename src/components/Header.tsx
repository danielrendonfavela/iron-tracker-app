import React, { useState, useEffect } from 'react';
import { Flame, Timer, Play, Pause, RotateCcw, Settings, Cloud, Smartphone, X, ShieldCheck, User as UserIcon } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  formattedTime: string;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  isFirebaseActive: boolean;
  onReloadFirebase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  formattedTime,
  isRunning,
  onToggleTimer,
  onResetTimer,
  isFirebaseActive
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = firebaseService.onAuthChange(u => {
      setCurrentUser(u);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || (currentUser?.isAnonymous ? 'Invitado' : 'Usuario');

  return (
    <header className="bg-zinc-950 border-b-2 border-red-600 p-4 sticky top-0 z-30 flex flex-col gap-3 shadow-lg shadow-black/50">
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        {/* Marca & Botones Perfil / Ajustes */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-white uppercase">
            <Flame className="w-6 h-6 text-red-600 fill-red-600 animate-pulse" /> IRON TRACKER
          </h1>

          <div className="flex items-center gap-1">
            {/* Botón de Perfil de Usuario */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 rounded border border-zinc-800 bg-black text-zinc-300 hover:text-white hover:border-red-600 transition-colors flex items-center gap-1.5"
              title="Mi Cuenta / Iniciar Sesión"
            >
              <UserIcon className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black uppercase max-w-[70px] truncate hidden sm:inline">
                {userDisplayName}
              </span>
            </button>

            {/* Botón de Ajustes / PWA */}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-1.5 rounded border transition-colors flex items-center gap-1 ${
                isFirebaseActive
                  ? 'border-green-600/60 bg-green-950/30 text-green-400'
                  : 'border-zinc-800 bg-black text-zinc-400 hover:text-white'
              }`}
              title="Información de la App e iPhone PWA"
            >
              {isFirebaseActive ? <Cloud className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Cronómetro */}
        <div className="flex items-center gap-2 bg-black border border-zinc-800 px-3 py-1.5 rounded-sm">
          <Timer className={`w-4 h-4 ${isRunning ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />
          <span
            className={`font-mono text-lg font-black w-[54px] text-center tracking-tight ${
              isRunning ? 'text-white' : 'text-zinc-500'
            }`}
          >
            {formattedTime}
          </span>
          <div className="flex gap-1 border-l border-zinc-800 pl-2 ml-1">
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

      {/* MODAL DE AUTENTICACIÓN MULTI-USUARIO */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
      />

      {/* MODAL DE INFORMACIÓN Y PWA IPHONE */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" /> INFORMACIÓN Y ESTADO DE LA APP
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ESTADO CONEXIÓN */}
            <div className="bg-black p-4 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className={`w-5 h-5 ${isFirebaseActive ? 'text-green-500' : 'text-zinc-500'}`} />
                <div>
                  <h4 className="text-xs font-black text-white uppercase">ALMACENAMIENTO DE DATOS</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">
                    {isFirebaseActive ? 'Sincronizado con Google Cloud (Firebase)' : 'Modo Local (LocalStorage)'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[9px] font-black px-2 py-1 uppercase rounded-sm ${
                  isFirebaseActive
                    ? 'bg-green-950 text-green-400 border border-green-800'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {isFirebaseActive ? '🟢 CONECTADO' : '🟡 LOCAL'}
              </span>
            </div>

            {/* INSTALACIÓN IPHONE */}
            <div className="bg-black p-4 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-black text-red-500 tracking-wider uppercase flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> INSTALAR EN TU IPHONE (SAFARI)
              </h4>
              <ol className="text-[11px] text-zinc-300 font-semibold space-y-2 list-decimal list-inside leading-relaxed">
                <li>Abre el enlace de tu app desde **Safari** en tu iPhone.</li>
                <li>Toca el botón **Compartir** <span className="text-red-500 font-black">⎋</span> en la barra de Safari.</li>
                <li>Selecciona **"Agregar a la pantalla de inicio"** <span className="text-red-500 font-black">➕</span>.</li>
                <li>¡Listo! La app se abrirá a pantalla completa como una app nativa.</li>
              </ol>
            </div>

            {/* SEGURIDAD DE VARIABLES DE ENTORNO */}
            <div className="bg-zinc-950 p-3.5 border border-zinc-800 text-[10px] text-zinc-400 leading-normal font-semibold">
              🔒 <strong className="text-zinc-200">Seguridad Profesional:</strong> Las llaves de conexión a la nube están configuradas de forma transparente mediante variables de entorno (`.env`) en el servidor, eliminando campos de texto manuales en la interfaz.
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
