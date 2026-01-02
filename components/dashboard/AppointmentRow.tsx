import React from 'react';
import { Appointment, UserRole } from '../types/types';
import { Icons } from '../constants/constants';

interface Props {
  appointment: Appointment;
  userRole: UserRole;
  onDelete: (a: Appointment) => void;
  onDetails: (a: Appointment) => void;
  getStatusStyle: (status: string) => string;
}

const AppointmentRow: React.FC<Props> = ({ appointment, userRole, onDelete, onDetails, getStatusStyle }) => (
  <tr className="hover:bg-slate-800/40 transition-all group border-b border-slate-800/50 last:border-0">
    {/* Data e Hora */}
    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
      {appointment.date} <span className="text-slate-500 text-xs ml-1">{appointment.time}</span>
    </td>
    
    {/* Empresa + CNPJ (Foco Contabilidade) */}
    <td className="px-6 py-5">
      <div className="flex flex-col">
        <span className="text-sm text-slate-300 font-semibold uppercase tracking-tight">
          {appointment.companyName}
        </span>
        {appointment.companyCnpj && (
          <span className="text-[10px] text-slate-500 font-mono">
            {appointment.companyCnpj}
          </span>
        )}
      </div>
    </td>
    
    {/* Técnico Responsável (Foco Auditoria) */}
    <td className="px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        <span className="text-xs text-slate-400">
          {appointment.technicianName || 'Aguardando Técnico'}
        </span>
      </div>
    </td>
    
    {/* Status */}
    <td className="px-6 py-5">
      <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all shadow-sm ${getStatusStyle(appointment.status)}`}>
        {appointment.status}
      </span>
    </td>
    
    {/* Ações */}
    <td className="px-6 py-5">
      <div className="flex gap-3 justify-end items-center">
        {userRole === UserRole.EMPRESA && appointment.status === 'PENDING' && (
          <button 
            onClick={() => onDelete(appointment)} 
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Excluir"
          >
            {Icons.Trash2 ? <Icons.Trash2 className="w-4 h-4" /> : <span className="text-[10px] font-bold uppercase">Excluir</span>}
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails(appointment); // Adicionado o argumento 'appointment' que faltava
          }}
          className="text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 transition-all hover:bg-emerald-500/10"
        >
          Detalhes
        </button>
      </div>
    </td>
  </tr>
);

export default AppointmentRow;