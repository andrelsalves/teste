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
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const onFinishHandle = async () => {
        if (!itemForDetails || !sigCanvas.current) return;

        try {
            const signatureData = sigCanvas.current.toDataURL();
            
            // 1. Gera o PDF
            await reportService.generateAppointmentPDF(
                { ...itemForDetails, description: report, technicianName: user.name },
                photoPreview,
                signatureData
            );

            // 2. Salva no Banco
            await handleComplete();

            // 3. Muda para o modal de sucesso
            setShowSuccessModal(true);
            // setItemForDetails(null); // Opcional: fechar o modal de edição
        } catch (error) {
            console.error("Erro ao finalizar:", error);
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
                        {user.name} • {appointments.length} Atendimentos
                    </p>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[24px]">
                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Concluídos</span>
                    <span className="text-2xl font-black text-white">{stats.completed}</span>
                </div>
            </div>

            {/* Lista de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {appointments.map((app) => (
                    <div key={app.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                        <h3 className="text-white font-bold text-sm truncate">{app.company_name}</h3>
                        <button 
                            onClick={() => setItemForDetails(app)}
                            className="w-full mt-4 py-2 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all"
                        >
                            Gerenciar Visita
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL DE GERENCIAMENTO (CORRIGIDO) */}
            {itemForDetails && !showSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xl font-black text-white mb-6 uppercase">
                            {itemForDetails?.company_name || "Detalhes"}
                        </h3>
                        
                        {/* Relatório */}
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="Descreva o parecer técnico..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm min-h-[100px] mb-6 outline-none"
                        />

                        {/* Foto */}
                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] text-slate-400 font-black uppercase">Foto do Serviço</label>
                            <div className="relative h-32 bg-slate-900/50 border-2 border-dashed border-white/5 rounded-2xl overflow-hidden">
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Icons.Camera /></div>}
                            </div>
                        </div>

                        {/* Assinatura */}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase">
                                <span>Assinatura do Cliente</span>
                                <button onClick={clearSignature} className="text-rose-500">Limpar</button>
                            </div>
                            <div className="bg-white rounded-2xl h-32 overflow-hidden">
                                <SignatureCanvas
                                    ref={sigCanvas as any}
                                    onEnd={() => setHasSignature(true)}
                                    penColor="black"
                                    canvasProps={{ className: "w-full h-full" }}
                                />
                            </div>
                        </div>

                        {/* Botões */}
                        <button
                            onClick={onFinishHandle}
                            disabled={isFinishing || !hasSignature || !report}
                            className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${
                                isFinishing || !hasSignature || !report ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500 text-slate-950'
                            }`}
                        >
                            {isFinishing ? 'Sincronizando...' : 'Finalizar Atendimento'}
                        </button>
                        <button onClick={() => setItemForDetails(null)} className="w-full mt-4 text-slate-500 text-[9px] font-black uppercase">Voltar</button>
                    </div>
                </div>
            )}

            {/* MODAL DE SUCESSO (WHATSAPP) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-xl">
                    <div className="bg-[#1e293b] w-full max-w-sm rounded-[40px] border border-emerald-500/30 p-10 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase mb-8">Concluído!</h2>
                        <button
                            onClick={() => { reportService.openWhatsApp(itemForDetails); setShowSuccessModal(false); setItemForDetails(null); }}
                            className="w-full bg-[#25D366] text-slate-950 py-4 rounded-2xl font-black uppercase text-[10px] mb-3"
                        >
                            Enviar via WhatsApp
                        </button>
                        <button onClick={() => { setShowSuccessModal(false); setItemForDetails(null); }} className="w-full text-slate-500 text-[9px] font-black uppercase">Fechar</button>
                    </div>
                </div>
            )}

            {/* Botão Novo Agendamento */}
            <button onClick={() => setIsNewModalOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center z-40">
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
