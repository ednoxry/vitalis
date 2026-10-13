import { Resend } from "resend";
import { env, isEmailConfigured } from "./env";
import type { AppointmentRecord, LeadRow } from "./types";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  if (!isEmailConfigured()) return { ok: false, skipped: true };
  try {
    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({
      from: env.emailFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      replyTo: message.replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "erro desconhecido" };
  }
}

const shell = (title: string, body: string): string => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <div style="background:#0d9488;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
      <strong style="font-size:18px">Clínica Vitalis</strong>
      <div style="opacity:.9;font-size:13px">Odontologia · São Paulo</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 14px 14px;padding:24px">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">
      Av. Paulista, 1000 — Sala 501 · (11) 99999-0000 · contato@clinicavitalis.com.br
    </p>
  </div>`;

const row = (label: string, value: string): string =>
  `<tr><td style="padding:6px 12px 6px 0;color:#64748b">${label}</td><td style="padding:6px 0;font-weight:600">${value}</td></tr>`;

export function appointmentClientEmail(record: AppointmentRecord): EmailMessage {
  const dataBR = record.data.split("-").reverse().join("/");
  return {
    to: record.email,
    subject: `Recebemos sua solicitação — protocolo ${record.protocol}`,
    html: shell(
      "Solicitação recebida!",
      `<p>Olá, ${record.nome}! Recebemos o seu pedido de avaliação e vamos confirmar em breve.</p>
       <table style="border-collapse:collapse;font-size:14px">
         ${row("Protocolo", record.protocol)}
         ${row("Procedimento", record.procedimento)}
         ${row("Data e horário", `${dataBR} às ${record.horario}`)}
         ${row("Unidade", record.unidade)}
       </table>
       <p style="color:#64748b;font-size:13px;margin-top:16px">Se preferir, confirme pelo WhatsApp: (11) 99999-0000.</p>`,
    ),
  };
}

export function appointmentClinicEmail(record: AppointmentRecord): EmailMessage {
  return {
    to: env.clinicNotifyEmail,
    subject: `Nova solicitação de avaliação — ${record.protocol}`,
    replyTo: record.email,
    html: shell(
      "Nova solicitação de agendamento",
      `<table style="border-collapse:collapse;font-size:14px">
         ${row("Paciente", record.nome)}
         ${row("Telefone", record.telefone)}
         ${row("E-mail", record.email)}
         ${row("Procedimento", record.procedimento)}
         ${row("Data/horário", `${record.data} ${record.horario}`)}
         ${row("Unidade", record.unidade)}
         ${row("Observações", record.obs || "—")}
       </table>`,
    ),
  };
}

export function leadClinicEmail(lead: LeadRow): EmailMessage {
  return {
    to: env.clinicNotifyEmail,
    subject: `Novo contato (${lead.canal}) — ${lead.nome}`,
    replyTo: lead.email,
    html: shell(
      "Novo contato pelo site",
      `<table style="border-collapse:collapse;font-size:14px">
         ${row("Nome", lead.nome)}
         ${row("Telefone", lead.telefone)}
         ${row("E-mail", lead.email)}
         ${row("Assunto", lead.assunto || "—")}
         ${row("Mensagem", lead.mensagem || "—")}
         ${row("Origem", lead.origem || "—")}
       </table>`,
    ),
  };
}
