import React, { useCallback, useMemo, useState } from 'react';
import { Appointment, AppointmentStatus, User, UserRole } from '../../types/types';
import { Icons } from '../constants/icons';
import { useAppointments } from '../../providers/AppointmentProvider';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  user: User;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: 'AGUARDANDO',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  ACCEPTED: {
    label: 'CONFIRMADO',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  REJECTED: {
    label: 'RECUSADO',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  COMPLETED: {
    label: 'CONCLUÍDO',
    color: 'text-slate-400',
    bg: 'bg-slate-800',
    border: 'border-white/5',
  },
  CANCELLED: {
    label: 'CANCELADO',
    color: 'text-slate-500',
    bg: 'bg-slate-800',
    border: 'border-white/5',
  },
};

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  user,
  onClose,
}) => {
  const { updateStatus } = useAppointments();
  const [loading, setLoading] = useState<AppointmentStatus | null>(null);

  const statusUI = useMemo(
    () => STATUS_CONFIG[appointment.status],
    [appointment.status]
  );

  const handleAction = useCallback(
    async (newStatus: AppointmentStatus) => {
      setLoading(newStatus);
      await updateStatus(
        appointment.id,
        newStatus,
        user.role === UserRole.TECNICO ? user.id : undefined
      );
      setLoading(null);
      onClose();
    },
    [appointment.id, user, updateStatus, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-6">
        <header className="flex justify-between items-start">
          <h3 className="text-xl font-black text-white">Detalhes da Visita</h3>
          <button onClick={onClose}>
            <Icons.XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        <div className={`py-2 text-center rounded-xl border ${statusUI.bg} ${statusUI.border}`}>
          <span className={`text-xs font-black uppercase ${statusUI.color}`}>
            {statusUI.label}
          </span>
        </div>

        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Empresa:</strong> {appointment.companyName}</p>
          <p><strong>Motivo:</strong> {appointment.reason}</p>
          <p><strong>Data:</strong> {appointment.date}</p>
          <p><strong>Hora:</strong> {appointment.time}</p>
        </div>

        {user.role === UserRole.TECNICO &&
          appointment.status === AppointmentStatus.PENDING && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(AppointmentStatus.ACCEPTED)}
                disabled={loading === AppointmentStatus.ACCEPTED}
                className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-xl"
              >
                Aceitar
              </button>
              <button
                onClick={() => handleAction(AppointmentStatus.REJECTED)}
                disabled={loading === AppointmentStatus.REJECTED}
                className="flex-1 py-3 bg-red-500/10 text-red-500 font-black rounded-xl"
              >
                Recusar
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
