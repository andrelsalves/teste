import React, { useState } from 'react';
import { Icons } from "../components/constants/icons";
import { AppointmentStatus } from '../types/types';
import SignatureCanvas from 'react-signature-canvas';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';

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

            {/* Lista de Appointments - CORRIGIDA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {appointments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border border-dashed border-white/10">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma visita agendada</p>
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:bg-slate-900/60 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter border ${app.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                    }`}>
                                    {app.status}
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-sm leading-tight truncate mb-4" title={app.company_name}>
                                {app.company_name}
                            </h3>
                            {/* Texto motivos de visita */}
                            <p className="text-slate-400 text-[8px] fonte-white mt-50 italic line-clamp-1">
                                "{app.reason}"
                            </p>

                            <button
                                onClick={() => setItemForDetails(app)}
                                className="w-full mt-4 py-2 bg-slate-800/50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all"
                            >
                                Gerenciar Visita
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Detalhes Dinâmico */}
            {itemForDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[40px] border border-white/10 p-8 shadow-2xl animate-slideUp">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
                            {itemForDetails.company_name || itemForDetails.companyName}
                        </h3>

                        {/* Conteúdo Interno do Modal de Detalhes */}
                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                            {/* Informações da Visita */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Motivo</p>
                                    <p className="text-white text-xs font-bold">{itemForDetails.reason}</p>
                                </div>
                                <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Data/Hora</p>
                                    <p className="text-white text-xs font-bold">
                                        {new Date(itemForDetails.datetime).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Seção de Relatório e Assinatura (Aparece apenas se o técnico aceitou a visita) */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">
                                        Relatório da Visita
                                    </label>
                                    <textarea
                                        value={report}
                                        onChange={(e) => setReport(e.target.value)}
                                        placeholder="Descreva as atividades realizadas..."
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors h-32 resize-none"
                                    />
                                </div>

                                {/* Captura de Foto */}
                                <div>
                                    <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">
                                        Evidência Fotográfica
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-slate-800/30 group-hover:bg-slate-800/50 transition-all overflow-hidden">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Icons.Camera className="w-6 h-6 text-slate-500 mb-2" />
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Tirar ou anexar foto</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Assinatura Digital */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="text-[10px] text-slate-400 font-black uppercase">
                                            Assinatura do Cliente
                                        </label>
                                        <button
                                            onClick={clearSignature}
                                            className="text-[9px] text-rose-500 font-black uppercase hover:text-rose-400"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-2xl overflow-hidden h-40">
                                        <SignatureCanvas
                                            ref={sigCanvas as any}
                                            onEnd={() => setHasSignature(true)}
                                            penColor="black"
                                            canvasProps={{ className: "w-full h-full" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botão de Finalização Principal */}
                            <button
                                onClick={handleComplete}
                                disabled={isFinishing || !hasSignature || !report}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isFinishing || !hasSignature || !report
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {isFinishing ? 'Sincronizando...' : 'Finalizar Atendimento'}
                            </button>
                        </div>
                        <button
                            onClick={() => setItemForDetails(null)}
                            className="w-full mt-4 py-4 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors"
                        >
                            Voltar ao Painel
                        </button>
                    </div>
                </div>
            )}

            {/* BOTÃO FLUTUANTE */}
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
