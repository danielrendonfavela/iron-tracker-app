import React, { useState } from 'react';
import { Activity, Heart, Moon, Zap, RefreshCw, Settings, Check, ExternalLink } from 'lucide-react';
import { WhoopSummary } from '../types/whoop';
import { whoopService } from '../services/whoopService';

interface WhoopWidgetProps {
  whoopData: WhoopSummary;
  onWhoopUpdate: (updated: WhoopSummary) => void;
}

export const WhoopWidget: React.FC<WhoopWidgetProps> = ({ whoopData, onWhoopUpdate }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(whoopService.getWhoopClientId());
  const [saved, setSaved] = useState(false);

  const stateColors = {
    GREEN: 'border-green-500 text-green-400 bg-green-950/40',
    YELLOW: 'border-yellow-500 text-yellow-400 bg-yellow-950/40',
    RED: 'border-red-600 text-red-500 bg-red-950/40'
  };

  const stateBadges = {
    GREEN: '🟩 RECUPERADO (ÓPTIMO PARA PRs)',
    YELLOW: '🟨 MODERADO (MANTENER VOLUMEN)',
    RED: '🟥 BAJA RECUPERACIÓN (DESCARGA RECOMENDADA)'
  };

  const handleSimulateState = (state: 'GREEN' | 'YELLOW' | 'RED') => {
    const updated = whoopService.setWhoopState(state);
    onWhoopUpdate(updated);
  };

  const handleSaveClientId = () => {
    whoopService.setWhoopClientId(clientIdInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const oauthUrl = whoopService.getOAuthUrl(window.location.origin + '/whoop-callback');

  return (
    <div className="bg-zinc-950 border-2 border-zinc-900 p-4 shadow-2xl relative overflow-hidden space-y-4">
      {/* Glow background accent */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
          whoopData.recovery.state === 'GREEN'
            ? 'bg-green-600/10'
            : whoopData.recovery.state === 'YELLOW'
            ? 'bg-yellow-600/10'
            : 'bg-red-600/10'
        }`}
      />

      {/* Header del Widget */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-zinc-100" />
          <h3 className="text-xs font-black text-white tracking-widest uppercase">
            WHOOP RECOVERY & STRAIN
          </h3>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-zinc-500 hover:text-white p-1 transition-colors"
          title="Configurar Whoop API"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Tarjeta de Recuperación */}
      <div className="grid grid-cols-2 gap-3">
        {/* Recovery Score */}
        <div
          className={`p-3.5 border flex flex-col justify-between ${
            stateColors[whoopData.recovery.state]
          }`}
        >
          <span className="text-[9px] font-black tracking-widest uppercase text-zinc-300">
            RECOVERY SCORE
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-4xl font-black tracking-tighter">
              {whoopData.recovery.recoveryScore}%
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight">
            {stateBadges[whoopData.recovery.state]}
          </span>
        </div>

        {/* Strain & Sleep Grid */}
        <div className="space-y-2">
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-red-500">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">STRAIN</span>
            </div>
            <span className="text-sm font-black text-white">{whoopData.strain.strainScore}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-2.5 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Heart className="w-4 h-4" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">HRV</span>
            </div>
            <span className="text-sm font-black text-white">{whoopData.recovery.hrv} ms</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-2.5 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Moon className="w-4 h-4" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">SUEÑO</span>
            </div>
            <span className="text-sm font-black text-white">{whoopData.sleep.hoursSlept}h</span>
          </div>
        </div>
      </div>

      {/* Selector de Simulación Rápida (Live Demo) */}
      <div className="bg-black p-2.5 border border-zinc-800 flex items-center justify-between">
        <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> PROBAR ESTADO WHOOP:
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleSimulateState('GREEN')}
            className="px-2 py-1 bg-green-950 text-green-400 border border-green-700 text-[9px] font-black uppercase hover:bg-green-900"
          >
            VERDE
          </button>
          <button
            onClick={() => handleSimulateState('YELLOW')}
            className="px-2 py-1 bg-yellow-950 text-yellow-400 border border-yellow-700 text-[9px] font-black uppercase hover:bg-yellow-900"
          >
            AMARILLO
          </button>
          <button
            onClick={() => handleSimulateState('RED')}
            className="px-2 py-1 bg-red-950 text-red-400 border border-red-700 text-[9px] font-black uppercase hover:bg-red-900"
          >
            ROJO
          </button>
        </div>
      </div>

      {/* Configuración de API Oficial Whoop */}
      {showConfig && (
        <div className="bg-zinc-900 border border-zinc-700 p-4 space-y-3 animate-in fade-in">
          <h4 className="text-xs font-black text-white tracking-widest uppercase">
            CONECTAR WHOOP DEVELOPER API (OAUTH 2.0)
          </h4>
          <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
            Ingresa tu Client ID de Whoop Developer Portal para vincular tu dispositivo real.
          </p>

          <input
            type="text"
            value={clientIdInput}
            onChange={e => setClientIdInput(e.target.value)}
            placeholder="Client ID de Whoop Portal..."
            className="w-full bg-black border border-zinc-800 p-2.5 text-xs font-mono text-white outline-none focus:border-red-600"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveClientId}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2 uppercase text-[10px] flex items-center justify-center gap-1"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              {saved ? 'GUARDADO' : 'GUARDAR CLIENT ID'}
            </button>

            {oauthUrl && (
              <a
                href={oauthUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-3 py-2 uppercase text-[10px] flex items-center gap-1"
              >
                VINCULAR <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
