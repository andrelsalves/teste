import React, { useState } from 'react';
import { Icons } from "../components/constants/icons";
import { AppointmentStatus } from '../types/types';
import SignatureCanvas from 'react-signature-canvas';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';

// 1. Defina o contrato do que o Dashboard recebe
interface TechDashboardProps {
    user: {
        id: string;
        name: string;
        email?: string;
    };
    appointments: any[]; // Se tiver o tipo Appointment, use Appointment[]
    stats: {
        completed: number;
        pending: number;
        total: number;
    };
    loadAppointments: () => Promise<void>;
    report: string;
    setReport: (value: string) => void;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    photoPreview: string | null;
    sigCanvas: React.MutableRefObject<SignatureCanvas | null>;
    clearSignature: () => void;
    setHasSignature: (value: boolean) => void;
    handleComplete: () => Promise<void>;
    isFinishing: boolean;
    hasSignature: boolean;
    handleAssume: (id: string) => Promise<void>;
    itemForDetails: any | null;
    setItemForDetails: (item: any | null) => void;
}

// 2. Aplique a interface no componente
const TechDashboard: React.FC<TechDashboardProps> = ({
    user, appointments, stats, loadAppointments, report, setReport,
    handlePhotoChange, photoPreview, sigCanvas, clearSignature,
    setHasSignature, handleComplete, isFinishing, hasSignature,
    handleAssume, itemForDetails, setItemForDetails
}) => {

    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
            case 'ACCEPTED': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
            case 'COMPLETED': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
            default: return 'text-slate-500 border-slate-500/20 bg-slate-500/5';
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20 relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        Painel de <span className="text-emerald-500">Serviços</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {user.name} • {appointments.length} Atendimentos Encontrados
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter tracking-widest">Conectado ao Sistema</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[24px] backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Icons.CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concluídos</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats.completed}</span>
                    </div>
                </div>
                {/* Outros stats seguem o mesmo padrão... */}
            </div>

            {/* Lista de Appointments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border border-dashed border-white/5">
                        <Icons.Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold italic">Nenhum serviço disponível no momento.</p>
                    </div>
                ) : (
                    appointments.map(app => (
                        <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-5 hover:bg-slate-900/60 transition-all group">
  {/* Status Badge - Diminuído */}
  <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter bg-emerald-500/10 text-emerald-500">
    {appointment.status}
  </span>

  {/* Informações Principais - Compactadas */}
  <div className="mt-3">
    <h3 className="text-white font-bold text-sm leading-tight group-hover:text-emerald-400 transition-colors">
      {appointment.company_name}
    </h3>
    <p className="text-slate-500 text-[10px] mt-1 italic">
      "{appointment.reason}"
    </p>
  </div>

  {/* Botão Gerenciar - Mais fino e minimalista */}
  <button className="w-full mt-4 py-2.5 bg-slate-800/50 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
    Gerenciar Visita
  </button>
</div>

            {/* Modal de Detalhes Dinâmico */}
            {itemForDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[40px] border border-white/10 p-8 shadow-2xl animate-slideUp">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">{itemForDetails.companyName}</h3>

                        {/* Renderização condicional de ações aqui (Aceitar ou Finalizar) */}
                        {/* ... (Seu conteúdo de assinatura e relatório) ... */}

                        <button
                            onClick={() => setItemForDetails(null)}
                            className="w-full mt-4 py-4 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors"
                        >
                            Voltar ao Painel
                        </button>
                    </div>
                </div>
            )}

            {/* BOTÃO FLUTUANTE DE NOVA VISITA (+) */}
            <button
                onClick={() => setIsNewModalOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Icons.Plus className="w-8 h-8" />
            </button>

            {/* MODAL DE AGENDAMENTO */}
            {isNewModalOpen && (
                <NewAppointmentModal
                    technicianId={user.id}
                    onClose={() => setIsNewModalOpen(false)}
                    onSuccess={() => {
                        loadAppointments();
                        setIsNewModalOpen(false); // Fecha o modal após o sucesso
                    }}
                />
            )}
        </div>
    );
};

export default TechDashboard;
