import React from 'react';
import { Icons } from '../constants/constants';
import { Appointment, AppointmentStatus } from '../types/types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardStatsProps {
    appointments: Appointment[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ appointments }) => {
    const stats = {
        total: appointments.length,
        completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        pending: appointments.filter(a => a.status === AppointmentStatus.ACCEPTED).length,
        open: appointments.filter(a => !a.technicianId).length
    };

    // Dados para o gráfico (Exemplo de distribuição por status)
    const chartData = [
        { name: 'Disponíveis', value: stats.open, color: '#f59e0b' },
        { name: 'Agendados', value: stats.pending, color: '#3b82f6' },
        { name: 'Concluídos', value: stats.completed, color: '#10b981' },
    ];

    return (
        <div className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[24px] backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Icons.CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concluídos</span>
                    </div>
                    <span className="text-3xl font-black text-white">{stats.completed}</span>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[24px] backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Icons.Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Em Aberto</span>
                    </div>
                    <span className="text-3xl font-black text-white">{stats.pending}</span>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[24px] backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <Icons.AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponíveis</span>
                    </div>
                    <span className="text-3xl font-black text-white">{stats.open}</span>
                </div>

                <div className="bg-emerald-500 p-5 rounded-[24px] shadow-lg shadow-emerald-500/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg text-white">
                            <Icons.TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">Eficiência</span>
                    </div>
                    <span className="text-3xl font-black text-emerald-950">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                </div>
            </div>

            {/* Gráfico de Performance */}
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] h-[250px]">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 opacity-50">Resumo de Atividades</h4>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardStats;
