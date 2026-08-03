import React, { useState } from 'react';
import { User, LogIn, UserPlus, X, LogOut, ShieldCheck, Mail, Lock } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegister) {
      const res = await firebaseService.registerWithEmail(email, password, name);
      if (!res.success) setErrorMsg(res.error || 'Error al crear cuenta');
      else onClose();
    } else {
      const res = await firebaseService.loginWithEmail(email, password);
      if (!res.success) setErrorMsg(res.error || 'Credenciales incorrectas');
      else onClose();
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const res = await firebaseService.loginWithGoogle();
    if (!res.success) setErrorMsg(res.error || 'Error con Google Sign-In');
    else onClose();
    setLoading(false);
  };

  const handleLogout = async () => {
    await firebaseService.logout();
    onClose();
  };

  const isAnonymous = currentUser && currentUser.isAnonymous;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-red-600 p-6 max-w-sm w-full shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" /> MI CUENTA / MULTI-USUARIO
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SI EL USUARIO YA ESTÁ LOGUEADO CON CUENTA (NO ANÓNIMA) */}
        {currentUser && !isAnonymous ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-600 flex items-center justify-center mx-auto text-xl font-black text-white uppercase">
              {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
            </div>

            <div>
              <h4 className="text-sm font-black text-white uppercase">
                {currentUser.displayName || 'USUARIO IRON'}
              </h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
            </div>

            <div className="bg-black p-3 border border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase">
              🟢 Tus entrenamientos están vinculados a tu cuenta y sincronizados en la Nube de Google.
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-zinc-800 hover:bg-red-600 text-white font-black py-3 uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> CERRAR SESIÓN
            </button>
          </div>
        ) : (
          /* FORMULARIO DE LOGIN / REGISTRO */
          <div className="space-y-4">
            <div className="flex bg-black p-1 border border-zinc-800 text-xs font-black">
              <button
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                className={`flex-1 py-2 uppercase transition-colors ${!isRegister ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
              >
                INGRESAR
              </button>
              <button
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                className={`flex-1 py-2 uppercase transition-colors ${isRegister ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
              >
                CREAR CUENTA
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-800 p-2.5 text-[10px] font-bold text-red-300 text-center uppercase">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold mb-1 uppercase">NOMBRE</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="TU NOMBRE..."
                    className="w-full bg-black border border-zinc-800 p-3 text-xs font-bold text-white outline-none focus:border-red-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1 uppercase">CORREO ELECTRÓNICO</label>
                <div className="flex bg-black border border-zinc-800 focus-within:border-red-600">
                  <div className="p-3 text-zinc-500"><Mail className="w-4 h-4" /></div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="atleta@ejemplo.com"
                    className="w-full bg-transparent p-3 pl-0 text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1 uppercase">CONTRASEÑA</label>
                <div className="flex bg-black border border-zinc-800 focus-within:border-red-600">
                  <div className="p-3 text-zinc-500"><Lock className="w-4 h-4" /></div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent p-3 pl-0 text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 uppercase text-xs tracking-wider flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isRegister ? 'CREAR MI CUENTA' : 'INICIAR SESIÓN'}
              </button>
            </form>

            <div className="relative text-center my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
              <span className="relative bg-zinc-900 px-2 text-[9px] font-black text-zinc-500 uppercase">O CONTINÚA CON</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-black hover:bg-zinc-800 border border-zinc-700 text-white font-black py-2.5 text-xs uppercase flex justify-center items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              GOOGLE SIGN-IN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
