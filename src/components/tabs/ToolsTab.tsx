import React, { useState } from 'react';
import { Target, ArrowRightLeft } from 'lucide-react';

export const ToolsTab: React.FC = () => {
  // 1RM Calculator State
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  // Unit Converter State
  const [convertVal, setConvertVal] = useState('');
  const [direction, setDirection] = useState<'kgToLb' | 'lbToKg'>('kgToLb');

  // 1RM Epley formula calculation: Weight * (1 + Reps/30)
  const calculate1RM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (isNaN(w) || isNaN(r) || r <= 0) return '0.0';
    if (r === 1) return w.toFixed(1);
    return (w * (1 + r / 30)).toFixed(1);
  };

  const calculateConversion = () => {
    const v = parseFloat(convertVal);
    if (isNaN(v)) return '0.00';
    return direction === 'kgToLb' ? (v * 2.20462).toFixed(2) : (v / 2.20462).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      {/* Calculadora 1RM */}
      <div className="bg-zinc-900 p-5 border-2 border-zinc-800 shadow-lg">
        <h2 className="text-sm font-black text-white tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Target className="w-5 h-5 text-red-500" /> CALCULADORA 1RM (ESTIMADO)
        </h2>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-[10px] text-zinc-400 font-bold mb-1 text-center uppercase">
              PESO (KG/LB)
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="0"
              className="w-full bg-black border border-zinc-800 p-3 text-lg font-black text-white text-center focus:border-red-600 outline-none"
            />
          </div>

          <span className="text-zinc-600 font-black self-end mb-3 text-lg">X</span>

          <div className="flex-1">
            <label className="block text-[10px] text-zinc-400 font-bold mb-1 text-center uppercase">
              REPETICIONES
            </label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="0"
              className="w-full bg-black border border-zinc-800 p-3 text-lg font-black text-white text-center focus:border-red-600 outline-none"
            />
          </div>
        </div>

        <div className="bg-black p-4 border border-zinc-800 flex justify-between items-center">
          <span className="text-xs text-zinc-400 font-bold uppercase">1RM ESTIMADO:</span>
          <div className="text-3xl font-black text-red-500 tracking-tight">{calculate1RM()}</div>
        </div>
      </div>

      {/* Conversión KG <-> LB */}
      <div className="bg-zinc-900 p-5 border-2 border-zinc-800 text-center shadow-lg">
        <h2 className="text-sm font-black text-white tracking-widest uppercase mb-4 flex justify-center items-center gap-2 border-b border-zinc-800 pb-3">
          <ArrowRightLeft className="w-5 h-5 text-red-500" /> CONVERSOR DE PESO
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase">
              {direction === 'kgToLb' ? 'KILOGRAMOS (KG)' : 'LIBRAS (LB)'}
            </label>
            <input
              type="number"
              value={convertVal}
              onChange={e => setConvertVal(e.target.value)}
              placeholder="0"
              className="w-full bg-black border border-zinc-800 p-4 text-4xl font-black text-white text-center focus:border-red-600 outline-none"
            />
          </div>

          <div className="flex justify-center -my-6 z-10 relative">
            <button
              onClick={() => setDirection(d => (d === 'kgToLb' ? 'lbToKg' : 'kgToLb'))}
              className="bg-red-600 hover:bg-red-500 text-white p-3 border-4 border-zinc-900 shadow-md transition-transform active:scale-95"
              title="Cambiar dirección"
            >
              <ArrowRightLeft className="w-5 h-5 rotate-90" strokeWidth={3} />
            </button>
          </div>

          <div className="bg-zinc-950 p-4 border border-zinc-800">
            <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase">
              {direction === 'kgToLb' ? 'LIBRAS (LB)' : 'KILOGRAMOS (KG)'}
            </label>
            <div className="text-5xl font-black text-red-500 tracking-tighter">
              {calculateConversion()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
