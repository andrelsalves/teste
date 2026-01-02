import React, { useState } from 'react';
import { Appointment, User, UserRole, AppointmentStatus } from '../types/types';
import { Icons } from "../components/constants/icons";
import AppointmentDetailsModal from '../components/modal/AppointmentDetailsModal';
import { reportService } from '../services/reportService';

interface HistoryDashboardViewProps {
  appointments: Appointment[];
  user: User;
  loading: boolean;
  getStatusStyle: (status: string) => string;
  onDelete?: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
}

const HistoryDashboardView: React.FC<HistoryDashboardViewProps> = ({
  appointments,
  user,
  loading,
  getStatusStyle,
  onDelete,
  onUpdateStatus
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const statusLabels: Record<string, string> = {
    [AppointmentStatus.PENDING]: 'Aguardando',
    [AppointmentStatus.ACCEPTED]: 'Confirmado',
    [AppointmentStatus.REJECTED]: 'Recusado',
    [AppointmentStatus.COMPLETED]: 'Concluído',
  };

  // LÓGICA DE FILTRO E TRATAMENTO DE DADOS
  const filteredAppointments = appointments.filter(app => 
    app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.technicianName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função auxiliar para formatar a exibição caso os campos date/time estejam vazios
  const formatDateTime = (app: Appointment) => {
    if (app.date && app.time) return { date: app.date, time: app.time };
    
    // Se vier do Supabase como ISO string em 'datetime'
    if (app.datetime) {
      const d = new Date(app.datetime);
      return {
        date: d.toLocaleDateString('pt-BR'),
        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    }
    return { date: 'Data n/a', time: '--:--' };
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic">
            Histórico de <span className="text-emerald-500 not-italic">Visitas</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {user.role === UserRole.EMPRESA
              ? `Registros da unidade: ${user.companyName}`
              : 'Gestão global de atendimentos'}
          </p>
        </div>
      </header>

      {/* BARRA DE BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-2 rounded-[24px] border border-white/5">
        <div className="relative flex-1 w-full group">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Procurar por empresa, motivo ou técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-12 pr-12 text-sm text-white outline-none placeholder:text-slate-600"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <Icons.XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Icons.Filter className="w-3 h-3" />
          {filteredAppointments.length} Encontrados
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data / Hora</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente / CNPJ</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Motivo</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Técnico</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest">
                    Sincronizando com a nuvem...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                    {searchTerm ? "Nenhum resultado para sua busca." : "Nenhum registro encontrado."}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const { date, time } = formatDateTime(app);
                  return (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm">{date}</span>
                          <span className="text-slate-500 text-[10px] font-mono">{time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-emerald-400 font-black text-xs uppercase tracking-tight">
                            {app.companyName || 'Empresa n/a'}
                          </span>
                          <span className="text-slate-500 text-[9px] font-mono">{app.companyCnpj || 'CNPJ não informado'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-300 text-xs font-medium">{app.reason}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-400 text-[11px] font-bold italic">
                          {app.technicianName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                            {statusLabels[app.status] || app.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === AppointmentStatus.COMPLETED && (
                            <button
                              onClick={() => reportService.generateAppointmentPDF(app)}
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 rounded-xl transition-all border border-emerald-500/20"
                              title="Baixar Relatório PDF"
                            >
                              <Icons.Download className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedAppointment(app)}
                            className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 hover:border-white/10"
                            title="Ver Detalhes"
                          >
                            <Icons.Plus className="w-4 h-4" />
                          </button>

                          {user.role === UserRole.EMPRESA && app.status === AppointmentStatus.PENDING && onDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm("Deseja realmente cancelar esta solicitação?")) {
                                  onDelete(app.id);
                                }
                              }}
                              className="p-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all border border-orange-500/10"
                              title="Cancelar Solicitação"
                            >
                              <Icons.XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          user={user}
          updateStatus={onUpdateStatus}
        />
      )}
    </div>
  );
};

export default HistoryDashboardView;
