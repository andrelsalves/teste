import React, {useState,useMemo, useCallback,useEffect,} from 'react';
import type { Appointment } from '../types/types';
import { Icons } from '../components/constants/icons';

type TimeSlot = {
  time: string;
  available: boolean;
};

interface SchedulingViewProps {
  existingAppointments: Appointment[];
  onSchedule: (date: string, time: string) => Promise<void>;
}
function createLocalDate(date: string) {
  return new Date(`${date}T00:00:00-03:00`);
}
// Geração de horários (única fonte de verdade)
function generateTimeSlots(
  start = 8,
  end = 18,
  interval = 60
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (let hour = start; hour < end; hour++) {
    const h = String(hour).padStart(2, '0');
    slots.push({ time: `${h}:00`, available: true });
  }

  return slots;
}


const SchedulingView: React.FC<SchedulingViewProps> = ({
  existingAppointments,
  onSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);


  const baseSlots = useMemo(() => generateTimeSlots(), []);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return baseSlots;

    const occupied = existingAppointments
      .filter((a) => a.date === selectedDate)
      .map((a) => a.time);

    return baseSlots.map((slot) => ({
      ...slot,
      available: !occupied.includes(slot.time),
    }));
  }, [baseSlots, existingAppointments, selectedDate]);


  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }, []);

  const handleSelectTime = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsScheduling(true);
      await onSchedule(selectedDate, selectedTime);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (err) {
      console.error('Erro ao agendar:', err);
    } finally {
      setIsScheduling(false);
    }
  }, [selectedDate, selectedTime, onSchedule]);


  const canConfirm = !!selectedDate && !!selectedTime && !isScheduling;

  /* ===========================
     Render
  =========================== */

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-black text-white uppercase italic">
          Agendamento de <span className="text-emerald-500">Visita</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-bold mt-1">
          Escolha a data e o horário disponível
        </p>
      </header>

      {/* Date Picker */}
      <DatePicker
        selectedDate={selectedDate}
        onSelect={handleSelectDate}
      />

      {/* Time Slots */}
      {selectedDate && (
        <TimeSlots
          slots={availableSlots}
          selectedTime={selectedTime}
          onSelect={handleSelectTime}
        />
      )}

      {/* Action */}
      {selectedDate && selectedTime && (
        <button
          disabled={!canConfirm}
          onClick={handleConfirm}
          className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
            canConfirm
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isScheduling ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      )}
    </div>
  );
};

export default React.memo(SchedulingView);

/* ===========================
   Subcomponents
=========================== */

const DatePicker = React.memo(
  ({
    selectedDate,
    onSelect,
  }: {
    selectedDate: string | null;
    onSelect: (date: string) => void;
  }) => {
    const today = new Date();

    const dates = useMemo(() => {
      return Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });
    }, [today]);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`py-3 rounded-xl font-bold text-xs transition-all ${
              selectedDate === date
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {createLocalDate(date).toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            })}
          </button>
        ))}
      </div>
    );
  }
);

const TimeSlots = React.memo(
  ({
    slots,
    selectedTime,
    onSelect,
  }: {
    slots: TimeSlot[];
    selectedTime: string | null;
    onSelect: (time: string) => void;
  }) => (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={`py-3 rounded-xl text-xs font-black transition-all ${
            !slot.available
              ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
              : selectedTime === slot.time
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  )
);

