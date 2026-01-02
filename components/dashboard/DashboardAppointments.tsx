import React from 'react';
import { Appointment, AppointmentStatus } from '../../types/types';
import { Icons } from '../../constants/icons';
import { pdfService } from '../../utils/pdfService';

interface DashboardAppointmentsProps {
  appointments: Appointment[];
  // Mantive o nome da prop que você já usava no seu código original
  onUpdateStatus: (id: string, status: any) => void;
  // Adicionei esta para abrir o modal de detalhes/relatório
  onSelectItem: (app: Appointment) => void;
}

const DashboardAppointments: React.FC<DashboardAppointmentsProps> = ({
  appointments,
  onUpdateStatus,
  onSelectItem
}) => {

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pendente', color: 'text-amber-500 border-amber-500/20 bg-amber-500/5', icon: <Icons.Clock className="w-4 h-4" /> };
      case 'ACCEPTED':
        return { label: 'Em Andamento', color: 'text-blue-500 border-blue-500/20 bg-blue-500/5', icon: <Icons.Shield className="w-4 h-4" /> };
      case 'COMPLETED':
        return { label: 'Concluído', color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', icon: <Icons.CheckCircle className="w-4 h-4" /> };
      default:
        return { label: 'Cancelado', color: 'text-red-500 border-red-500/20 bg-red-500/5', icon: <Icons.XCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.length > 0 ? (
        appointments.map((app) => {
          const info = getStatusInfo(app.status);
          const isUnassigned = !app.technicianId;

          return (
            <div
              key={app.id}
              className={`group relative overflow-hidden bg-slate-900/40 border rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] ${isUnassigned ? 'border-amber-500/30 bg-amber-500/[0.03]' : 'border-white/5 hover:border-emerald-500/30'
                }`}
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${info.color}`}>
                  {isUnassigned ? 'Oportunidade Aberta' : info.label}
                </span>
                <div className={`p-2 rounded-xl ${info.color}`}>
                  {info.icon}
                </div>
              </div>

              {/* Informações da Empresa */}
              <div className="mb-6">
                <h3 className="text-white font-black text-xl mb-1 group-hover:text-emerald-400 transition-colors leading-tight">
                  {app.companyName}
                </h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <Icons.Calendar className="w-3 h-3 text-emerald-500" />
                  <p className="text-[11px] font-bold uppercase tracking-tight">
                    {app.date} • {app.time}
                  </p>
                </div>
              </div>

              {/* Motivo/Serviço */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Serviço Solicitado</p>
                <p className="text-slate-300 text-sm font-medium italic line-clamp-1">"{app.reason}"</p>
              </div>

              {/* Ações Inteligentes */}
              <div className="flex gap-2">
                {isUnassigned ? (
                  <button
                    onClick={() => onSelectItem(app)}
                    className="flex-1 bg-amber-500 text-slate-950 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                  >
                    Assumir Visita
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectItem(app)}
                      className="flex-1 bg-white/5 text-white py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    >
                      {app.status === 'COMPLETED' ? 'Ver Detalhes' : 'Gerenciar Atendimento'}
                    </button>

                    {/* NOVO: Botão de PDF visível apenas se concluído */}
                    {app.status === 'COMPLETED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Evita abrir o modal ao clicar no PDF
                          pdfService.generateVisitReport(app);
                        }}
                        className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-slate-950 transition-all border border-emerald-500/20"
                        title="Baixar Relatório PDF"
                      >
                        <Icons.FileText className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}

                {/* Botão de Cancelar rápido */}
                {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'CANCELLED')}
                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    title="Cancelar"
                  >
                    <Icons.XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border border-dashed border-white/5">
          <Icons.Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold italic">Nenhum serviço encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardAppointments;
