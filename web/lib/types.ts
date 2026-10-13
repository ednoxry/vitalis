export type LeadChannel = "contato" | "agendamento" | "whatsapp";

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  gclid?: string;
  fbclid?: string;
}

export interface LeadInput {
  nome: string;
  telefone: string;
  email: string;
  assunto?: string;
  mensagem?: string;
  canal: LeadChannel;
  origem?: string;
  utm?: Record<string, string>;
}

export interface LeadRow {
  nome: string;
  telefone: string;
  email: string;
  assunto: string | null;
  mensagem: string | null;
  canal: LeadChannel;
  origem: string | null;
  utm: Record<string, string>;
  status: "novo";
}

export interface AppointmentInput {
  nome: string;
  telefone: string;
  email: string;
  procedimento: string;
  data: string;
  horario: string;
  unidade: string;
  obs?: string;
  consent: boolean;
}

export interface AppointmentRecord extends AppointmentInput {
  protocol: string;
  status: "solicitado";
}

export interface AvailabilityRule {
  weekday: number;
  start: string;
  end: string;
  slotMinutes: number;
  isActive: boolean;
}

export interface BookedInterval {
  start: string;
  end: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface DbAppointment {
  id: string;
  created_at: string;
  nome: string;
  telefone: string;
  email: string;
  procedimento: string;
  data: string;
  horario: string;
  unidade: string;
  obs: string | null;
  status: string;
  protocol: string;
}
