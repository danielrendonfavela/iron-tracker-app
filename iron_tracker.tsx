import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRightLeft, Dumbbell, Plus, Save, LineChart, Table, Trash2, Flame, Search, Activity, ChevronDown, Timer, Play, Pause, RotateCcw, Target, Check, AlertTriangle, X, Brain, Send, Calendar, Edit2 } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'iron-tracker-app';
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
const EXERCISES = ["Press de Banca", "Sentadilla Libre", "Peso Muerto", "Dominadas", "Remo con Barra", "Press Militar", "Elevaciones Laterales", "Curl de Bíceps", "Extensión de Tríceps"];
const apiKey = ""; 

const fetchRetry = async (url, opts, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try { const r = await fetch(url, opts); if (r.ok) return await r.json(); } 
    catch (e) { if (i === retries - 1) throw e; await new Promise(res => setTimeout(res, 2000)); }
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('history'); 
  const [customEx, setCustomEx] = useState([]);
  const [workouts, setWorkouts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    let int = null;
    if (timerOn) int = setInterval(() => setTime(t => t + 1), 1000);
    else clearInterval(int);
    return () => clearInterval(int);
  }, [timerOn]);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) { setLoading(false); }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubEx = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'exercises'), s => setCustomEx(s.docs.map(d => d.data().name)));
    const unsubW = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'workouts'), s => {
      setWorkouts(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    }, () => setLoading(false));
    return () => { unsubEx(); unsubW(); };
  }, [user]);

  const allEx = useMemo(() => Array.from(new Set([...EXERCISES, ...customEx])).sort((a, b) => a.localeCompare(b)), [customEx]);
  const addEx = async (name) => { if (user && name.trim()) await setDoc(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'exercises')), { name: name.trim(), createdAt: Date.now() }); };

  const handleAIOps = async (ops) => {
    if (!user) return;
    for (const op of ops) {
      try {
        if (op.type === 'CREATE' && op.data?.name) {
          let dt = new Date(); if (op.data.date) { const pd = new Date(op.data.date + 'T12:00:00'); if (!isNaN(pd)) dt = pd; }
          const dStr = dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
          const blocks = [];
          (op.data.blocks || []).forEach(b => { for (let i=0; i<(b.sets||1); i++) blocks.push({ sets: 1, reps: parseInt(b.reps)||0, weight: parseFloat(b.weight)||0, unit: b.unit||'kg' }); });
          await setDoc(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'workouts')), { exerciseName: op.data.name, date: dStr, timestamp: dt.getTime(), blocks });
        } 
        else if (op.type === 'UPDATE' && op.id && op.data) {
          let dt = new Date(); if (op.data.date) { const pd = new Date(op.data.date + 'T12:00:00'); if (!isNaN(pd)) dt = pd; }
          const dStr = dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
          const blocks = [];
          (op.data.blocks || []).forEach(b => { for (let i=0; i<(b.sets||1); i++) blocks.push({ sets: 1, reps: parseInt(b.reps)||0, weight: parseFloat(b.weight)||0, unit: b.unit||'kg' }); });
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', op.id), { exerciseName: op.data.name, date: dStr, timestamp: dt.getTime(), blocks });
        }
        else if (op.type === 'DELETE' && op.id) {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', op.id));
        }
      } catch (e) { console.error("Error en OP IA:", e); }
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-600"><Activity className="w-12 h-12 animate-spin mb-2" /><span className="text-xs font-black tracking-widest text-zinc-500">CARGANDO...</span></div>;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-24 selection:bg-red-600/40 uppercase">
      <header className="bg-zinc-950 border-b-2 border-red-600 p-4 sticky top-0 z-30 flex flex-col gap-3">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-white"><Flame className="w-6 h-6 text-red-600 fill-red-600" /> IRON TRACKER</h1>
          <div className="flex items-center gap-2 bg-black border border-zinc-800 px-3 py-1">
            <Timer className={`w-4 h-4 ${timerOn ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />
            <span className={`font-mono text-lg font-black w-[52px] text-center ${timerOn ? 'text-white' : 'text-zinc-500'}`}>{`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}</span>
            <div className="flex gap-1 border-l border-zinc-800 pl-2 ml-1">
              <button onClick={() => setTimerOn(!timerOn)} className="text-zinc-400 hover:text-white p-1">{timerOn ? <Pause className="w-4 h-4 fill-current"/> : <Play className="w-4 h-4 fill-current"/>}</button>
              <button onClick={() => { setTime(0); setTimerOn(false); }} className="text-zinc-400 hover:text-red-500 p-1"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto p-4">
        {tab === 'session' && <SessionTab user={user} exercises={allEx} onAdd={addEx} db={db} appId={appId} />}
        {tab === 'coach' && <CoachTab workouts={workouts} onOps={handleAIOps} />}
        {tab === 'charts' && <ChartsTab exercises={allEx} workouts={workouts} />}
        {tab === 'history' && <HistoryTab workouts={workouts} user={user} db={db} appId={appId} />}
        {tab === 'tools' && <ToolsTab />}
      </main>
      <nav className="fixed bottom-0 w-full bg-zinc-950 border-t-2 border-zinc-900 pb-safe z-40">
        <div className="max-w-md mx-auto flex justify-between">
          <Btn active={tab==='session'} onClick={() => setTab('session')} icon={Dumbbell} label="SESIÓN" />
          <Btn active={tab==='coach'} onClick={() => setTab('coach')} icon={Brain} label="COACH" hi />
          <Btn active={tab==='charts'} onClick={() => setTab('charts')} icon={LineChart} label="PROGRESO" />
          <Btn active={tab==='history'} onClick={() => setTab('history')} icon={Table} label="MARCAS" />
          <Btn active={tab==='tools'} onClick={() => setTab('tools')} icon={Target} label="TOOLS" />
        </div>
      </nav>
    </div>
  );
}

const Btn = ({ active, onClick, icon: Icon, label, hi }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center py-3 px-1 gap-1 border-t-2 ${active ? 'border-red-600 text-white bg-zinc-900' : hi ? 'border-transparent text-red-500/70 hover:text-red-500' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
    <Icon className={`w-5 h-5 ${active ? 'text-red-600' : ''}`} strokeWidth={active ? 2.5 : 2} /><span className="text-[9px] font-black">{label}</span>
  </button>
);

function HistoryTab({ workouts, user, db, appId }) {
  const [delId, setDelId] = useState(null);
  const [eWk, setEWk] = useState(null); 

  const del = async () => { 
    if(delId&&user) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', delId)); 
    setDelId(null); 
  };

  const saveEdit = async () => {
    if(!eWk||!user) return;
    const validBlocks = eWk.blocks.filter(b => b.reps !== '' && b.weight !== '');
    if (validBlocks.length > 0) {
      const formatted = [];
      validBlocks.forEach(b => {
         const numSets = b.sets || 1;
         for (let i = 0; i < numSets; i++) {
            formatted.push({ sets: 1, reps: parseInt(b.reps)||0, weight: parseFloat(b.weight)||0, unit: b.unit||'kg' });
         }
      });
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', eWk.id), { blocks: formatted });
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', eWk.id));
    }
    setEWk(null);
  };

  const updSet = (idx, field, val) => setEWk({ ...eWk, blocks: eWk.blocks.map((s, i) => i === idx ? { ...s, [field]: val } : s) });
  const addSet = () => {
    const last = eWk.blocks[eWk.blocks.length - 1];
    setEWk({ ...eWk, blocks: [...eWk.blocks, { sets: 1, reps: last?.reps||'', weight: last?.weight||'', unit: last?.unit||'kg' }] });
  };
  const remSet = (idx) => setEWk({ ...eWk, blocks: eWk.blocks.filter((_, i) => i !== idx) });

  if (!workouts.length) return <div className="text-center py-16 animate-in fade-in"><Dumbbell className="w-16 h-16 text-zinc-800 mx-auto mb-4" /><h3 className="text-xl font-black text-zinc-600">SIN MARCAS</h3></div>;
  
  const grps = Object.entries(workouts.reduce((acc, w) => { 
    const dateKey = w.date || "Fecha desconocida";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(w);
    return acc; 
  }, {})).sort((a, b) => (b[1][0]?.timestamp||0) - (a[1][0]?.timestamp||0));
  
  return (
    <div className="space-y-6 animate-in fade-in pb-8 relative">
      <h2 className="text-[10px] font-black text-zinc-500 tracking-widest pl-1">HISTORIAL DE BATALLA</h2>
      {grps.map(([dt, wrks]) => (
        <div key={dt} className="bg-zinc-900 border-2 border-zinc-800 shadow-lg">
          <div className="bg-zinc-950 p-3 border-b-2 border-zinc-800"><span className="font-black text-red-500 text-sm">{dt}</span></div>
          <div className="divide-y divide-zinc-800/50">
            {wrks.map(w => {
              let displayBlocks = [];
              if (w.blocks && Array.isArray(w.blocks)) {
                w.blocks.forEach(b => {
                   const numSets = b.sets || 1;
                   for(let i=0; i<numSets; i++) {
                      displayBlocks.push({ reps: b.reps, weight: b.weight, unit: b.unit || 'kg' });
                   }
                });
              }

              return (
                <div key={w.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-white text-xs block">{w.exerciseName}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEWk({...w, blocks: displayBlocks})} className="text-zinc-500 hover:text-blue-500 p-1 transition-colors"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => setDelId(w.id)} className="text-zinc-500 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <div className="space-y-1 pl-2 border-l-2 border-red-600/30">
                    {displayBlocks.map((b, i) => (
                      <div key={i} className="flex justify-between max-w-[200px]">
                        <span className="text-xs font-bold text-zinc-400">SET {i+1}: <span className="text-white">{b.reps}</span> REPS</span>
                        <div className="flex gap-1">
                          <span className="text-zinc-600 font-black">@</span>
                          <span className="text-xs font-black text-red-500">{b.weight === 0 ? 'FALLO / LIBRE' : `${b.weight} ${b.unit}`}</span>
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
      {eWk && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-blue-600 w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div>
                <h3 className="text-xs font-black text-blue-500 tracking-widest">MODIFICAR HIERRO</h3>
                <p className="text-sm font-black text-white mt-1">{eWk.exerciseName}</p>
              </div>
              <button onClick={() => setEWk(null)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
              <div className="flex text-[9px] font-black tracking-widest text-zinc-600 text-center px-1 mb-2">
                <div className="w-8">SET</div><div className="flex-1">PESO</div><div className="flex-1">REPS</div><div className="w-8"></div>
              </div>
              {eWk.blocks.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-black p-1 border border-zinc-800">
                  <div className="w-8 text-center text-xs font-black text-zinc-500">{idx+1}</div>
                  <div className="flex-1 flex bg-zinc-900 border border-zinc-800 focus-within:border-blue-500">
                    <input type="number" value={b.weight} onChange={e=>updSet(idx, 'weight', e.target.value)} className="w-full bg-transparent p-2 text-base font-black text-white text-center outline-none" placeholder="0"/>
                    <button onClick={()=>updSet(idx, 'unit', b.unit==='kg'?'lb':'kg')} className="px-2 text-[10px] font-black text-blue-500 bg-zinc-950">{b.unit}</button>
                  </div>
                  <div className="flex-1">
                    <input type="number" value={b.reps} onChange={e=>updSet(idx, 'reps', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-base font-black text-white text-center outline-none focus:border-blue-500" placeholder="0"/>
                  </div>
                  <div className="w-8 flex justify-center"><button onClick={()=>remSet(idx)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>
                </div>
              ))}
              <button onClick={addSet} className="w-full py-3 mt-4 text-[10px] font-black tracking-widest text-zinc-500 hover:text-blue-500 border border-dashed border-zinc-800 transition-colors">+ AÑADIR SERIE</button>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-black">
              <button onClick={saveEdit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 flex justify-center gap-2 items-center transition-colors">
                <Save className="w-5 h-5"/> SÍ, ACTUALIZAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DESTRUCCIÓN */}
      {delId && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">¿DESTRUIR REGISTRO?</h3>
            <p className="text-xs text-zinc-400 mb-6 font-bold">ESTE EJERCICIO DESAPARECERÁ DE TUS GRÁFICAS Y NO SE PUEDE RECUPERAR.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-black text-[10px]">CANCELAR</button>
              <button onClick={handleDelete} className="flex-[2] py-3 bg-red-600 text-white font-black text-[10px] flex justify-center gap-2 items-center">
                <Trash2 className="w-4 h-4"/> DESTRUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionTab({ user, exercises, onAdd, db, appId }) {
  const [sess, setSess] = useState([]); const [selEx, setSelEx] = useState(''); const [man, setMan] = useState(false); const [mEx, setMEx] = useState(''); const [mod, setMod] = useState(false); const [dt, setDt] = useState(new Date().toISOString().split('T')[0]);
  const adE = (n) => { if(n && !sess.find(e=>e.name===n)){ setSess([...sess, { id: genId(), name: n, sets: [{ id: genId(), reps: '', weight: '', unit: 'kg' }] }]); setSelEx(''); } };
  const handleManual = () => { if (mEx.trim()) { onAdd(mEx); adE(mEx.trim()); setMEx(''); setMan(false); } };
  const addSet = (id) => setSess(sess.map(ex => { if (ex.id === id) { const last = ex.sets[ex.sets.length - 1]; return { ...ex, sets: [...ex.sets, { id: genId(), reps: last?.reps || '', weight: last?.weight || '', unit: last?.unit || 'kg' }] }; } return ex; }));
  const remSet = (eId, sId) => setSess(sess.map(ex => ex.id === eId ? { ...ex, sets: ex.sets.filter(s => s.id !== sId) } : ex));
  const updSet = (eId, sId, f, v) => setSess(sess.map(ex => ex.id === eId ? { ...ex, sets: ex.sets.map(s => s.id === sId ? { ...s, [f]: v } : s) } : ex));
  const remEx = (id) => setSess(sess.filter(ex => ex.id !== id));
  
  const saveSession = async () => {
    if (!sess.length || !user) return; 
    const tD = new Date(dt + 'T12:00:00'); const dS = tD.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); const ts = tD.getTime();
    for (const ex of sess) {
      const val = ex.sets.filter(s => s.reps && s.weight);
      if (val.length) await setDoc(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'workouts')), { exerciseName: ex.name, date: dS, timestamp: ts, blocks: val.map(s => ({ sets: 1, reps: parseInt(s.reps), weight: parseFloat(s.weight), unit: s.unit })) });
    }
    setSess([]); setMod(false);
  };
  return (
    <div className="space-y-6 pb-8 animate-in fade-in">
      <div className="bg-zinc-900 p-4 border border-zinc-800 shadow-xl"><div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800"><div className="flex items-center gap-2 text-zinc-500"><Calendar className="w-4 h-4 text-red-600"/><span className="text-[10px] font-black tracking-widest">FECHA DE SESIÓN:</span></div><input type="date" value={dt} onChange={(e) => setDt(e.target.value)} className="bg-black border border-zinc-700 text-red-500 text-[10px] font-black px-2 py-1 outline-none"/></div><div className="flex justify-between mb-3"><h2 className="text-xs font-black text-white tracking-widest flex items-center gap-2"><Plus className="w-4 h-4 text-red-600" /> AGREGAR EJERCICIO</h2>{!man && <button onClick={() => setMan(true)} className="text-[10px] font-bold text-zinc-400 bg-black px-2 py-1 border border-zinc-800">MANUAL</button>}</div>{man ? (<div className="flex gap-2"><input type="text" value={mEx} onChange={e => setMEx(e.target.value)} placeholder="NOMBRE..." className="flex-1 bg-black border border-zinc-800 p-3 text-base font-bold text-white outline-none" autoFocus /><button onClick={handleManual} className="bg-red-600 text-white px-4 font-black">AÑADIR</button><button onClick={() => setMan(false)} className="bg-zinc-800 text-zinc-400 px-3 font-black">X</button></div>) : (<div className="flex gap-2"><div className="flex-1"><SearchDropdown options={exercises} value={selEx} onChange={setSelEx} onAddNew={n => { onAdd(n); adE(n); }} /></div><button onClick={() => adE(selEx)} disabled={!selEx} className="bg-red-600 disabled:opacity-30 text-white px-4 font-black">AÑADIR</button></div>)}</div>
      <div className="space-y-4">{sess.length === 0 ? <div className="text-center py-10 border-2 border-dashed border-zinc-800"><Dumbbell className="w-10 h-10 text-zinc-800 mx-auto mb-2" /><p className="text-zinc-500 text-xs font-black tracking-widest">SESIÓN VACÍA</p></div> : sess.map((ex, i) => (<div key={ex.id} className="bg-zinc-900 border border-zinc-800 shadow-lg"><div className="bg-black/80 p-3 border-b border-zinc-800 flex justify-between items-center"><span className="font-black text-red-500 text-sm"><span className="text-zinc-700 text-xs">{i + 1}.</span> {ex.name}</span><button onClick={() => remEx(ex.id)} className="text-zinc-600 hover:text-red-500 p-1"><X className="w-5 h-5" /></button></div><div className="p-2 space-y-2"><div className="flex text-[9px] font-black tracking-widest text-zinc-600 text-center px-1"><div className="w-8">SET</div><div className="flex-1">PESO</div><div className="flex-1">REPS</div><div className="w-8"></div></div>{ex.sets.map((set, sI) => (<div key={set.id} className="flex items-center gap-2 bg-black p-1 border border-zinc-800"><div className="w-8 text-center text-xs font-black text-zinc-500">{sI + 1}</div><div className="flex-1 flex bg-zinc-900 border border-zinc-800 focus-within:border-red-600"><input type="number" value={set.weight} onChange={e => updSet(ex.id, set.id, 'weight', e.target.value)} className="w-full bg-transparent p-2 text-base font-black text-white text-center outline-none" placeholder="0" /><button onClick={() => updSet(ex.id, set.id, 'unit', set.unit === 'kg' ? 'lb' : 'kg')} className="px-2 text-[10px] font-black text-red-500 bg-zinc-950">{set.unit}</button></div><div className="flex-1"><input type="number" value={set.reps} onChange={e => updSet(ex.id, set.id, 'reps', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-base font-black text-white text-center outline-none focus:border-red-600" placeholder="0" /></div><div className="w-8 flex justify-center"><button onClick={() => remSet(ex.id, set.id)} className="text-zinc-700 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button></div></div>))}<button onClick={() => addSet(ex.id)} className="w-full py-2.5 mt-2 text-[10px] font-black tracking-widest text-zinc-500 border border-dashed border-zinc-800 hover:bg-zinc-800 transition-colors">+ AÑADIR SERIE</button></div></div>))}</div>
      {sess.length > 0 && <button onClick={() => setMod(true)} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 mt-6 border-4 border-zinc-900 sticky bottom-24 z-20 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"><Save className="w-6 h-6" /> FINALIZAR SESIÓN</button>}
      {mod && <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full shadow-2xl text-center"><AlertTriangle className="w-12 h-12 text-red-500 animate-pulse mx-auto mb-4" /><h3 className="text-lg font-black text-white mb-2">¿GUARDAR ENTRENAMIENTO?</h3><p className="text-xs text-zinc-400 mb-6 font-bold">FECHA: {dt}</p><div className="flex gap-3 mt-6"><button onClick={() => setMod(false)} className="flex-1 py-3 bg-zinc-800 font-black text-xs">VOLVER</button><button onClick={saveSession} className="flex-[2] py-3 bg-red-600 font-black text-xs text-white">SÍ, GUARDAR</button></div></div></div>}
    </div>
  );
}

function SearchDropdown({ options, value, onChange, onAddNew }) {
  const [search, setSearch] = useState(''); const [isOpen, setIsOpen] = useState(false); const ref = useRef(null);
  const filtered = useMemo(() => options.filter(o => o.toLowerCase().includes(search.toLowerCase())), [options, search]);
  useEffect(() => { const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick); }, []);
  return (
    <div className="relative" ref={ref}>
      <div className="flex bg-black border-2 border-zinc-800 focus-within:border-red-600"><div className="pl-3 flex items-center text-zinc-600"><Search className="w-4 h-4" /></div><input type="text" value={isOpen ? search : (value || search)} onChange={e => { setSearch(e.target.value); setIsOpen(true); }} onFocus={() => { setIsOpen(true); if(value) setSearch(value); }} placeholder="BUSCAR..." className="w-full bg-transparent p-3 text-base font-bold text-white outline-none" />{value && !isOpen && <button onClick={() => { onChange(''); setSearch(''); }} className="pr-4 text-zinc-600 p-2">X</button>}</div>
      {isOpen && <div className="absolute w-full mt-1 bg-zinc-900 border-2 border-zinc-800 shadow-2xl z-50 max-h-60 overflow-y-auto">{filtered.map((opt, i) => <div key={i} onMouseDown={() => { onChange(opt); setSearch(opt); setIsOpen(false); }} className="p-3 border-b border-zinc-800 text-sm font-bold text-zinc-300 hover:bg-red-600 hover:text-white cursor-pointer">{opt}</div>)}{search.trim() && <div onMouseDown={() => { onAddNew(search.trim()); setIsOpen(false); }} className="p-3 bg-black text-red-500 text-sm font-black cursor-pointer flex items-center gap-2 border-t-2 border-red-900/50 sticky bottom-0"><Plus className="w-4 h-4" /> CREAR: "{search.toUpperCase()}"</div>}</div>}
    </div>
  );
}

function CoachTab({ workouts, onOps }) {
  const [msgs, setMsgs] = useState([{ role: 'model', text: '¡LISTO PARA OPERAR!\n\nPUEDES DECIRME: \n"Corrige mi sentadilla del 25 de julio a 120kg" \no "Elimina el peso muerto de ayer". \n\nYO ME ENCARGO DEL TRABAJO SUCIO.' }]);
  const [inp, setInp] = useState(''); const [typ, setTyp] = useState(false); const endR = useRef(null);
  useEffect(() => endR.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);
  
  const send = async () => {
    if (!inp.trim()) return; const t = inp.trim(); setMsgs(p => [...p, { role: 'user', text: t }]); setInp(''); setTyp(true);
    try {
      const h = workouts.slice(0, 20).map(w => `ID:[${w.id}] FECHA:[${w.date}] EX:[${w.exerciseName}] -> ` + (w.blocks||[]).map(b => `${b.reps}x${b.weight}${b.unit}`).join(', ')).join('\n');
      const td = new Date().toISOString().split('T')[0];
      
      const sys = `Eres IRON COACH, IA experta y admin de base de datos.
      HISTORIAL ACTUAL (Usa los IDs para ubicar lo que te pide editar o borrar):\n${h || "Vacío"}\n
      INSTRUCCIÓN DE EDICIÓN:
      Si el usuario pide crear, modificar o borrar registros, devuelve este JSON al final:
      \`\`\`json
      {"ops": [
        {"type": "CREATE", "data": {"name": "Pecho", "date": "YYYY-MM-DD", "blocks": [{"sets":4,"reps":10,"weight":80,"unit":"kg"}]}},
        {"type": "UPDATE", "id": "ID_DEL_REGISTRO_AQUI", "data": {"name": "Sentadilla", "date": "YYYY-MM-DD", "blocks": [{"sets":4,"reps":12,"weight":100,"unit":"kg"}]}},
        {"type": "DELETE", "id": "ID_DEL_REGISTRO_AQUI"}
      ]}
      \`\`\`
      Hoy es ${td}. Responde como Gym Bro.`;
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const r = await fetchWithBackoff(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: t }] }], systemInstruction: { parts: [{ text: sys }] } }) });
      let rt = r.candidates[0].content.parts[0].text;
      const mt = rt.match(/```json\n([\s\S]*?)\n```/);
      
      if (mt) { 
        try { 
          const c = JSON.parse(mt[1]); 
          if (c.ops && Array.isArray(c.ops)) { 
            onOps(c.ops); 
            rt = rt.replace(mt[0], '').trim() + `\n\n*(✅ Operación ejecutada)*`; 
          } 
        } catch(e){} 
      }
      setMsgs(p => [...p, { role: 'model', text: rt }]);
    } catch { setMsgs(p => [...p, { role: 'model', text: 'FALLO DE RED. INTENTA DE NUEVO.' }]); } finally { setTyp(false); }
  };
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in">
      <div className="bg-red-950/30 border-2 border-red-900/50 p-4 mb-4 flex items-center gap-3"><div className="p-2 bg-red-600 text-white"><Brain className="w-6 h-6"/></div><div><h2 className="text-sm font-black text-white tracking-widest">IRON COACH AI</h2><p className="text-[10px] text-red-400 font-bold">MODO ADMINISTRADOR</p></div></div>
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 custom-scrollbar">
        {msgs.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 text-sm font-bold whitespace-pre-wrap ${m.role === 'user' ? 'bg-zinc-800 text-white border-r-4 border-zinc-500' : 'bg-black border-2 border-red-900/50 text-zinc-300'}`}>{m.text.split('**').map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}</div></div>))}
        {typ && <div className="max-w-[85%] p-4 bg-black border-2 border-red-900/50 text-red-500 text-sm font-bold flex gap-2"><Activity className="w-4 h-4 animate-spin"/> OPERANDO...</div>}<div ref={endR}/>
      </div>
      <div className="mt-2 bg-black border-2 border-zinc-800 p-2 flex gap-2 focus-within:border-red-600">
        <textarea value={inp} onChange={e=>setInp(e.target.value)} placeholder="EJ: BORRA LA SENTADILLA DEL 25..." className="flex-1 bg-transparent p-3 text-base font-bold text-white outline-none min-h-[60px] max-h-[120px] resize-y" disabled={typ}/>
        <button onClick={send} disabled={!inp.trim()||typ} className="bg-red-600 text-white p-3 hover:bg-red-500 disabled:opacity-50"><Send className="w-5 h-5"/></button>
      </div>
    </div>
  );
}

function ChartsTab({ exercises, workouts }) {
  const [sEx, setSEx] = useState(exercises[0] || ''); const [hP, setHP] = useState(null);
  const data = useMemo(() => {
     return workouts.filter(w => w.exerciseName === sEx).map(w => {
        const maxW = Math.max(...w.blocks.map(b => b.unit === 'lb' ? b.weight / 2.20462 : b.weight), 0);
        return { dS: w.date, ts: w.timestamp, mW: parseFloat(maxW.toFixed(1)) };
     }).sort((a, b) => a.ts - b.ts).slice(-15);
  }, [sEx, workouts]);

  const W = 400; const H = 220; const PX = 20; const PY = 30;
  const cI = useMemo(() => {
    if (data.length < 2) return null;
    const ws = data.map(d => d.mW); const mx = Math.max(...ws); const mn = Math.min(...ws); const rng = (mx - mn) || mx * 0.2 || 10;
    const aMx = mx + (rng * 0.1); const aMn = Math.max(0, mn - (rng * 0.1)); const aRng = aMx - aMn;
    const pts = data.map((d, i) => ({ x: PX + (i / (data.length - 1)) * (W - 2 * PX), y: H - PY - ((d.mW - aMn) / aRng) * (H - 2 * PY), ...d }));
    const lP = `M ${pts[0].x},${pts[0].y} ` + pts.map(p => `L ${p.x},${p.y}`).join(' ');
    const aP = `${lP} L ${pts[pts.length - 1].x},${H - PY} L ${pts[0].x},${H - PY} Z`;
    return { pts, lP, aP, mx, mn };
  }, [data]);

  return (
    <div className="space-y-4 animate-in fade-in pb-8">
      <div className="bg-zinc-950 p-5 border-2 border-zinc-900 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none"/><h2 className="text-xs font-black text-red-600 tracking-widest mb-4 flex gap-2"><Target className="w-4 h-4"/> CURVA DE PROGRESO</h2>
        <div className="relative z-10"><select value={sEx} onChange={e=>setSEx(e.target.value)} className="w-full mb-6 bg-black border-2 border-zinc-800 p-4 text-sm font-black text-white outline-none focus:border-red-600 appearance-none">{exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div>
        {data.length < 2 ? (<div className="h-56 flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-800 text-zinc-600 bg-black/50 z-10 relative"><LineChart className="w-8 h-8 mb-2 opacity-50"/><span className="text-xs font-black tracking-widest text-center">2 SESIONES MÍNIMAS.</span></div>) : (
          <div className="relative w-full h-[250px] bg-black border border-zinc-800 pt-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            {hP && (<div className="absolute z-50 transform -translate-x-1/2 -translate-y-[120%] pointer-events-none" style={{ left: `${(hP.x / W) * 100}%`, top: `${(hP.y / H) * 100}%` }}><div className="bg-zinc-900 border border-red-500/50 p-2 text-center backdrop-blur-md"><p className="text-[10px] text-red-400 font-bold mb-1">{hP.dS}</p><p className="text-lg font-black text-white">{hP.mW} <span className="text-xs">KG</span></p></div><div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 mx-auto"/></div>)}
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible"><defs><linearGradient id="aG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#dc2626" stopOpacity="0.4"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0.0"/></linearGradient><filter id="nG" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              {[0, 0.5, 1].map((s, i) => { const y = PY + s * (H - 2 * PY); return (<g key={i}><line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />{(i === 0 || i === 2) && <text x={PX} y={y - 5} fill="#52525b" fontSize="8" fontWeight="bold" className="font-mono">{i === 0 ? cI.mx : cI.mn} KG</text>}</g>); })}
              <path d={cI.aP} fill="url(#aG)" /><path d={cI.lP} fill="none" stroke="#ef4444" strokeWidth="3" filter="url(#nG)" />
              {cI.pts.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-pointer" onMouseEnter={()=>setHP(p)} onMouseLeave={()=>setHP(null)} onTouchStart={()=>setHP(p)}/><circle cx={p.x} cy={p.y} r={hP===p?"5":"3.5"} fill="#fff" stroke="#dc2626" strokeWidth="2" filter="url(#nG)" className="pointer-events-none transition-all"/><text x={p.x} y={H - 10} fill={hP===p?"#ef4444":"#52525b"} fontSize="7" fontWeight="bold" textAnchor="middle">{p.dS.split(' ')[0]}</text></g>))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolsTab() {
  const [cv, setCv] = useState(''); const [dir, setDir] = useState('kgToLb'); const [w, setW] = useState(''); const [r, setR] = useState('');
  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      <div className="bg-zinc-900 p-5 border-2 border-zinc-800 shadow-lg"><h2 className="text-sm font-black text-white tracking-widest mb-4 flex gap-2 border-b border-zinc-800 pb-3"><Target className="w-5 h-5 text-red-500"/> 1RM</h2><div className="flex gap-2 mb-4"><div className="flex-1"><label className="block text-[10px] text-zinc-500 font-bold mb-1 text-center">PESO</label><input type="number" value={w} onChange={e=>setW(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 p-3 text-base font-black text-white text-center focus:border-red-600 outline-none" /></div><span className="text-zinc-600 font-black mt-4">X</span><div className="flex-1"><label className="block text-[10px] text-zinc-500 font-bold mb-1 text-center">REPS</label><input type="number" value={r} onChange={e=>setR(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 p-3 text-base font-black text-white text-center focus:border-red-600 outline-none" /></div></div><div className="bg-black p-4 border border-zinc-800 flex justify-between items-center"><span className="text-[10px] text-zinc-500 font-bold max-w-[50%]">1RM ESTIMADO:</span><div className="text-2xl font-black text-red-500">{(isNaN(parseFloat(w))||isNaN(parseInt(r))||parseInt(r)<=0)?'0.0':parseInt(r)===1?parseFloat(w).toFixed(1):(parseFloat(w)*(1+parseInt(r)/30)).toFixed(1)}</div></div></div>
      <div className="bg-zinc-900 p-5 border-2 border-zinc-800 text-center shadow-lg"><h2 className="text-sm font-black text-white tracking-widest mb-4 flex justify-center gap-2 border-b border-zinc-800 pb-3"><ArrowRightLeft className="w-5 h-5 text-red-500"/> CONVERSIÓN</h2><div className="flex flex-col gap-4"><div><label className="block text-[10px] text-zinc-500 font-bold mb-2">{dir==='kgToLb'?'KG':'LB'}</label><input type="number" value={cv} onChange={e=>setCv(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 p-4 text-4xl font-black text-white text-center focus:border-red-600 outline-none" /></div><div className="flex justify-center -my-6 z-10 relative"><button onClick={()=>setDir(d=>d==='kgToLb'?'lbToKg':'kgToLb')} className="bg-red-600 text-white p-3 border-4 border-zinc-900"><ArrowRightLeft className="w-5 h-5 rotate-90" strokeWidth={3} /></button></div><div className="bg-zinc-950 p-4 border border-zinc-800"><label className="block text-[10px] text-zinc-500 font-bold mb-2">{dir==='kgToLb'?'LB':'KG'}</label><div className="text-5xl font-black text-red-500 tracking-tighter">{isNaN(parseFloat(cv))?'0.00':dir==='kgToLb'?(parseFloat(cv)*2.20462).toFixed(2):(parseFloat(cv)/2.20462).toFixed(2)}</div></div></div></div>
    </div>
  );
}