import { describe, it, expect } from "vitest";
import {
  buildDayAvailability,
  DEFAULT_AVAILABILITY,
  generateSlots,
  isSlotAvailable,
  overlaps,
  toHHMM,
  toMinutes,
  weekdayOf,
} from "@/lib/availability";
import {
  makeProtocol,
  onlyDigits,
  toAppointmentRecord,
  toLeadRow,
  utmFromSearch,
} from "@/lib/leads";
import { appointmentSchema, leadSchema } from "@/lib/validation";
import { looksLikeSpam, rateLimit } from "@/lib/api-helpers";

describe("availability", () => {
  it("converte minutos <-> HH:MM", () => {
    expect(toMinutes("08:30")).toBe(510);
    expect(toHHMM(510)).toBe("08:30");
    expect(toHHMM(toMinutes("19:00"))).toBe("19:00");
  });

  it("calcula o dia da semana em UTC", () => {
    expect(weekdayOf("2026-10-12")).toBe(1); // segunda
    expect(weekdayOf("2026-10-11")).toBe(0); // domingo
  });

  it("gera slots de um intervalo", () => {
    const slots = generateSlots({
      weekday: 1,
      start: "08:00",
      end: "10:00",
      slotMinutes: 30,
      isActive: true,
    });
    expect(slots).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });

  it("detecta sobreposição de intervalos", () => {
    expect(overlaps("09:00", "09:30", "09:15", "09:45")).toBe(true);
    expect(overlaps("09:00", "09:30", "10:00", "10:30")).toBe(false);
  });

  it("retorna vazio em dia sem regra (domingo)", () => {
    expect(buildDayAvailability({ rules: DEFAULT_AVAILABILITY, date: "2026-10-11" })).toEqual([]);
  });

  it("marca como indisponível o horário já ocupado", () => {
    const slots = buildDayAvailability({
      rules: DEFAULT_AVAILABILITY,
      date: "2026-10-12",
      booked: [{ start: "09:00", end: "09:30" }],
    });
    expect(slots).toHaveLength(22);
    expect(slots.find((s) => s.start === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.start === "08:30")?.available).toBe(true);
  });

  it("marca horários passados como indisponíveis quando é hoje", () => {
    const slots = buildDayAvailability({
      rules: DEFAULT_AVAILABILITY,
      date: "2026-10-12",
      now: { date: "2026-10-12", time: "10:00" },
    });
    expect(slots.find((s) => s.start === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.start === "10:00")?.available).toBe(false);
    expect(slots.filter((s) => s.available)[0]?.start).toBe("10:30");
  });

  it("valida um horário escolhido", () => {
    const slots = buildDayAvailability({ rules: DEFAULT_AVAILABILITY, date: "2026-10-12" });
    expect(isSlotAvailable(slots, "09:00", "09:30")).toBe(true);
    expect(isSlotAvailable(slots, "09:15")).toBe(false);
  });
});

describe("leads", () => {
  it("extrai UTMs da query string", () => {
    expect(utmFromSearch("?utm_source=google&utm_medium=cpc&foo=bar")).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
    });
  });

  it("normaliza telefone e e-mail", () => {
    const row = toLeadRow({
      nome: "  Maria Souza ",
      telefone: "(41) 99999-0000",
      email: "MARIA@Exemplo.com",
      mensagem: " Olá ",
    });
    expect(row.nome).toBe("Maria Souza");
    expect(row.telefone).toBe("41999990000");
    expect(row.email).toBe("maria@exemplo.com");
    expect(row.mensagem).toBe("Olá");
    expect(row.canal).toBe("contato");
    expect(row.status).toBe("novo");
  });

  it("só mantém dígitos do telefone", () => {
    expect(onlyDigits("+55 (41) 9 9999-0000")).toBe("5541999990000");
  });

  it("gera protocolo no formato VIT-AAAAMMDD-XXXX", () => {
    expect(makeProtocol(new Date("2026-10-12T00:00:00Z"))).toMatch(/^VIT-20261012-[0-9A-F]{4}$/);
  });

  it("cria agendamento com status solicitado", () => {
    const record = toAppointmentRecord({
      nome: "João",
      telefone: "41999990000",
      email: "joao@exemplo.com",
      procedimento: "Implante",
      data: "2026-10-12",
      horario: "09:00",
      unidade: "Batel",
      consent: true,
    });
    expect(record.status).toBe("solicitado");
    expect(record.protocol).toMatch(/^VIT-/);
  });
});

describe("validation", () => {
  it("rejeita lead com e-mail inválido", () => {
    const parsed = leadSchema.safeParse({ nome: "Ana", telefone: "41999990000", email: "nope" });
    expect(parsed.success).toBe(false);
  });

  it("aceita lead válido com canal padrão", () => {
    const parsed = leadSchema.safeParse({
      nome: "Ana",
      telefone: "(41) 99999-0000",
      email: "a@b.com",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.canal).toBe("contato");
  });

  it("exige consentimento no agendamento", () => {
    const base = {
      nome: "Ana",
      telefone: "41999990000",
      email: "a@b.com",
      procedimento: "Clareamento",
      data: "2026-10-12",
      horario: "09:00",
      unidade: "Batel",
    };
    expect(appointmentSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...base, consent: true }).success).toBe(true);
  });
});

describe("api-helpers", () => {
  it("detecta spam por honeypot e tempo curto", () => {
    expect(looksLikeSpam({ _gotcha: "bot" })).toBe(true);
    expect(looksLikeSpam({ _elapsed: 100 })).toBe(true);
    expect(looksLikeSpam({ _elapsed: 5000 })).toBe(false);
  });

  it("limita requisições por chave", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(false);
  });
});
