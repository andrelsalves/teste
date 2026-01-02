import React from 'react';
import { Appointment } from '../types/types';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAppointmentModal: React.FC<Props> = ({ appointment, onClose, onConfirm }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-950/60">
      <div className="bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-center mb-2">Excluir Agendamento?</h3>
        <p className="text-slate-400 text-center text-sm mb-8">
          {/* Fix: changed company_name to companyName to match Appointment interface definition in types.ts */}
          Deseja remover a visita agendada para <strong>{appointment.companyName}</strong> em {appointment.date}?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAppointmentModal;
