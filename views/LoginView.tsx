import React, { useState } from 'react';
import { UserRole } from '../types/types';
import { Icons } from "../components/constants/icons";
import { supabase } from '../services/supabaseClient';

const LoginView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.EMPRESA);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Não precisamos chamar onLogin aqui! 
      // O App.tsx vai perceber que o usuário logou através do listener de Auth.
      
    } catch (err: any) {
      setErrorMsg('E-mail ou senha inválidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex flex-col items-center justify-start pt-20 p-6">
      
      {/* Logo e Título */}
      <div className="flex flex-col items-center mb-12 text-center animate-fadeIn">
        <div className="bg-[#1e293b] p-5 rounded-[24px] mb-6 border border-slate-700 shadow-xl">
          <Icons.Shield className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-5xl font-black text-white mb-2 italic tracking-tighter">
          SST <span className="text-emerald-500">PRO</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Gestão Ocupacional
        </p>
      </div>

      <div className="w-full max-w-[400px] bg-[#1e293b]/40 backdrop-blur-md border border-white/5 rounded-[32px] p-10 shadow-2xl animate-slideUp">
        
        {/* Seletor Visual (Apenas Estético) */}
        <div className="flex p-1 bg-[#0b1120] rounded-[18px] mb-10 border border-slate-800">
          <button 
            type="button"
            onClick={() => setActiveRole(UserRole.EMPRESA)} 
            className={`flex-1 py-3 text-[10px] font-black rounded-[14px] transition-all ${activeRole === UserRole.EMPRESA ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
          >
            EMPRESA
          </button>
          <button 
            type="button"
            onClick={() => setActiveRole(UserRole.TECNICO)} 
            className={`flex-1 py-3 text-[10px] font-black rounded-[14px] transition-all ${activeRole === UserRole.TECNICO ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
          >
            TÉCNICO
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-[10px] font-bold uppercase text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {errorMsg}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-900 font-black py-5 rounded-[20px] shadow-lg shadow-emerald-500/20 uppercase text-[11px] tracking-widest transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                Carregando...
              </div>
            ) : 'Entrar na Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
