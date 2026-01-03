import React, { useCallback, useMemo, useState } from 'react';
import {
  Appointment,
  User,
  UserRole,
  AppointmentStatus
} from '../../types/types';
import { Icons } from '../constants/icons';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  user: User;
  onClose: () => void;
  updateStatus?: (id: string, status: AppointmentStatus) => Promise<void>;
}

/* ================= CONFIG ================= */

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  [AppointmentStatus.ACCEPTED]: {
    label: 'CONFIRMADO',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  [AppointmentStatus.PENDING]: {
    label: 'AGUARDANDO',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  [AppointmentStatus.REJECTED]: {
    label: 'RECUSADO',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  [AppointmentStatus.COMPLETED]: {
    label: 'CONCLUÍDO',
    color: 'text-slate-400',
    bg: 'bg-slate-800',
    border: 'border-white/5',
  },
  [AppointmentStatus.CANCELLED]: {
    label: '',
    color: '',
    bg: '',
    border: ''
  }
};

/* ================= COMPONENT ================= */

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  user,
  onClose,
  updateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState<AppointmentStatus | null>(null);

  const statusConfig = useMemo(
    () => STATUS_CONFIG[appointment.status],
    [appointment.status]
  );

  const handleAction = useCallback(
    async (newStatus: AppointmentStatus) => {
      if (!updateStatus) return;

      setIsUpdating(newStatus);
      try {
        await updateStatus(appointment.id, newStatus);
        onClose();
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
      } finally {
        setIsUpdating(null);
      }
    },
    [appointment.id, updateStatus, onClose]
  );

  const CloseIcon = Icons.Plus;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-[#1e293b] w-full max-w-md rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        
        {/* Header */}
        <header className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white italic">
              Detalhes da <span className="text-emerald-500 not-italic">Visita</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              ID: {appointment.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition"
          >
            <CloseIcon className="w-5 h-5 rotate-45 text-slate-400 hover:text-white" />
          </button>
        </header>

        {/* Status */}
        <div className="px-8 mb-6">
          <div
            className={`py-3 rounded-2xl flex justify-center border ${statusConfig.bg} ${statusConfig.border}`}
          >
            <span
              className={`text-[11px] font-black uppercase tracking-[0.2em] ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <section className="px-8 pb-8 space-y-4">
          <InfoGrid label="Data" value={appointment.date} />
          <InfoGrid label="Horário" value={appointment.time} />

          <InfoBlock label="Cliente">
            <p className="text-emerald-400 font-black uppercase">
              {appointment.companyName}
            </p>
            {appointment.companyCnpj && (
              <p className="text-[10px] text-slate-500 font-mono">
                {appointment.companyCnpj}
              </p>
            )}
          </InfoBlock>

          <InfoBlock label="Técnico Responsável">
            {appointment.technicianName || 'Aguardando atribuição'}
          </InfoBlock>

          <InfoBlock label="Informações técnicas">
            <p className="font-bold mb-2">{appointment.reason}</p>
            <div className="text-slate-400 text-xs italic border-t border-white/5 pt-3">
              {appointment.description || 'Nenhuma observação adicional.'}
            </div>
          </InfoBlock>
        </section>

        {/* Actions */}
        <footer className="p-8 pt-0 space-y-3">
          {user.role === UserRole.TECNICO &&
            appointment.status === AppointmentStatus.PENDING && (
              <div className="flex gap-3">
                <ActionButton
                  loading={isUpdating === AppointmentStatus.ACCEPTED}
                  onClick={() => handleAction(AppointmentStatus.ACCEPTED)}
                  className="bg-emerald-500 text-slate-950"
                >
                  Aceitar Visita
                </ActionButton>

                <ActionButton
                  loading={isUpdating === AppointmentStatus.REJECTED}
                  onClick={() => handleAction(AppointmentStatus.REJECTED)}
                  className="bg-slate-800 text-red-500 border border-red-500/20"
                >
                  Recusar
                </ActionButton>
              </div>
            )}

          <button
            onClick={onClose}
            disabled={!!isUpdating}
            className="w-full py-4 bg-slate-800/40 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl"
          >
            Fechar Detalhes
          </button>
        </footer>
      </div>
    </div>
  );
};

/* ================= SUBCOMPONENTS ================= */

const InfoGrid = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-[#161e2d] p-4 rounded-2xl border border-white/5">
    <span className="text-[9px] font-bold text-slate-500 uppercase">{label}</span>
    <p className="text-white font-bold text-sm">{value}</p>
  </div>
);

const InfoBlock = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[#161e2d] p-5 rounded-2xl border border-white/5">
    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
      {label}
    </span>
    <div className="text-white text-sm">{children}</div>
  </div>
);

const ActionButton = ({
  children,
  loading,
  onClick,
  className,
}: {
  children: React.ReactNode;
  loading: boolean;
  onClick: () => void;
  className: string;
}) => (
  <button
    disabled={loading}
    onClick={onClick}
    className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      children
    )}
  </button>
);

export default AppointmentDetailsModal;
