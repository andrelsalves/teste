import React, { useEffect, useState } from 'react';
import { Icons } from '../constants/icons';
import { appointmentService } from '../../services/appointmentService';
import { companyService } from '../../services/companyService';
import { AppointmentStatus } from '../../types/types';
import { generateTimeSlots } from '../../views/SchedulingView';

interface NewAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    technicianId: string;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ onClose, onSuccess, technicianId }) => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // 1. Defina o estado primeiro
    const [formData, setFormData] = useState({
        companyId: '',
        reason: '',
        date: '',
        time: '',
    });

    // 2. Gere as opções de horário
    const timeOptions = generateTimeSlots();

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await companyService.getAllCompanies();
            setCompanies(data || []);
        } catch (err) {
            console.error("Erro ao carregar empresas");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação correta
        if (!formData.companyId || !formData.reason || !formData.date || !formData.time) {
            return alert("Preencha todos os campos");
        }

        setLoading(true);
        try {
            // Monta a string completa de data/hora para o banco de dados
            const fullDateTime = `${formData.date}T${formData.time}:00`;

            await appointmentService.createAppointment({
                companyId: formData.companyId,
                reason: formData.reason,
                datetime: fullDateTime, // Envia a string combinada
                technicianId: technicianId,
                status: AppointmentStatus.ACCEPTED,
            });
            
            onSuccess();
            onClose();
        } catch (err) {
            alert("Erro ao agendar visita");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[40px] p-8 shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Nova Visita</h2>
                        <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Agendamento Rápido</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <Icons.XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seleção de Empresa - Corrigido para salvar no estado */}
                    <div className="flex flex-col gap-2 mb-4">
                        <label className="text-gray-400 text-[10px] font-black uppercase ml-2 tracking-widest">
                            Unidade / Cliente
                        </label>
                        <select
                            className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 appearance-none"
                            style={{ backgroundColor: '#1e293b' }}
                            value={formData.companyId}
                            onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                            required
                        >
                            <option value="">Selecione a Empresa</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id} className="bg-slate-900">
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Motivo do Serviço */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Motivo da Visita</label>
                        <input
                            placeholder="Ex: Entrega de EPIs, Treinamento..."
                            className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    {/* Data e Hora Separados */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Data</label>
                            <input
                                type="date"
                                className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Horário</label>
                            <select
                                className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 appearance-none"
                                style={{ backgroundColor: '#1e293b' }}
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                required
                            >
                                <option value="" className="bg-slate-900">Horário</option>
                                {timeOptions.map(t => (
                                    <option key={t} value={t} className="bg-slate-900">{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-emerald-500 text-slate-950 rounded-[24px] font-black uppercase text-[12px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {loading ? 'Processando...' : 'Confirmar Agendamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewAppointmentModal;

