import React, { useState } from 'react';
import { Dumbbell, Edit2, Trash2, AlertTriangle, X, Save } from 'lucide-react';
import { Workout, SetBlock, UnitType } from '../../types/gym';

interface HistoryTabProps {
  workouts: Workout[];
  onUpdateWorkout: (id: string, updatedFields: Partial<Workout>) => void;
  onDeleteWorkout: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  workouts,
  onUpdateWorkout,
  onDeleteWorkout
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteWorkout(deleteId);
      setDeleteId(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingWorkout) return;

    const validBlocks = editingWorkout.blocks.filter(
      b => b.reps !== '' && b.weight !== ''
    );

    if (validBlocks.length > 0) {
      const formatted: SetBlock[] = [];
      validBlocks.forEach(b => {
        const numSets = b.sets || 1;
        for (let i = 0; i < numSets; i++) {
          formatted.push({
            sets: 1,
            reps: parseInt(String(b.reps)) || 0,
            weight: parseFloat(String(b.weight)) || 0,
            unit: b.unit || 'kg'
          });
        }
      });
      onUpdateWorkout(editingWorkout.id, { blocks: formatted });
    } else {
      onDeleteWorkout(editingWorkout.id);
    }

    setEditingWorkout(null);
  };

  const updateEditSet = (idx: number, field: keyof SetBlock, val: any) => {
    if (!editingWorkout) return;
    const updatedBlocks = editingWorkout.blocks.map((s, i) =>
      i === idx ? { ...s, [field]: val } : s
    );
    setEditingWorkout({ ...editingWorkout, blocks: updatedBlocks });
  };

  const addEditSet = () => {
    if (!editingWorkout) return;
    const last = editingWorkout.blocks[editingWorkout.blocks.length - 1];
    setEditingWorkout({
      ...editingWorkout,
      blocks: [
        ...editingWorkout.blocks,
        {
          sets: 1,
          reps: last?.reps || '',
          weight: last?.weight || '',
          unit: last?.unit || 'kg'
        }
      ]
    });
  };

  const removeEditSet = (idx: number) => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      blocks: editingWorkout.blocks.filter((_, i) => i !== idx)
    });
  };

  if (!workouts.length) {
    return (
      <div className="text-center py-16 animate-in fade-in">
        <Dumbbell className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
        <h3 className="text-xl font-black text-zinc-600 uppercase">SIN MARCAS DE ENTRENAMIENTO</h3>
      </div>
    );
  }

  // Group workouts by date
  const grouped = Object.entries(
    workouts.reduce((acc, w) => {
      const dateKey = w.date || 'Fecha desconocida';
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(w);
      return acc;
    }, {} as Record<string, Workout[]>)
  ).sort((a, b) => (b[1][0]?.timestamp || 0) - (a[1][0]?.timestamp || 0));

  return (
    <div className="space-y-6 animate-in fade-in pb-8 relative">
      <h2 className="text-[10px] font-black text-zinc-500 tracking-widest pl-1 uppercase">
        HISTORIAL DE ENTRENAMIENTOS ({workouts.length})
      </h2>

      {grouped.map(([dt, wrks]) => (
        <div key={dt} className="bg-zinc-900 border-2 border-zinc-800 shadow-lg">
          <div className="bg-zinc-950 p-3 border-b-2 border-zinc-800 flex justify-between items-center">
            <span className="font-black text-red-500 text-sm uppercase">{dt}</span>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {wrks.map(w => {
              const displayBlocks: SetBlock[] = [];
              if (w.blocks && Array.isArray(w.blocks)) {
                w.blocks.forEach(b => {
                  const numSets = b.sets || 1;
                  for (let i = 0; i < numSets; i++) {
                    displayBlocks.push({
                      reps: b.reps,
                      weight: b.weight,
                      unit: b.unit || 'kg'
                    });
                  }
                });
              }

              return (
                <div key={w.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-white text-xs block uppercase">
                      {w.exerciseName}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditingWorkout({
                            ...w,
                            blocks: displayBlocks
                          })
                        }
                        className="text-zinc-500 hover:text-blue-500 p-1 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(w.id)}
                        className="text-zinc-500 hover:text-red-500 p-1 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-2 border-l-2 border-red-600/40">
                    {displayBlocks.map((b, i) => (
                      <div key={i} className="flex justify-between max-w-[220px]">
                        <span className="text-xs font-bold text-zinc-400">
                          SET {i + 1}: <span className="text-white font-black">{b.reps}</span> REPS
                        </span>
                        <div className="flex gap-1">
                          <span className="text-zinc-600 font-black">@</span>
                          <span className="text-xs font-black text-red-500">
                            {Number(b.weight) === 0 ? 'CORPO / LIBRE' : `${b.weight} ${b.unit}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* MODAL DE EDICIÓN */}
      {editingWorkout && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-blue-600 w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div>
                <h3 className="text-xs font-black text-blue-500 tracking-widest uppercase">
                  MODIFICAR REGISTRO
                </h3>
                <p className="text-sm font-black text-white mt-1 uppercase">
                  {editingWorkout.exerciseName}
                </p>
              </div>
              <button
                onClick={() => setEditingWorkout(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
              <div className="flex text-[9px] font-black tracking-widest text-zinc-500 text-center px-1 mb-2">
                <div className="w-8">SET</div>
                <div className="flex-1">PESO</div>
                <div className="flex-1">REPS</div>
                <div className="w-8"></div>
              </div>

              {editingWorkout.blocks.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-black p-1.5 border border-zinc-800">
                  <div className="w-8 text-center text-xs font-black text-zinc-500">{idx + 1}</div>
                  <div className="flex-1 flex bg-zinc-900 border border-zinc-800 focus-within:border-blue-500">
                    <input
                      type="number"
                      value={b.weight}
                      onChange={e => updateEditSet(idx, 'weight', e.target.value)}
                      className="w-full bg-transparent p-2 text-base font-black text-white text-center outline-none"
                      placeholder="0"
                    />
                    <button
                      onClick={() =>
                        updateEditSet(idx, 'unit', b.unit === 'kg' ? 'lb' : 'kg')
                      }
                      className="px-2 text-[10px] font-black text-blue-500 bg-zinc-950 uppercase"
                    >
                      {b.unit}
                    </button>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={b.reps}
                      onChange={e => updateEditSet(idx, 'reps', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-base font-black text-white text-center outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-8 flex justify-center">
                    <button
                      onClick={() => removeEditSet(idx)}
                      className="text-zinc-600 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addEditSet}
                className="w-full py-3 mt-4 text-[10px] font-black tracking-widest text-zinc-400 hover:text-blue-500 border border-dashed border-zinc-800 transition-colors uppercase"
              >
                + AÑADIR SERIE
              </button>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-black">
              <button
                onClick={handleSaveEdit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 flex justify-center gap-2 items-center transition-colors uppercase text-xs tracking-wider"
              >
                <Save className="w-5 h-5" /> SÍ, ACTUALIZAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN FIX */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2 uppercase">¿DESTRUIR REGISTRO?</h3>
            <p className="text-xs text-zinc-400 mb-6 font-bold uppercase">
              ESTE EJERCICIO DESAPARECERÁ DE TUS GRÁFICAS Y NO SE PUEDE RECUPERAR.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-[10px] uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmDelete}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] flex justify-center gap-2 items-center uppercase"
              >
                <Trash2 className="w-4 h-4" /> DESTRUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
