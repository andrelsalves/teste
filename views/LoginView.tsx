import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icons } from '../components/constants/icons';
import { UserRole } from '../types/types';

export default function LoginView() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.TECNICO);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f1a] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Área da Logo */}
      <div className="flex flex-col items-center mb-10 animate-fadeIn">
        <div className="bg-[#161b2c] p-4 rounded-2xl border border-white/5 mb-4 shadow-2xl">
          <Icons.Shield className="w-8 h-8 text-[#10b981]" />
        </div>
        <h1 className="text-4xl font-black text-white italic tracking-tighter">
          SST <span className="text-[#10b981]">PRO</span>
        </h1>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] mt-2">
          Gestão Ocupacional
        </p>
      </div>

      {/* Card de Login - Estilo da Foto */}
      <div className="w-full max-w-[420px] bg-[#111625] border border-white/5 rounded-[40px] p-10 shadow-2xl relative">
        {/* Glow effect sutil interno */}
        <div className="absolute inset-0 rounded-[40px] bg-emerald-500/5 blur-3xl -z-10" />
        
        <form onSubmit={handleLogin} className="relative z-10">
          
          {/* Seletor Estilo Pílula */}
          <div className="flex p-1.5 bg-[#080c16] rounded-2xl mb-10 border border-white/5">
            <button 
              type="button"
              onClick={() => setActiveRole(UserRole.EMPRESA)} 
              className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all duration-300 ${
                activeRole === UserRole.EMPRESA 
                ? 'bg-[#10b981] text-[#080c16] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              EMPRESA
            </button>
            <button 
              type="button"
              onClick={() => setActiveRole(UserRole.TECNICO)} 
              className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all duration-300 ${
                activeRole === UserRole.TECNICO 
                ? 'bg-[#10b981] text-[#080c16] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              TÉCNICO
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#080c16] border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/30 transition-all text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#080c16] border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/30 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <p className="text-rose-500 text-[10px] font-bold uppercase text-center animate-shake">
                {errorMsg}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#0da371] disabled:bg-slate-800 disabled:text-slate-600 text-[#080c16] font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.98] mt-4"
            >
              {loading ? 'Entrando...' : 'Entrar na Plataforma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
