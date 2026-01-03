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

    // Função para finalizar e gerar PDF simultaneamente
    const onFinishHandle = async () => {
        if (!itemForDetails) return;
        
        // 1. Gera o PDF com os dados atuais
        await reportService.generateAppointmentPDF({
            ...itemForDetails,
            description: report, // Passa o relatório escrito
            technicianName: user.name
        });

        // 2. Chama a função original de persistência no banco
        await handleComplete();
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
            </div>

            {/* Lista de Appointments Minimalista */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {appointments.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 uppercase text-xs font-bold">
                        Nenhuma visita encontrada
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:bg-slate-900/60 transition-all">
                            <div className="flex justify-between mb-2">
                                <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter border ${
                                    app.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                }`}>
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

            {/* MODAL DE GERENCIAMENTO */}
            {itemForDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-2xl flex flex-col max-h-[90vh]">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">
                            {itemForDetails.company_name}
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {/* Relatório Técnico */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Relatório da Visita</label>
                                <textarea
                                    value={report}
                                    onChange={(e) => setReport(e.target.value)}
                                    placeholder="Descreva as atividades..."
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm min-h-[100px] outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            {/* Evidência Fotográfica */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Foto do Serviço</label>
                                <div className="relative h-32 bg-slate-900/50 border-2 border-dashed border-white/5 rounded-2xl overflow-hidden group">
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                                    {photoPreview ? (
                                        <img src={photoPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600 group-hover:text-emerald-500 transition-colors">
                                            <Icons.Camera className="w-6 h-6 mb-1" />
                                            <span className="text-[8px] font-bold uppercase tracking-tighter">Anexar Evidência</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assinatura do Cliente */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assinatura do Cliente</label>
                                    <button onClick={clearSignature} className="text-[8px] text-rose-500 font-black uppercase">Limpar</button>
                                </div>
                                <div className="bg-white rounded-2xl h-32 overflow-hidden shadow-inner">
                                    <SignatureCanvas
                                        ref={sigCanvas as any}
                                        onEnd={() => setHasSignature(true)}
                                        penColor="black"
                                        canvasProps={{ className: "w-full h-full" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ações Finais */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={onFinishHandle}
                                disabled={isFinishing || !hasSignature || !report}
                                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                    isFinishing || !hasSignature || !report
                                    ? 'bg-slate-800 text-slate-600'
                                    : 'bg-emerald-500 text-slate-950 hover:scale-[1.02] shadow-xl shadow-emerald-500/20'
                                }`}
                            >
                                {isFinishing ? 'Sincronizando...' : 'Finalizar Atendimento'}
                            </button>
                            
                            <button
                                onClick={() => setItemForDetails(null)}
                                className="w-full text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Voltar ao Painel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Botão Flutuante + */}
            <button
                onClick={() => setIsNewModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Icons.Plus className="w-7 h-7" />
            </button>

            {/* MODAL DE AGENDAMENTO */}
            {isNewModalOpen && (
                <NewAppointmentModal
                    technicianId={user.id}
                    onClose={() => setIsNewModalOpen(false)}
                    onSuccess={() => {
                        loadAppointments();
                        setIsNewModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default TechDashboard;
