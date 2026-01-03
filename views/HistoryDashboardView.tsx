import React, { useState } from 'react';
import { AppointmentStatus, UserRole } from '../types/types';
import { useAppointments } from '../providers/AppointmentProvider';
import { useAuth } from '../hooks/useAuth';
import AppointmentDetailsModal from '../components/modal/AppointmentDetailsModal';

const HistoryDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [selected, setSelected] = useState<any>(null);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {appointments.map(app => (
        <div key={app.id} className="bg-slate-900 p-4 rounded-xl flex justify-between">
          <div>
            <p className="text-white font-bold">{app.companyName}</p>
            <p className="text-xs text-slate-400">{app.reason}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setSelected(app)}>Ver</button>

            {user.role === UserRole.EMPRESA &&
              app.status === AppointmentStatus.PENDING && (
                <button onClick={() => deleteAppointment(app.id)}>
                  Cancelar
                </button>
              )}
          </div>
        </div>
      ))}

      {selected && (
        <AppointmentDetailsModal
          appointment={selected}
          user={user}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default HistoryDashboardView;
