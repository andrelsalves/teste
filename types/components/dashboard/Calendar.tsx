
import React from 'react';
import { Icons } from '../constants/icons';

interface CalendarProps {
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  getAvailability: (day: number) => 'NONE' | 'LIMITED' | 'FULL';
}

const Calendar: React.FC<CalendarProps> = ({ 
  viewDate, 
  onPrevMonth, 
  onNextMonth, 
  selectedDay, 
  onSelectDay, 
  getAvailability 
}) => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  return (
    <div className="bg-[#1e293b] rounded-[24px] p-5 shadow-2xl border border-slate-700/50 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-white tracking-tight">
            {monthNames[month]} <span className="text-emerald-500/50">{year}</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Selecione uma data</p>
        </div>
        
        <div className="flex gap-1.5">
          <button 
            onClick={onPrevMonth} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white border border-slate-700 active:scale-90"
          >
            <Icons.ChevronLeft />
          </button>
          <button 
            onClick={onNextMonth} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white border border-slate-700 active:scale-90"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 relative z-10">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <span key={d} className="text-[10px] font-black text-slate-600 mb-2 uppercase text-center">{d}</span>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const availability = getAvailability(dayNum);
          const isSelected = selectedDay === dayNum;
          const today = isToday(dayNum);

          return (
            <div key={dayNum} className="relative flex flex-col items-center group aspect-square">
              <button
                disabled={availability === 'NONE'}
                onClick={() => onSelectDay(dayNum)}
                className={`w-full h-full flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative overflow-hidden border
                  ${isSelected ? 
                    'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105 z-20' : 
                    availability === 'NONE' ? 
                      'bg-slate-800/30 border-transparent text-slate-700 cursor-not-allowed opacity-40' : 
                      availability === 'LIMITED' ?
                        'bg-amber-500/5 border-amber-500/20 text-slate-300 hover:border-amber-500/50 hover:bg-amber-500/10' :
                        'bg-emerald-500/5 border-emerald-500/10 text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                  }
                  ${today && !isSelected ? 'ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[#1e293b]' : ''}
                `}
              >
                <span className={`z-10 ${isSelected ? 'text-[14px] font-black' : ''}`}>{dayNum}</span>
                
                {/* Indicadores de Heatmap */}
                {!isSelected && availability !== 'NONE' && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <span className={`w-0.5 h-0.5 rounded-full ${availability === 'LIMITED' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  </div>
                )}

                {/* Efeito de listras para dias bloqueados */}
                {availability === 'NONE' && (
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legenda Compacta */}
      <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-1 bg-emerald-500 rounded-full mb-1" />
          <span className="text-[8px] font-black text-slate-500 uppercase">Livre</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-1 bg-amber-500 rounded-full mb-1" />
          <span className="text-[8px] font-black text-slate-500 uppercase">Pouco</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-1 bg-slate-700 rounded-full mb-1" />
          <span className="text-[8px] font-black text-slate-500 uppercase">Indisp.</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
