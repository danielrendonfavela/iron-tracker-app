import React, { useState } from 'react';
import {
  User,
  LogOut,
  X,
  Cloud,
  ShieldCheck,
  Smartphone,
  Activity,
  Heart,
  Moon,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Target,
  LogIn,
  Check,
  Settings
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { whoopService } from '../services/whoopService';
import { WhoopSummary } from '../types/whoop';
import { ThemeSelector } from './ThemeSelector';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  isFirebaseActive: boolean;
  whoopData: WhoopSummary;
  onWhoopUpdate: (updated: WhoopSummary) => void;
  onOpenAuthModal: () => void;
  onOpenToolsTab?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  isFirebaseActive,
  whoopData,
  onWhoopUpdate,
  onOpenAuthModal,
  onOpenToolsTab
}) => {
  const [showWhoopConfig, setShowWhoopConfig] = useState(false);
  const [showPwaInfo, setShowPwaInfo] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(whoopService.getWhoopClientId());
  const [savedClientId, setSavedClientId] = useState(false);

  if (!isOpen) return null;

  const isAnonymous = currentUser && currentUser.isAnonymous;
  const isLoggedIn = currentUser && !isAnonymous;
  const userDisplayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    (isAnonymous ? 'Atleta Invitado' : 'Usuario Local');
  const userEmail =
    currentUser?.email || (isAnonymous ? 'Modo Anónimo' : 'Almacenamiento Local');

  const handleLogout = async () => {
    await firebaseService.logout();
  };

  const handleSimulateState = (state: 'GREEN' | 'YELLOW' | 'RED') => {
    const updated = whoopService.setWhoopState(state);
    onWhoopUpdate(updated);
  };

  const handleSaveClientId = () => {
    whoopService.setWhoopClientId(clientIdInput);
    setSavedClientId(true);
    setTimeout(() => setSavedClientId(false), 1500);
  };

  const oauthUrl = whoopService.getOAuthUrl(window.location.origin + '/whoop-callback');

  const stateColors = {
    GREEN: 'border-green-500/50 bg-green-950/30 text-green-400',
    YELLOW: 'border-yellow-500/50 bg-yellow-950/30 text-yellow-400',
    RED: 'border-red-600/50 bg-red-950/30 text-red-500'
  };

  const stateLabels = {
    GREEN: '🟢 ÓPTIMO PARA PRs',
    YELLOW: '🟨 MANTENER VOLUMEN',
    RED: '🟥 DESCARGA RECOMENDADA'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop con desfoque y oscurecimiento */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer deslizante lateral estilo App Nativa */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-zinc-950/95 backdrop-blur-2xl border-l border-zinc-800/80 shadow-2xl z-50 flex flex-col h-full transform transition-transform duration-300 ease-out translate-x-0">
        {/* Drag Handle superior para vista móvil */}
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Encabezado del Drawer */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600/20 border border-red-600/50 rounded-lg text-red-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                PERFIL Y CONFIGURACIÓN
              </h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                IRON TRACKER PRO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* TARJETA DE USUARIO & ESTADO DE CUENTA */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-4 border border-zinc-800/80 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-700 to-red-500 border-2 border-white/20 flex items-center justify-center text-xl font-black text-white uppercase shadow-md shrink-0">
                {userDisplayName[0] || 'U'}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-white uppercase truncate tracking-tight">
                  {userDisplayName}
                </h3>
                <p className="text-xs text-zinc-400 font-mono truncate">{userEmail}</p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isLoggedIn ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`}
                  />
                  <span className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">
                    {isLoggedIn ? 'CUENTA ATLETA VINCULADA' : 'MODO LOCAL / INVITADO'}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÓN DE CIERRE DE SESIÓN O INICIO DE SESIÓN */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full mt-2 bg-zinc-900 hover:bg-red-600/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-red-500 font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" /> CERRAR SESIÓN
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" /> INICIAR SESIÓN / CREAR CUENTA
              </button>
            )}
          </div>

          {/* ESTADO DE SINCRONIZACIÓN EN LA NUBE */}
          <div className="bg-zinc-900/60 backdrop-blur-md p-3.5 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud
                  className={`w-4 h-4 ${isFirebaseActive ? 'text-green-400' : 'text-yellow-400'}`}
                />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  SINCRONIZACIÓN
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                  isFirebaseActive
                    ? 'bg-green-950/60 text-green-400 border-green-700/60'
                    : 'bg-yellow-950/60 text-yellow-400 border-yellow-700/60'
                }`}
              >
                {isFirebaseActive ? '🟢 Sincronizado en la Nube' : '🟡 Modo Local'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug font-medium">
              {isFirebaseActive
                ? '🟢 Sincronizado en la Nube con Google Cloud Firebase. Tus entrenamientos están protegidos en tiempo real.'
                : '🟡 Guardado localmente en tu navegador. Inicia sesión para respaldar tus rutinas automáticamente.'}
            </p>
          </div>

          {/* SECTOR TEMA DE INTERFAZ */}
          <div className="bg-zinc-900/60 backdrop-blur-md p-3.5 border border-zinc-800/80 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                TEMA DE INTERFAZ
              </h4>
              <p className="text-[10px] text-zinc-400 font-medium">
                Apariencia visual de la app
              </p>
            </div>
            <ThemeSelector />
          </div>

          {/* SECTOR BIOMETRÍA & CONEXIÓN WHOOP */}
          <div className="bg-zinc-900/60 backdrop-blur-md p-4 border border-zinc-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  BIOMETRÍA WHOOP
                </h4>
              </div>
              <button
                onClick={() => setShowWhoopConfig(!showWhoopConfig)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <Settings className="w-3.5 h-3.5" /> API
              </button>
            </div>

            {/* Resumen Recuperación */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  stateColors[whoopData.recovery.state]
                }`}
              >
                <span className="text-[9px] font-black uppercase text-zinc-300">
                  RECUPERACIÓN
                </span>
                <span className="text-3xl font-black tracking-tight my-0.5">
                  {whoopData.recovery.recoveryScore}%
                </span>
                <span className="text-[9px] font-black uppercase tracking-tight">
                  {stateLabels[whoopData.recovery.state]}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/60 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-red-500 fill-current" /> STRAIN
                  </span>
                  <span className="font-black text-white">{whoopData.strain.strainScore}</span>
                </div>
                <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/60 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Heart className="w-3 h-3 text-blue-400" /> HRV
                  </span>
                  <span className="font-black text-white">{whoopData.recovery.hrv} ms</span>
                </div>
                <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/60 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Moon className="w-3 h-3 text-purple-400" /> SUEÑO
                  </span>
                  <span className="font-black text-white">{whoopData.sleep.hoursSlept}h</span>
                </div>
              </div>
            </div>

            {/* Simulación rápida Whoop */}
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-400 uppercase flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-zinc-500" /> PROBAR ESTADO:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSimulateState('GREEN')}
                  className="px-2 py-0.5 bg-green-950 text-green-400 border border-green-700 rounded font-black hover:bg-green-900"
                >
                  VERDE
                </button>
                <button
                  onClick={() => handleSimulateState('YELLOW')}
                  className="px-2 py-0.5 bg-yellow-950 text-yellow-400 border border-yellow-700 rounded font-black hover:bg-yellow-900"
                >
                  AMARILLO
                </button>
                <button
                  onClick={() => handleSimulateState('RED')}
                  className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-700 rounded font-black hover:bg-red-900"
                >
                  ROJO
                </button>
              </div>
            </div>

            {/* Ajustes API Whoop */}
            {showWhoopConfig && (
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                  WHOOP CLIENT ID (OAUTH 2.0)
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                  placeholder="Client ID de Whoop Portal..."
                  className="w-full bg-black border border-zinc-800 p-2 text-xs font-mono text-white rounded outline-none focus:border-red-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveClientId}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-1.5 rounded text-[10px] uppercase flex items-center justify-center gap-1"
                  >
                    {savedClientId ? <Check className="w-3 h-3" /> : null}
                    {savedClientId ? 'GUARDADO' : 'GUARDAR ID'}
                  </button>
                  {oauthUrl && (
                    <a
                      href={oauthUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-2.5 py-1.5 rounded text-[10px] uppercase flex items-center gap-1"
                    >
                      VINCULAR <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* HERRAMIENTAS Y CALCULADORAS (ACCESO DIRECTO) */}
          {onOpenToolsTab && (
            <button
              onClick={() => {
                onClose();
                onOpenToolsTab();
              }}
              className="w-full bg-zinc-900/60 hover:bg-zinc-900 backdrop-blur-md p-3.5 border border-zinc-800/80 rounded-xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600/10 border border-red-600/30 rounded-lg text-red-500">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    CALCULADORA 1RM Y CONVERSOR
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Herramientas avanzadas de cálculo de cargas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          )}

          {/* GUÍA INSTALACIÓN PWA IPHONE */}
          <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPwaInfo(!showPwaInfo)}
              className="w-full p-3.5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-red-500" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    INSTALAR EN IPHONE / PWA
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Modo App Nativa a pantalla completa
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-zinc-500 transition-transform ${
                  showPwaInfo ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showPwaInfo && (
              <div className="px-3.5 pb-3.5 border-t border-zinc-800/60 space-y-2 text-[11px] text-zinc-300 font-medium">
                <ol className="space-y-1.5 list-decimal list-inside leading-relaxed pt-2">
                  <li>Abre esta app en **Safari** en tu iPhone.</li>
                  <li>
                    Toca el botón **Compartir**{' '}
                    <span className="text-red-500 font-black">⎋</span>.
                  </li>
                  <li>
                    Selecciona **"Agregar a inicio"**{' '}
                    <span className="text-red-500 font-black">➕</span>.
                  </li>
                  <li>
                    ¡Listo! Se abrirá de forma independiente sin barras de navegador.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* PIE Y NOTA DE SEGURIDAD */}
          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 text-[10px] text-zinc-400 font-medium leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-green-500 inline mr-1" />
            <strong className="text-zinc-200">Gobernanza y Seguridad:</strong> Las llaves de
            Firestore y Gemini están configuradas mediante variables de entorno seguras. Tus
            datos pertenecen a tu cuenta única.
          </div>
        </div>
      </aside>
    </div>
  );
};
