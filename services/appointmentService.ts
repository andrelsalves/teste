import { supabase } from './supabaseClient';
import { Appointment, AppointmentStatus } from '../types/types';

export const appointmentService = {
  async createAppointment(appointment: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          datetime: appointment.datetime,
          reason: appointment.reason,
          description: appointment.description,
          company_id: appointment.companyId,
          status: appointment.status,
          technician_id: appointment.technicianId,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  },

  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('view_dashboard_summary')
      .select('*')
      .order('datetime', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      id: row.appointment_id,
      companyId: row.company_id,
      companyName: row.company_name,
      companyCnpj: row.company_cnpj,
      technicianId: row.technician_id,
      technicianName: row.technician_name,
      date: row.datetime
        ? new Date(row.datetime).toLocaleDateString('pt-BR')
        : '',
      time: row.datetime
        ? new Date(row.datetime).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    })) as Appointment[];
  },

  async getAppointmentsForTechnician(techId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('view_dashboard_summary')
      .select('*')
      .or(`technician_id.is.null,technician_id.eq.${techId}`)
      .order('datetime', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      id: row.appointment_id,
      companyId: row.company_id,
      companyName: row.company_name,
      companyCnpj: row.company_cnpj,
      technicianId: row.technician_id,
      technicianName: row.technician_name,
      date: row.datetime
        ? new Date(row.datetime).toLocaleDateString('pt-BR')
        : '',
      time: row.datetime
        ? new Date(row.datetime).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    })) as Appointment[];
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    technicianId: string | null = null
  ) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status,
        technician_id: technicianId,
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  // ✅ FUNÇÃO CORRIGIDA
  async completeAppointment(
    id: string,
    report: string,
    photoUrl: string | null,
    signatureData: string
  ) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: AppointmentStatus.COMPLETED,
        description: report,
        photo_url: photoUrl,
        signature_image: signatureData,
      })
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
