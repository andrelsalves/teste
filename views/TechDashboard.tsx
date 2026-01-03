import React, { useState, useCallback } from 'react';
import { Icons } from "../components/constants/icons";
import NewAppointmentModal from '../components/modal/NewAppointmentModal';
import AppointmentDetailsModal from '../components/modal/AppointmentDetailsModal';

interface TechDashboardProps {
  user: { id: string; name: string };
  appointments: any[];
  stats: { completed: number; pending: number; total: number };
  loadAppointments: () => Promise<void>;
}

const TechDashboard: React.FC<TechDashboardProps> = ({
  user,
  appointments,
  stats,
  loadAppointments,
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [itemForDetails, setItemForDetails] = useState<any | null>(null);

  const openDetails = useCallback((item: any) => {
    setItemForDetails(item);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-20 relative">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase">
            Painel de <span className="text-emerald-500">Serviços</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase">
            {user.name} • {appointments.length} Atendimentos
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
          <Icons.CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-2xl font-black text-white">{stats.completed}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appointments.map(app => (
          <div key={app.id} className="bg-slate-900/40 p-4 rounded-2xl">
            <h3 className="text-white font-bold text-sm truncate">
              {app.company_name}
            </h3>
            <button
              onClick={() => openDetails(app)}
              className="w-full mt-4 py-2 bg-slate-800 rounded-xl text-xs hover:bg-emerald-500"
            >
              Gerenciar Visita
            </button>
          </div>
        ))}
      </div>

      {itemForDetails && (
        <AppointmentDetailsModal
          item={itemForDetails}
          technicianName={user.name}
          onClose={() => setItemForDetails(null)}
          onSuccess={loadAppointments}
        />
      )}

      <button
        onClick={() => setIsNewModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 rounded-full"
      >
        +
      </button>

      {isNewModalOpen && (
        <NewAppointmentModal
          technicianId={user.id}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={() => {
            loadAppointments();
            setIsNewModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TechDashboard;
