import React, { useState, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { Icons } from '../components/constants/icons';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';
import { reportService } from '../services/report/reportService';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentStatus } from '../types/types';
import SignatureCanvas from 'react-signature-canvas';


const TechDashboard: React.FC = () => {
    const { user } = useAuth();
    const {
        appointments,
        stats,
        loadAppointments,
        updateStatus
    } = useAppointments();

    // Estados para Controle de UI
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [itemForDetails, setItemForDetails] = useState<any>(null);
    const [report, setReport] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [hasSignature, setHasSignature] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const sigCanvas = useRef<any>(null);

    /* ===========================
       Handlers
    =========================== */
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
        setHasSignature(false);
    };

    const handleComplete = useCallback(async () => {
        if (!itemForDetails || !sigCanvas.current || !user) return;

        try {
            setIsFinishing(true);
            const signature = sigCanvas.current.toDataURL();

            await reportService.generateAppointmentPDF(
                {
                    ...itemForDetails,
                    description: report,
                    technicianName: user.name
                },
                photoPreview,
                signature
            );

            await updateStatus(
                itemForDetails.id,
                AppointmentStatus.COMPLETED,
                user.id
            );

            await loadAppointments();
            setItemForDetails(null);
            setReport('');
            setPhotoPreview(null);
            setHasSignature(false);
        } catch (error) {
            console.error("Erro ao finalizar:", error);
        } finally {
            setIsFinishing(false);
        }
    }, [itemForDetails, report, photoPreview, user, updateStatus, loadAppointments]);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-fadeIn pb-20 relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        Painel de <span className="text-emerald-500">Serviços</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {user.name} • {appointments?.length ?? 0} Atendimentos Encontrados
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Conectado ao Sistema</span>
                </div>
            </header>

            {/* Stats Grid */}
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
                {/* Você pode adicionar mais Stats aqui se quiser */}
            </div>

            {/* Lista de Appointments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {appointments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border border-dashed border-white/10">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma visita agendada</p>
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:bg-slate-900/60 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter border ${
                                    app.status === 'COMPLETED' 
                                    ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                                    : 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                }`}>
                                    {app.status}
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-sm leading-tight truncate mb-4">
                                {app.company_name || app.companyName}
                            </h3>
                            
                            <p className="text-slate-400 text-[8px] italic line-clamp-1">
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

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Motivo</p>
                                    <p className="text-white text-xs font-bold">{itemForDetails.reason}</p>
                                </div>
                                <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Data/Hora</p>
                                    <p className="text-white text-xs font-bold">
                                        {itemForDetails.datetime ? new Date(itemForDetails.datetime).toLocaleString('pt-BR') : '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">Relatório</label>
                                    <textarea
                                        value={report}
                                        onChange={(e) => setReport(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white text-sm h-32 resize-none"
                                        placeholder="Atividades realizadas..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">Evidência</label>
                                    <div className="relative h-32 border-2 border-dashed border-white/10 rounded-2xl bg-slate-800/30 overflow-hidden">
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                                        {photoPreview ? (
                                            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                                <Icons.Camera className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] uppercase font-bold">Anexar Foto</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] text-slate-400 font-black uppercase">Assinatura Cliente</label>
                                        <button onClick={clearSignature} className="text-[9px] text-rose-500 font-black uppercase">Limpar</button>
                                    </div>
                                    <div className="bg-white rounded-2xl h-40 overflow-hidden">
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleComplete}
                                disabled={isFinishing || !hasSignature || !report}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                                    isFinishing || !hasSignature || !report
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-500 text-slate-950 hover:scale-[1.02]'
                                }`}
                            >
                                {isFinishing ? 'Sincronizando...' : 'Finalizar Atendimento'}
                            </button>
                        </div>
                        <button onClick={() => setItemForDetails(null)} className="w-full mt-4 text-slate-500 text-[10px] font-black uppercase">Voltar ao Painel</button>
                    </div>
                </div>
            )}

            {/* Botão Flutuante */}
            <button
                onClick={() => setIsNewModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl z-40 hover:scale-110 active:scale-95 transition-all"
            >
                <Icons.Plus className="w-7 h-7" />
            </button>

            {isNewModalOpen && (
                <NewAppointmentModal
                    technicianId={user.id}
                    onClose={() => setIsNewModalOpen(false)}
                    onSuccess={() => { loadAppointments(); setIsNewModalOpen(false); }}
                />
            )}
        </div>
    );
};

export default TechDashboard;
