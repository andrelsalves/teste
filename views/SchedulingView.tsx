import React, { useState, useMemo, useCallback } from 'react';
import type { Appointment, User } from '../types/types';
import { Icons as LucideIcons } from '../components/constants/icons';

interface SchedulingViewProps {
    user?: User; // Adicionado para exibir o nome da empresa
    existingAppointments: Appointment[];
    onSchedule: (date: string, time: string, reason: string) => Promise<void>;
}

// Helper para gerar slots de tempo
function generateTimeSlots(start = 8, end = 18): string[] {
    const slots: string[] = [];
    for (let hour = start; hour < end; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
}

const SchedulingView: React.FC<SchedulingViewProps> = ({
    user,
    existingAppointments,
    onSchedule,
}) => {
    const [date, setDate] = useState<string>(''); // Inicie como string vazia
    const [time, setTime] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
            {/* Header ... */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LADO ESQUERDO: SEU CALENDARGRID */}
                <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-emerald-500 font-bold flex items-center gap-2">
                            <LucideIcons.Calendar className="w-5 h-5" />
                            <span>Selecione a Data</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                <span className="text-slate-500">Ocupado</span>
                            </div>
                        </div>
                    </div>

                    {/* Chamada da função que você enviou */}
                    <CalendarGrid
                        selectedDate={date}
                        onSelect={setDate}
                        appointments={existingAppointments}
                    />
                </div>

                {/* LADO DIREITO: FORMULÁRIO (Mantenha o código anterior) */}
                <div className={`lg:col-span-5 space-y-6 transition-all duration-700 ${date ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    {/* ... Resto do Form ... */}
                </div>
            </div>
        </div>
    );
};

return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
        {/* Header */}
        <header className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-white tracking-tighter">
                Solicitar <span className="text-emerald-500 italic">Consultoria Especializada</span>
            </h2>
            <p className="text-slate-400 mt-2 font-medium">
                Unidade: <span className="text-white font-bold underline decoration-emerald-500/50">
                    {user?.companyName || 'Empresa Cliente'}
                </span>
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Lado Esquerdo: Calendário */}
            <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                <div className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
                    <LucideIcons.Calendar className="w-5 h-5" />
                    Selecione a Data Disponível
                </div>
                {/* Aqui você pode manter o seu componente DatePicker antigo ou um CalendarGrid novo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const dateStr = d.toISOString().split('T')[0];
                        return (
                            <button
                                key={dateStr}
                                type="button"
                                onClick={() => setDate(dateStr)}
                                className={`py-4 rounded-2xl font-bold text-sm transition-all ${date === dateStr
                                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lado Direito: Formulário de Detalhes */}
            <div className={`lg:col-span-5 space-y-6 transition-all duration-700 ${date ? 'opacity-100 translate-x-0' : 'opacity-30 pointer-events-none translate-x-4'}`}>
                <form onSubmit={handleSubmit} className="bg-[#0f172a] p-8 rounded-[40px] border border-emerald-500/10 shadow-2xl space-y-6">

                    {/* Banner de Data Selecionada */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase">Data da Visita</p>
                            <p className="text-white font-bold">
                                {date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---'}
                            </p>
                        </div>
                        <LucideIcons.Calendar className="text-emerald-500 w-6 h-6" />
                    </div>

                    {/* Seleção de Horário */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Horário</label>
                        <select
                            value={time}
                            required
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                        >
                            <option value="">Selecione o horário...</option>
                            {generateTimeSlots().map(s => (
                                <option key={s} value={s} className="bg-slate-900">{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Seleção de Serviço */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Serviço Especializado</label>
                        <select
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                        >
                            <option value="" disabled>Selecione a Consultoria...</option>
                            <optgroup label="Segurança do Trabalho" className="bg-slate-800 text-white font-bold">
                                <option value="PGR">Renovação de PGR/PCMSO</option>
                                <option value="NR">Treinamento Normativo (NRs)</option>
                            </optgroup>
                            <optgroup label="Engenharia e Projetos" className="bg-slate-800 text-white font-bold">
                                <option value="Estrutural">Vistoria de Projeto Estrutural</option>
                                <option value="Incendio">Projeto/AVCB Corpo de Bombeiros</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !date || !time || !reason}
                        className={`w-full font-black py-5 rounded-2xl uppercase transition-all shadow-xl
                                ${isSubmitting
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 shadow-emerald-500/10'}`}
                    >
                        {isSubmitting ? 'Enviando Solicitação...' : 'Finalizar Agendamento'}
                    </button>
                </form>
            </div>
        </div>
    </div>
);
};

export default React.memo(SchedulingView);
