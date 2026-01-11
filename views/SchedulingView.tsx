import React, { useState, useMemo, useCallback } from 'react';
import { Appointment, User } from '../types/types';
import { Icons as LucideIcons } from '../components/constants/icons';

// --- LOGICA DE HORÁRIOS ---
export const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
};


// --- COMPONENTE DE CALENDÁRIO ---
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
                // Verifica se o dia tem qualquer agendamento
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
                            ${isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-110 z-10'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        {day}
                        {hasApp && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
interface SchedulingViewProps {
    user?: User;
    onSchedule: (data: any) => Promise<void>;
    appointments: Appointment[];
}

const SchedulingView: React.FC<SchedulingViewProps> = ({ user, onSchedule, appointments }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtra horários disponíveis para o dia selecionado
    const availableTimeSlots = useMemo(() => {
        const allSlots = generateTimeSlots();
        if (!date) return allSlots;

        // Pega apenas os horários que já estão ocupados naquela data
        const occupiedTimes = appointments
            .filter(app => {
                const appDate = app.datetime ? app.datetime.split('T')[0] : app.date;
                return appDate === date;
            })
            .map(app => {
                if (app.datetime) return app.datetime.split('T')[1].substring(0, 5);
                return app.time?.substring(0, 5);
            });

        return allSlots.map(slot => ({
            time: slot,
            isAvailable: !occupiedTimes.includes(slot)
        }));
    }, [date, appointments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time || !reason) return;
        
        setIsSubmitting(true);
        try {
            const datetime = `${date}T${time}:00`;
            await onSchedule({ 
                datetime, 
                reason, 
                description: `Solicitação de ${reason}`, 
                technicianId: undefined 
            });

            // Limpa o formulário após sucesso
            setTime('');
            setReason('');
            setDate(''); 
        } catch (error) {
            console.error("Erro ao agendar:", error);
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
                    Unidade: <span className="text-white font-bold underline decoration-emerald-500/50">{user?.companyName || 'Minha Empresa'}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Calendário */}
                <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                         <h3 className="text-white font-bold flex items-center gap-2">
                            <LucideIcons.Calendar className="w-5 h-5 text-emerald-500" />
                            Selecione a Data
                         </h3>
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Ocupado
                         </div>
                    </div>
                    
                    <CalendarGrid
                        selectedDate={date}
                        onSelect={(d) => { setDate(d); setTime(''); }}
                        appointments={appointments}
                    />
                </div>

                {/* Formulário */}
                <div className={`lg:col-span-5 space-y-6 transition-all duration-700 ${date ? 'opacity-100 translate-x-0' : 'opacity-30 pointer-events-none translate-x-4'}`}>
                    <form onSubmit={handleSubmit} className="bg-[#0f172a] p-8 rounded-[40px] border border-emerald-500/10 shadow-2xl space-y-6">
                        
                        {/* Preview da Data */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase">Data Selecionada</p>
                                <p className="text-white font-bold">
                                    {date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                                </p>
                            </div>
                            <LucideIcons.CheckCircle2 className={`${date ? 'text-emerald-500' : 'text-slate-700'} w-6 h-6`} />
                        </div>

                        {/* Horário */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Horários Disponíveis</label>
                            <select
                                value={time}
                                required
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Escolha um horário...</option>
                                {availableTimeSlots.map(slot => (
                                    <option 
                                        key={slot.time} 
                                        value={slot.time} 
                                        disabled={!slot.isAvailable}
                                        className={slot.isAvailable ? "text-white" : "text-slate-600"}
                                    >
                                        {slot.time} {!slot.isAvailable ? '(Ocupado)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Motivo/Serviço */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Tipo de Consultoria</label>
                            <select
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Selecione o serviço...</option>
                                <optgroup label="Segurança do Trabalho" className="bg-slate-800 text-slate-400">
                                    <option value="PGR">Renovação de PGR/PCMSO</option>
                                    <option value="Treinamento">Treinamento de CIPA/NRs</option>
                                    <option value="Insalubridade">Laudo de Insalubridade</option>
                                </optgroup>
                                <optgroup label="Engenharia" className="bg-slate-800 text-slate-400">
                                    <option value="Bombeiros">Projeto de Incêndio (AVCB)</option>
                                    <option value="Eletrica">Laudo Elétrico (NR10)</option>
                                </optgroup>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !date || !time || !reason}
                            className={`w-full font-black py-5 rounded-2xl uppercase transition-all shadow-lg
                                ${isSubmitting 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 shadow-emerald-500/20'}`}
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchedulingView;
