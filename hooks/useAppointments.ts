import { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, AppointmentStatus, UserRole } from '../types/types';
import { useAuth } from './useAuth';

export function useAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const data =
        user.role === UserRole.TECNICO
          ? await appointmentService.getAppointmentsForTechnician(user.id)
          : await appointmentService.getAppointments();

      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateStatus = useCallback(
    async (
      id: string,
      status: AppointmentStatus,
      technicianId?: string | null
    ) => {
      await appointmentService.updateAppointmentStatus(
        id,
        status,
        technicianId ?? null
      );
    },
    []
  );

  const stats = useMemo(() => {
    const completed = appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED
    ).length;

    const pending = appointments.filter(
      (a) => a.status === AppointmentStatus.PENDING
    ).length;

    return {
      completed,
      pending,
      total: appointments.length,
    };
  }, [appointments]);

  return {
    appointments,
    loading,
    stats,
    loadAppointments,
    updateStatus,
  };
}
