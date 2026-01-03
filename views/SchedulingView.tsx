import React, { useState } from 'react';
import { Appointment } from '../types/types';
import { Icons as LucideIcons } from '../components/constants/icons';

// --- FUNÇÃO EXPORTADA (AGORA FORA DO COMPONENTE) ---
export const generateTimeSlots = () => {
    const slots = [];
    let currentMinutes = 480; // 08:00
    const endMinutes = 1080;  // 18:00

    while (currentMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(
            `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
        );
        currentMinutes += 40; // Intervalo de 40 minutos solicitado
    }
    return slots;
};

const CalendarGrid: React.FC<{
    selectedDate: string;
    onSelect: (date: string) => void;
    appointments?: Appointment[];
}> = ({ selectedDate, onSelect, appointments }) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-600 uppercase text-center mb-2">{d}</div>
            ))}
            {blanks.map(b => <div key={`b-${b}`} />)}
            {days.map(day => {
                const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const hasApp = (appointments || []).some(app => app.datetime.split('T')[0] === dateStr);

                return (
                    <button
                        key={day}
                        onClick={() => onSelect(dateStr)}
                        type="button"
                        className={`aspect-square rounded-xl text-sm font-bold transition-all flex items-center justify-center relative
                            ${isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-110 z-10'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        {day}
                        {hasApp && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

const SchedulingView: React.FC<any> = ({ user, onSchedule, appointments }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time || !reason) return;
        setIsSubmitting(true);
        try {
            const datetime = `${date}T${time}:00`;
            await onSchedule({ datetime, reason, description: '', technicianId: undefined });

            setTime('');
            setReason('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
            <header className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                    Solicitar <span className="text-emerald-500 italic">Consultoria Especializada</span>
                </h2>
                <p className="text-slate-400 mt-2 font-medium">
                    Unidade: <span className="text-white font-bold underline decoration-emerald-500/50">{user?.companyName || 'Empresa'}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                    <CalendarGrid
                        selectedDate={date}
                        onSelect={setDate}
                        appointments={appointments}
                    />
                </div>

                <div className={`lg:col-span-5 space-y-6 transition-all duration-700 ${date ? 'opacity-100 translate-x-0' : 'opacity-30 pointer-events-none translate-x-4'}`}>
                    <form onSubmit={handleSubmit} className="bg-[#0f172a] p-8 rounded-[40px] border border-emerald-500/10 shadow-2xl space-y-6">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase">Data da Visita</p>
                                <p className="text-white font-bold">
                                    {date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---'}
                                </p>
                            </div>
                            <LucideIcons.Calendar className="text-emerald-500 w-6 h-6" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Horário</label>
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-colors"
                            >
                                <option value="">Selecione o horário...</option>
                                {generateTimeSlots().map(s => (
                                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Resto do formulário mantido igual */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Serviço Especializado</label>
                            <select
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-colors"
                            >
                                <option value="" disabled>Selecione a Consultoria...</option>
                                <optgroup label="Segurança do Trabalho" className="bg-slate-800 text-white font-bold">
                                    <option value="PGR" className="text-emerald-400">Renovação de PGR/PCMSO</option>
                                    <option value="NR" className="text-emerald-400">Treinamento Normativo (NRs)</option>
                                </optgroup>
                                <optgroup label="Engenharia e Projetos" className="bg-slate-800 text-white font-bold">
                                    <option value="Estrutural" className="text-emerald-400">Vistoria de Projeto Estrutural</option>
                                    <option value="Incendio" className="text-emerald-400">Projeto/AVCB Corpo de Bombeiros</option>
                                </optgroup>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !date || !time || !reason}
                            className={`w-full font-black py-5 rounded-2xl uppercase transition-all
                                ${isSubmitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95'}`}
                        >
                            {isSubmitting ? 'Enviando...' : 'Finalizar Agendamento'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchedulingView;
