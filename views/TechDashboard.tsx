import React, { useState } from 'react';
import { Icons } from "../components/constants/icons";
import SignatureCanvas from 'react-signature-canvas';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';
import { reportService } from '../services/reportService';

interface TechDashboardProps {
    user: { id: string; name: string; email?: string; };
    appointments: any[];
    stats: { completed: number; pending: number; total: number; };
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

const TechDashboard: React.FC<TechDashboardProps> = ({
    user, appointments, stats, loadAppointments, report, setReport,
    handlePhotoChange, photoPreview, sigCanvas, clearSignature,
    setHasSignature, handleComplete, isFinishing, hasSignature,
    handleAssume, itemForDetails, setItemForDetails
}) => {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Conectado ao Sistema</span>
                </div>
            </header>

            {/* Stats Grid Compacta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[24px] backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Icons.CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Concluídos</span>
                    </div>
                    <span className="text-2xl font-black text-white">{stats.completed}</span>
                </div>
                {/* Repita para outros stats se necessário */}
            </div>

            {/* Lista de Appointments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {appointments.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 uppercase text-xs font-bold">
                        Nenhuma visita encontrada
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:bg-slate-900/60 transition-all">
                            <div className="flex justify-between mb-2">
                                <span className="text-[8px] px-2 py-0.5 rounded-md font-black bg-emerald-500/10 text-emerald-500 uppercase">
                                    {app.status}
                                </span>
                            </div>
                            <h3 className="text-white font-bold text-sm truncate">{app.company_name}</h3>
                            <p className="text-slate-500 text-[10px] mt-1 line-clamp-1 italic">"{app.reason}"</p>
                            
                            <button 
                                onClick={() => setItemForDetails(app)}
                                className="w-full mt-4 py-2 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all"
                            >
                                Gerenciar Visita
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL (Corrigido para usar itemForDetails corretamente) */}
            {itemForDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-2xl flex flex-col max-h-[90vh]">
                        <h3 className="text-xl font-black text-white mb-6 uppercase">
                            {itemForDetails.company_name || "Detalhes da Visita"}
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {/* Campos de Relatório, Foto e Assinatura aqui */}
                            {/* (Use o código do modal que enviei na resposta anterior) */}
                        </div>

                        <button
                            onClick={() => setItemForDetails(null)}
                            className="w-full mt-4 py-2 text-slate-500 text-[10px] font-black uppercase"
                        >
                            Voltar ao Painel
                        </button>
                    </div>
                </div>
            )}

            {/* Botão Flutuante e Modal de Novo Agendamento */}
            {/* ... */}
        </div>
    );
};
export default TechDashboard;
