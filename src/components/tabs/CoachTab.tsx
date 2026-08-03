import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Send, Key, Settings, Check, X } from 'lucide-react';
import { Workout, AIOperation, ChatMessage } from '../../types/gym';
import { WhoopSummary } from '../../types/whoop';
import { queryIronCoach } from '../../services/geminiService';
import { storageService } from '../../services/storageService';
import { whoopService } from '../../services/whoopService';
import { WhoopWidget } from '../WhoopWidget';

interface CoachTabProps {
  workouts: Workout[];
  onAIOperations: (ops: AIOperation[]) => void;
}

export const CoachTab: React.FC<CoachTabProps> = ({ workouts, onAIOperations }) => {
  const [whoopData, setWhoopData] = useState<WhoopSummary>(whoopService.getStoredWhoopData());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡LISTO PARA OPERAR CON TU WHOOP INTEGRADO!\n\nPuedes decirme:\n• "¿Cómo debo entrenar hoy según mi Whoop?"\n• "Corrige mi sentadilla del 29 de julio a 120kg"\n• "Agrega un press de banca hoy con 4 series de 10 reps a 80kg"\n\nLeo tu recuperación en tiempo real.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = storageService.getGeminiKey();
    setApiKey(key);
    setKeyInput(key);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveKey = () => {
    storageService.setGeminiKey(keyInput);
    setApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await queryIronCoach(userText, workouts, apiKey, whoopData);

    if (response.ops && response.ops.length > 0) {
      onAIOperations(response.ops);
    }

    const aiMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      role: 'model',
      text: response.text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in space-y-3">
      {/* Widget de Whoop */}
      <WhoopWidget whoopData={whoopData} onWhoopUpdate={setWhoopData} />

      {/* Banner Encabezado Coach */}
      <div className="bg-red-950/40 border-2 border-red-900/60 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white tracking-widest uppercase">
              IRON COACH AI
            </h2>
            <p className="text-[9px] text-red-400 font-bold uppercase">
              {apiKey ? 'GEMINI 2.5 FLASH + WHOOP CONECTADO' : 'REQUIERE API KEY DE GEMINI'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-zinc-400 hover:text-white bg-black border border-zinc-800 hover:border-red-600 transition-colors"
          title="Configuración de API Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1 custom-scrollbar">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 text-xs font-bold whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-zinc-800 text-white border-r-4 border-zinc-500'
                  : 'bg-black border-2 border-red-900/50 text-zinc-300'
              }`}
            >
              {m.text.split('**').map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-white font-black">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="max-w-[85%] p-3 bg-black border-2 border-red-900/50 text-red-500 text-xs font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" /> ANALIZANDO WHOOP Y HISTORIAL...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input del Chat */}
      <div className="mt-1 bg-black border-2 border-zinc-800 p-2 flex gap-2 focus-within:border-red-600">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="PREGUNTA AL COACH O PIDE CAMBIOS EN TU RUTINA..."
          className="flex-1 bg-transparent p-2.5 text-xs font-bold text-white outline-none min-h-[50px] max-h-[100px] resize-y placeholder:text-zinc-600"
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-red-600 text-white p-3 hover:bg-red-500 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL CONFIGURACIÓN API KEY */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-red-600" /> CONFIGURACIÓN GEMINI API KEY
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 mb-4 font-semibold">
              Para usar el Coach IA, ingresa tu API Key gratuita de Google AI Studio. Se guardará de manera segura en tu navegador.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-zinc-700 p-3 text-xs font-mono font-bold text-white outline-none focus:border-red-600"
              />
            </div>

            <button
              onClick={handleSaveKey}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 uppercase text-xs tracking-wider flex justify-center items-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
              {savedSuccess ? 'GUARDADO' : 'GUARDAR CLAVE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
