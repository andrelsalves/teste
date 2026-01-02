import React, { useState } from 'react';
import { User, UserRole } from '../types/types';
import { Icons } from "../components/constants/icons";

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onUpdateProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User>({ ...user });

  const handleSave = () => {
    onUpdateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
  };

  const InfoCard = ({ label, value, icon }: any) => (
  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[32px] flex flex-col justify-center min-h-[110px]">
    <div className="flex items-center gap-2 text-slate-500 mb-2">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </div>
    {/* break-all força a quebra de linha do e-mail para não cortar */}
    <p className="text-white font-bold break-all whitespace-normal text-sm leading-tight">
      {value}
    </p>
  </div>
);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn py-10 px-4">
      {/* HEADER DE IMPACTO - Transforma a Logo Genérica em Identidade PRO */}
      <div className="relative p-8 bg-slate-900/50 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-800">
              <img 
                src={user.avatar || `https://picsum.photos/seed/${user.id}/200`} 
                className="w-full h-full object-cover" 
                alt="Avatar"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded-xl shadow-lg ring-4 ring-slate-900">
              <Icons.Shield className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h2 className="text-3xl font-black text-white italic tracking-tighter">{user.name}</h2>
              <Icons.CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-[0.2em]">
              {user.role === UserRole.TECNICO ? 'Especialista em Segurança do Trabalho' : 'Gestor de Unidade'}
            </p>
            
            <div className="flex items-center gap-2 mt-4 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 w-fit mx-auto md:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                Perfil Verificado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO E EDIÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-slate-900/40 border border-white/10 rounded-[32px] p-8 space-y-5">
              {[
                { label: 'Nome Completo', value: editData.name, key: 'name', type: 'text' },
                { label: 'Email Corporativo', value: editData.email, key: 'email', type: 'email' },
                { label: 'URL da Foto de Perfil', value: editData.avatar || '', key: 'avatar', type: 'text' }
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <button onClick={handleCancel} className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all">
                  Salvar Alterações
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard label="Email Corporativo" value={user.email} icon={<Icons.Mail className="w-4 h-4" />} />
              <InfoCard label="Registro Profissional" value={user.registrationNumber || 'N/A'} icon={<Icons.FileText className="w-4 h-4" />} mono />
              <InfoCard label="Empresa Vinculada" value={user.companyName || 'Independente'} icon={<Icons.Briefcase className="w-4 h-4" />} />
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] flex flex-col justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ações de Conta</label>
                <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Editar Dados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DE STATUS */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Segurança</p>
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <span className="text-xs text-slate-400">Status</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase">Ativo</span>
              </div>
            </div>
            
            <button onClick={onLogout} className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
              <Icons.LogOut className="w-3 h-3" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, icon, mono }: { label: string; value: string; icon: React.ReactNode; mono?: boolean }) => (
  <div className="bg-slate-900/60 border border-white/10 p-5 rounded-[32px] flex flex-col justify-center min-h-[110px] transition-all hover:border-emerald-500/30">
    <div className="flex items-center gap-2 text-slate-400 mb-2">
      {icon}
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
    </div>
    <p className={`text-white font-extrabold text-base md:text-lg break-all leading-tight`}>
      {value}
    </p>
  </div>
);

export default ProfileView;
