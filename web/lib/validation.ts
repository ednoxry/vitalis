import { z } from "zod";

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Telefone muito curto")
  .max(20, "Telefone muito longo")
  .refine((v) => phoneRegex.test(v.replace(/\s+/g, "")), "Telefone inválido");

export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: phoneSchema,
  email: z.email("E-mail inválido").max(160),
  assunto: z.string().trim().max(120).optional(),
  mensagem: z.string().trim().max(2000).optional(),
  canal: z.enum(["contato", "agendamento", "whatsapp"]).default("contato"),
  origem: z.string().trim().max(120).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  _gotcha: z.string().max(0, "Spam detectado").optional(),
  _elapsed: z.coerce.number().min(0).optional(),
});

export type LeadInputZ = z.infer<typeof leadSchema>;

export const appointmentSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: phoneSchema,
  email: z.email("E-mail inválido").max(160),
  procedimento: z.string().trim().min(2).max(120),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  unidade: z.string().trim().min(2).max(120),
  obs: z.string().trim().max(2000).optional(),
  consent: z.literal(true, { message: "É necessário aceitar a Política de Privacidade." }),
  _gotcha: z.string().max(0, "Spam detectado").optional(),
  _elapsed: z.coerce.number().min(0).optional(),
});

export type AppointmentInputZ = z.infer<typeof appointmentSchema>;

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Data inválida"),
  procedimento: z.string().trim().max(120).optional(),
});

export function formatZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
