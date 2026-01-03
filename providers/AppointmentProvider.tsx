import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appointment, AppointmentStatus } from '../types/types';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../hooks/useAuth';

interface AppointmentContextData {
  appointments: Appointment[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateStatus: (
    id: string,
    status: AppointmentStatus,
    technicianId?: string | null
  ) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextData | null>(null);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;

    setLoading(true);

    const data =
      user.role === 'TECNICO'
        ? await appointmentService.getAppointmentsForTechnician(user.id)
        : await appointmentService.getAppointments();

    setAppointments(data);
    setLoading(false);
  };

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    technicianId?: string | null
  ) => {
    await appointmentService.updateAppointmentStatus(
      id,
      status,
      technicianId ?? null
    );

    await loadAppointments();
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        refresh: loadAppointments,
        updateStatus,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) {
    throw new Error('useAppointments must be used inside AppointmentProvider');
  }
  return ctx;
};
