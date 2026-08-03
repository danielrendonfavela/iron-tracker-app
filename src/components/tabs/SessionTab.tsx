import React, { useState } from 'react';
import { Plus, Save, Dumbbell, Calendar, X, Trash2, AlertTriangle } from 'lucide-react';
import { SessionExercise, UnitType, Workout } from '../../types/gym';
import { SearchDropdown } from '../SearchDropdown';

interface SessionTabProps {
  exercises: string[];
  onAddExerciseName: (name: string) => void;
  onSaveSession: (workout: Omit<Workout, 'id'>) => void;
}

const genId = () => Math.random().toString(36).substring(2, 9);

export const SessionTab: React.FC<SessionTabProps> = ({
  exercises,
  onAddExerciseName,
  onSaveSession
}) => {
  const [session, setSession] = useState<SessionExercise[]>([]);
  const [selectedEx, setSelectedEx] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [manualExName, setManualExName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const addExerciseToSession = (name: string) => {
    const cleanName = name.trim();
    if (cleanName && !session.some(e => e.name.toLowerCase() === cleanName.toLowerCase())) {
      setSession([
        ...session,
        {
          id: genId(),
          name: cleanName,
          sets: [{ id: genId(), reps: '', weight: '', unit: 'kg' }]
        }
      ]);
      setSelectedEx('');
    }
  };

  const handleManualAdd = () => {
    if (manualExName.trim()) {
      onAddExerciseName(manualExName.trim());
      addExerciseToSession(manualExName.trim());
      setManualExName('');
      setIsManual(false);
    }
  };

  const addSet = (exId: string) => {
    setSession(
      session.map(ex => {
        if (ex.id === exId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: genId(),
                reps: lastSet?.reps || '',
                weight: lastSet?.weight || '',
                unit: lastSet?.unit || 'kg'
              }
            ]
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exId: string, setId: string) => {
    setSession(
      session.map(ex =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex
      )
    );
  };

  const updateSet = (
    exId: string,
    setId: string,
    field: 'reps' | 'weight' | 'unit',
    value: string
  ) => {
    setSession(
      session.map(ex =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map(s => (s.id === setId ? { ...s, [field]: value } : s))
            }
          : ex
      )
    );
  };

  const removeExercise = (exId: string) => {
    setSession(session.filter(ex => ex.id !== exId));
  };

  const handleFinishSession = () => {
    if (!session.length) return;

    const tDate = new Date(sessionDate + 'T12:00:00');
    const dateStr = tDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timestamp = tDate.getTime();

    session.forEach(ex => {
      const validSets = ex.sets.filter(s => s.reps !== '' && s.weight !== '');
      if (validSets.length > 0) {
        onSaveSession({
          exerciseName: ex.name,
          date: dateStr,
          timestamp,
          blocks: validSets.map(s => ({
            sets: 1,
            reps: parseInt(String(s.reps)) || 0,
            weight: parseFloat(String(s.weight)) || 0,
            unit: s.unit as UnitType
          }))
        });
      }
    });

    setSession([]);
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in">
      {/* Contenedor Fecha & Agregar Ejercicio */}
      <div className="bg-zinc-900 p-4 border border-zinc-800 shadow-xl rounded-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-black tracking-widest uppercase">FECHA DE SESIÓN:</span>
          </div>
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            className="bg-black border border-zinc-700 text-red-500 text-xs font-black px-3 py-1 outline-none rounded-sm"
          />
        </div>

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-600" /> AGREGAR EJERCICIO
          </h2>
          {!isManual && (
            <button
              onClick={() => setIsManual(true)}
              className="text-[10px] font-bold text-zinc-400 bg-black px-2.5 py-1 border border-zinc-800 hover:text-white uppercase"
            >
              MANUAL
            </button>
          )}
        </div>

        {isManual ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={manualExName}
              onChange={e => setManualExName(e.target.value)}
              placeholder="NOMBRE DEL EJERCICIO..."
              className="flex-1 bg-black border border-zinc-800 p-3 text-sm font-bold text-white uppercase outline-none"
              autoFocus
            />
            <button
              onClick={handleManualAdd}
              className="bg-red-600 hover:bg-red-500 text-white px-4 font-black uppercase text-xs"
            >
              AÑADIR
            </button>
            <button
              onClick={() => setIsManual(false)}
              className="bg-zinc-800 text-zinc-400 px-3 font-black text-xs hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchDropdown
                options={exercises}
                value={selectedEx}
                onChange={setSelectedEx}
                onAddNew={n => {
                  onAddExerciseName(n);
                  addExerciseToSession(n);
                }}
              />
            </div>
            <button
              onClick={() => addExerciseToSession(selectedEx)}
              disabled={!selectedEx}
              className="bg-red-600 disabled:opacity-30 hover:bg-red-500 text-white px-4 font-black uppercase text-xs transition-colors"
            >
              AÑADIR
            </button>
          </div>
        )}
      </div>

      {/* Lista de Ejercicios en Sesión */}
      <div className="space-y-4">
        {session.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 bg-zinc-950/50">
            <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs font-black tracking-widest uppercase">
              SESIÓN VACÍA - SELECCIONA UN EJERCICIO PARA EMPEZAR
            </p>
          </div>
        ) : (
          session.map((ex, i) => (
            <div key={ex.id} className="bg-zinc-900 border border-zinc-800 shadow-lg">
              <div className="bg-black/80 p-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="font-black text-red-500 text-sm uppercase flex items-center gap-2">
                  <span className="text-zinc-600 text-xs">{i + 1}.</span> {ex.name}
                </span>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="text-zinc-600 hover:text-red-500 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex text-[9px] font-black tracking-widest text-zinc-500 text-center px-1">
                  <div className="w-8">SET</div>
                  <div className="flex-1">PESO</div>
                  <div className="flex-1">REPS</div>
                  <div className="w-8"></div>
                </div>

                {ex.sets.map((set, sI) => (
                  <div key={set.id} className="flex items-center gap-2 bg-black p-1.5 border border-zinc-800">
                    <div className="w-8 text-center text-xs font-black text-zinc-500">{sI + 1}</div>

                    {/* Input Peso */}
                    <div className="flex-1 flex bg-zinc-900 border border-zinc-800 focus-within:border-red-600">
                      <input
                        type="number"
                        value={set.weight}
                        onChange={e => updateSet(ex.id, set.id, 'weight', e.target.value)}
                        className="w-full bg-transparent p-2 text-base font-black text-white text-center outline-none"
                        placeholder="0"
                      />
                      <button
                        onClick={() =>
                          updateSet(ex.id, set.id, 'unit', set.unit === 'kg' ? 'lb' : 'kg')
                        }
                        className="px-2.5 text-[10px] font-black text-red-500 bg-zinc-950 hover:bg-zinc-900 uppercase"
                      >
                        {set.unit}
                      </button>
                    </div>

                    {/* Input Reps */}
                    <div className="flex-1">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={e => updateSet(ex.id, set.id, 'reps', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-base font-black text-white text-center outline-none focus:border-red-600"
                        placeholder="0"
                      />
                    </div>

                    {/* Borrar Set */}
                    <div className="w-8 flex justify-center">
                      <button
                        onClick={() => removeSet(ex.id, set.id)}
                        className="text-zinc-700 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addSet(ex.id)}
                  className="w-full py-2.5 mt-2 text-[10px] font-black tracking-widest text-zinc-400 border border-dashed border-zinc-800 hover:bg-zinc-800/80 transition-colors uppercase"
                >
                  + AÑADIR SERIE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {session.length > 0 && (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 mt-6 border-2 border-zinc-900 sticky bottom-20 z-20 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(220,38,38,0.4)] uppercase tracking-wider"
        >
          <Save className="w-5 h-5" /> FINALIZAR ENTRENAMIENTO
        </button>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2 uppercase">¿GUARDAR ENTRENAMIENTO?</h3>
            <p className="text-xs text-zinc-400 mb-6 font-bold uppercase">FECHA DE REGISTRO: {sessionDate}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-xs uppercase"
              >
                VOLVER
              </button>
              <button
                onClick={handleFinishSession}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-500 font-black text-xs text-white uppercase"
              >
                SÍ, GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
