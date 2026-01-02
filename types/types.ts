export enum UserRole {
  TECNICO = 'TECNICO',
  EMPRESA = 'EMPRESA'
}

// Atualizado para refletir o banco de dados real
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber?: string | null; // Para Técnicos
  companyId?: string | null;          // FK para a tabela companies
  companyName?: string;               // Nome da empresa vinculada
  avatar?: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  companyId: string;
  companyName: string;
  companyCnpj?: string; 
  technicianId: string | null;
  technicianName?: string;
  datetime: string; 
  date: string; 
  time: string; 
  reason: string;
  description?: string;
  status: AppointmentStatus;
  createdAt?: string;
  photo_url?: string;
  signature_image?: string | null;
}


export interface Company {
  id: string;
  name: string;
  company_name?: string;
  cnpj?: string;
  address?: string;
  contact_name?: string;
  phone?: string;
  owner_id?: string;
  created_at?: string;
  active?: boolean;
}
