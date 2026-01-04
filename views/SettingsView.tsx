import React, { useState, useMemo } from 'react';
import { Appointment, User } from '../types/types';
import { Icons as LucideIcons } from '../components/constants/icons';

// Gera slots de 40 min: 08:00, 08:40, 09:20...
export const generateTimeSlots = () => {
    const slots = [];
    let currentMinutes = 480; // 08:00
    const endMinutes = 1080;  // 18:00
    while (currentMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += 40; 
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
                const hasApp = (appointments || []).some(app => {
                    const appDate = app.datetime ? app.datetime.split('T')[0] : app.date;
                    return appDate === dateStr;
                });

                return (
                    <button
                        key={day}
                        onClick={() => onSelect(dateStr)}
                        type="button"
                        className={`aspect-square rounded-xl text-sm font-bold transition-all flex items-center justify-center relative
                            ${isSelected ? 'bg-emerald-500 text-slate-950 shadow-lg scale-110 z-10' 
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        {day}
                        {hasApp && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />}
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

    // Filtra horários que já estão em uso no dia selecionado
    const availableSlots = useMemo(() => {
        const all = generateTimeSlots();
        if (!date) return all.map(s => ({ time: s, available: true }));
        
        const occupied = (appointments || [])
            .filter(a => (a.datetime?.split('T')[0] || a.date) === date)
            .map(a => a.datetime?.split('T')[1].substring(0, 5) || a.time);

        return all.map(s => ({ time: s, available: !occupied.includes(s) }));
    }, [date, appointments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const datetime = `${date}T${time}:00`;
            await onSchedule({ datetime, reason, description: `Solicitação de ${reason}`, technicianId: undefined });
            setTime(''); setReason('');
        } catch (error) { console.error(error); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-20 px-4">
            <header className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                    Solicitar <span className="text-emerald-500 italic">Consultoria Especializada</span>
                </h2>
                <p className="text-slate-400 mt-2 font-medium">
                    Unidade: <span className="text-white font-bold underline decoration-emerald-500/50">{user?.companyName || 'Empresa'}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 bg-[#111625] p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                    <CalendarGrid selectedDate={date} onSelect={(d) => { setDate(d); setTime(''); }} appointments={appointments} />
                </div>

                <div className={`lg:col-span-5 space-y-6 transition-all duration-700 ${date ? 'opacity-100 translate-x-0' : 'opacity-20 pointer-events-none translate-x-4'}`}>
                    <form onSubmit={handleSubmit} className="bg-[#0f172a] p-8 rounded-[40px] border border-emerald-500/10 shadow-2xl space-y-6">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div className="text-white font-bold">
                                {date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : 'Selecione no calendário'}
                            </div>
                            <LucideIcons.Calendar className="text-emerald-500 w-6 h-6" />
                        </div>

                        <select value={time} onChange={(e) => setTime(e.target.value)} required className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 appearance-none">
                            <option value="">Selecione o horário...</option>
                            {availableSlots.map(s => (
                                <option key={s.time} value={s.time} disabled={!s.available} className={s.available ? "" : "text-slate-600"}>
                                    {s.time} {!s.available ? '(Ocupado)' : ''}
                                </option>
                            ))}
                        </select>

                        <select value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 appearance-none">
                            <option value="" disabled>Qual a consultoria?</option>
                            <optgroup label="Segurança do Trabalho" className="bg-slate-800 text-emerald-500">
                                <option value="PGR" className="text-white">Renovação de PGR/PCMSO</option>
                                <option value="NR" className="text-white">Treinamento Normativo (NRs)</option>
                            </optgroup>
                            <optgroup label="Engenharia" className="bg-slate-800 text-emerald-500">
                                <option value="Bombeiros" className="text-white">Projeto Bombeiros (AVCB)</option>
                                <option value="Estrutural" className="text-white">Vistoria de Estrutura</option>
                            </optgroup>
                        </select>

                        <button disabled={isSubmitting || !date || !time || !reason} className="w-full bg-emerald-500 text-slate-950 font-black py-5 rounded-2xl uppercase hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                            {isSubmitting ? 'Enviando...' : 'Finalizar Agendamento'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchedulingView;