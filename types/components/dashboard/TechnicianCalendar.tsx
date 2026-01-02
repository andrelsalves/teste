import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../services/supabaseClient';

interface Props {
  technicianId: string;
  onSlotSelect: (slot: string) => void;
}

interface SlotData {
  slot: string; // data/hora ISO
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
}

const TechnicianCalendar: React.FC<Props> = ({ technicianId, onSlotSelect }) => {
  const [events, setEvents] = useState<any[]>([]);

  const loadSlots = async (date: Date) => {
    const selectedDateStr = date.toISOString().split('T')[0];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_technician_id: technicianId,
        p_date: selectedDateStr,
      });

      if (error || !data) return;

      const mapped = (data as SlotData[]).map((slot) => {
        let title = 'Disponível';
        let intensity = 0; // para heatmap
        if (slot.status === 'BOOKED') {
          title = 'Ocupado';
          intensity = 0.3;
        } else if (slot.status === 'UNAVAILABLE') {
          title = 'Indisponível';
          intensity = 0.5;
        }

        return {
          id: slot.slot,
          title,
          start: slot.slot,
          end: new Date(new Date(slot.slot).getTime() + 60 * 60 * 1000),
          backgroundColor: '#10b981', // padrão verde
          borderColor: '#10b981',
          textColor: '#fff',
          extendedProps: { status: slot.status, intensity },
        };
      });

      setEvents(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const memoEvents = useMemo(() => events, [events]);

  useEffect(() => {
    loadSlots(new Date());
  }, []);

  // Função para gerar cor do heatmap baseada na intensidade
  const getHeatColor = (intensity: number, status: string) => {
    if (status === 'AVAILABLE') return 'transparent';
    if (status === 'BOOKED') return `rgba(248,113,113,${intensity})`; // vermelho
    if (status === 'UNAVAILABLE') return `rgba(107,114,128,${intensity})`; // cinza
    return 'transparent';
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700 relative overflow-hidden">
      {/* Heatmap graduado */}
      <div className="absolute inset-0 pointer-events-none">
        {memoEvents.map((ev) => {
          const { intensity, status } = ev.extendedProps;
          if (!intensity || intensity <= 0) return null;

          const start = new Date(ev.start);
          const top = ((start.getHours() + start.getMinutes() / 60) / 24) * 100;
          return (
            <div
              key={ev.id}
              className="absolute left-0 right-0"
              style={{
                top: `${top}%`,
                height: '4%',
                backgroundColor: getHeatColor(intensity, status),
              }}
            />
          );
        })}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        locale="pt-br"
        selectable
        events={memoEvents}
        height="auto"
        slotDuration="01:00:00"
        allDaySlot={false}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth',
        }}
        datesSet={(info: any) => loadSlots(info.start)}
        dateClick={(info: any) => loadSlots(info.date)}
        eventClick={(info: any) => {
          const slot = info.event.start?.toISOString();
          const status = info.event.extendedProps?.status;
          if (slot && status === 'AVAILABLE') onSlotSelect(slot);
        }}
        eventDidMount={(info: any) => {
          const status = info.event.extendedProps?.status;
          info.el.setAttribute('title', `${info.event.title} (${status})`);
        }}
      />
    </div>
  );
};

export default TechnicianCalendar;
