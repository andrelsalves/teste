import { supabase } from './supabaseClient';
import { Appointment, AppointmentStatus } from '../types/types';

export const appointmentService = {
    // Criar novo agendamento
    async createAppointment(appointment: Partial<Appointment>) {
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                datetime: appointment.datetime,
                reason: appointment.reason,
                description: appointment.description,
                company_id: appointment.companyId,
                status: appointment.status,
                technician_id: appointment.technicianId
            }])
            .select();

        if (error) throw error;
        return data;
    },

    // Buscar todos os agendamentos (Mapeamento Completo)
    async getAppointments(): Promise<Appointment[]> {
        const { data, error } = await supabase
            .from('view_dashboard_summary')
            .select('*')
            .order('datetime', { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            ...row,
            id: row.appointment_id,
            companyId: row.company_id, // CRITICO: Garante o vínculo da empresa
            companyName: row.company_name,
            companyCnpj: row.company_cnpj,
            technicianId: row.technician_id,
            technicianName: row.technician_name,
            // Extrai data e hora para compatibilidade com o componente de histórico
            date: row.datetime ? new Date(row.datetime).toLocaleDateString('pt-BR') : '',
            time: row.datetime ? new Date(row.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
        })) as Appointment[];
    },

    // Buscar agendamentos específicos para o Técnico
    async getAppointmentsForTechnician(techId: string): Promise<Appointment[]> {
        const { data, error } = await supabase
            .from('view_dashboard_summary')
            .select('*')
            .or(`technician_id.is.null,technician_id.eq.${techId}`)
            .order('datetime', { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            ...row,
            id: row.appointment_id,
            companyId: row.company_id,
            companyName: row.company_name,
            companyCnpj: row.company_cnpj,
            technicianId: row.technician_id,
            technicianName: row.technician_name,
            date: row.datetime ? new Date(row.datetime).toLocaleDateString('pt-BR') : '',
            time: row.datetime ? new Date(row.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
        })) as Appointment[];
    },

    async updateAppointmentStatus(id: string, status: AppointmentStatus, technicianId: string | null = null) {
        const { data, error } = await supabase
            .from('appointments')
            .update({ 
                status: status, 
                technician_id: technicianId 
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    },

    async completeAppointment(id: string, report: string, uploadedUrl: string, signatureData: string) {
        const { data, error } = await supabase
            .from('appointments')
            .update({
                status: AppointmentStatus.COMPLETED,
                description: report
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

    async uploadPhoto(file: File, appointmentId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${appointmentId}/${Math.random()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('appointment-photos')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('appointment-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
},
};
