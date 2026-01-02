import React, { useState } from 'react';
import { Appointment, User, UserRole, AppointmentStatus } from '../../types/types';
import { Icons } from '../constants/icons';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  user: User;
  updateStatus?: (id: string, status: AppointmentStatus) => Promise<void>;
}

// Configuração atualizada com os novos Enums e Cores
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; border: string }> = {
  [AppointmentStatus.ACCEPTED]: { label: 'CONFIRMADO', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  [AppointmentStatus.PENDING]: { label: 'AGUARDANDO', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  [AppointmentStatus.REJECTED]: { label: 'RECUSADO', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  [AppointmentStatus.COMPLETED]: { label: 'CONCLUÍDO', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-white/5' },
};

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ 
  appointment, 
  onClose,
  user,
  updateStatus
}) => {
  const [isUpdating, setIsUpdating] = useState<AppointmentStatus | null>(null);

  if (!appointment) return null;
  
  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG[AppointmentStatus.PENDING];
  const PlusIcon = Icons.Plus || (() => null);

  const handleAction = async (newStatus: AppointmentStatus) => {
    if (!updateStatus) return;
    setIsUpdating(newStatus);
    try {
      await updateStatus(appointment.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md animate-fadeIn" onClick={onClose} />

      <div className="relative bg-[#1e293b] w-full max-w-md rounded-[32px] border border-white/10 shadow-2xl flex flex-col animate-slideUp overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight italic">
              Detalhes da <span className="text-emerald-500 not-italic">Visita</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              ID: {appointment.id?.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
            <PlusIcon className="w-5 h-5 text-slate-500 group-hover:text-white rotate-45" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-8 mb-6">
          <div className={`w-full py-3 rounded-2xl flex justify-center items-center ${statusConfig.bg} border ${statusConfig.border} shadow-inner`}>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="px-8 pb-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161e2d] p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Data</span>
              <p className="text-white font-bold text-sm">{appointment.date}</p>
            </div>
            <div className="bg-[#161e2d] p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Horário</span>
              <p className="text-white font-bold text-sm">{appointment.time}</p>
            </div>
          </div>

          <div className="bg-[#161e2d] p-5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Cliente</span>
            <p className="text-emerald-400 font-black text-lg uppercase leading-tight">{appointment.companyName}</p>
            {appointment.companyCnpj && (
               <p className="text-[10px] text-slate-500 font-mono mt-1">{appointment.companyCnpj}</p>
            )}
          </div>

          <div className="bg-[#161e2d] p-5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Técnico Responsável</span>
            <p className="text-white font-bold text-sm">
              {appointment.technicianName || "Aguardando atribuição"}
            </p>
          </div>

          <div className="bg-[#161e2d] p-5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Informações técnicas</span>
            <p className="text-white font-bold text-sm mb-2">{appointment.reason}</p>
            <div className="text-slate-400 text-[12px] leading-relaxed italic border-t border-white/5 pt-3">
              {appointment.description || "Nenhuma observação adicional."}
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-8 pt-0 space-y-3">
          {user.role === UserRole.TECNICO && appointment.status === AppointmentStatus.PENDING && (
            <div className="flex gap-3">
              <button 
                disabled={!!isUpdating}
                onClick={() => handleAction(AppointmentStatus.ACCEPTED)}
                className="flex-1 py-4 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95"
              >
                {isUpdating === AppointmentStatus.ACCEPTED ? (
                  <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : 'Aceitar Visita'}
              </button>

              <button 
                disabled={!!isUpdating}
                onClick={() => handleAction(AppointmentStatus.REJECTED)}
                className="flex-1 py-4 bg-slate-800 text-red-500 text-[10px] font-black uppercase rounded-2xl border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all active:scale-95"
              >
                {isUpdating === AppointmentStatus.REJECTED ? (
                  <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                ) : 'Recusar'}
              </button>
            </div>
          )}
          
          <button 
            disabled={!!isUpdating}
            onClick={onClose}
            className="w-full py-4 bg-slate-800/40 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
