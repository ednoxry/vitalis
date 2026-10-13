import { test, expect } from "@playwright/test";

// Dia útil e domingo distantes no futuro (evitam regra de "horário passado").
const MONDAY = "2030-01-07";
const SUNDAY = "2030-01-06";

test("health reporta serviços e integrações", async ({ request }) => {
  const resp = await request.get("/api/health");
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.ok).toBe(true);
  expect(body.integrations).toEqual({
    supabase: false,
    supabaseAdmin: false,
    email: false,
  });
});

test("disponibilidade gera slots em dia útil", async ({ request }) => {
  const resp = await request.get(`/api/availability?date=${MONDAY}`);
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.slots.length).toBe(22);
  expect(body.slots.every((s: { available: boolean }) => s.available)).toBe(true);
});

test("disponibilidade sem regra retorna vazio (domingo)", async ({ request }) => {
  const resp = await request.get(`/api/availability?date=${SUNDAY}`);
  const body = await resp.json();
  expect(body.slots).toEqual([]);
});

test("disponibilidade com data inválida retorna 422", async ({ request }) => {
  const resp = await request.get("/api/availability?date=2026-13-99");
  expect(resp.status()).toBe(422);
});

test("lead válido é aceito", async ({ request }) => {
  const resp = await request.post("/api/leads", {
    data: {
      nome: "Maria Teste",
      telefone: "(11) 99999-0000",
      email: "maria@teste.com",
      assunto: "Avaliação",
      mensagem: "Olá",
      _elapsed: 5000,
    },
  });
  expect([201, 202]).toContain(resp.status());
  const body = await resp.json();
  expect(body.ok).toBe(true);
});

test("lead inválido retorna 422 com campos", async ({ request }) => {
  const resp = await request.post("/api/leads", {
    data: { nome: "M", telefone: "123", email: "nope" },
  });
  expect(resp.status()).toBe(422);
  const body = await resp.json();
  expect(body.error).toBe("validation_error");
  expect(Object.keys(body.fields).length).toBeGreaterThan(0);
});

test("honeypot é descartado silenciosamente", async ({ request }) => {
  const resp = await request.post("/api/leads", {
    data: {
      nome: "Bot",
      telefone: "(11) 99999-0000",
      email: "bot@spam.com",
      _gotcha: "preenchido",
    },
  });
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.spam).toBe(true);
});

test("agendamento válido gera protocolo", async ({ request }) => {
  const resp = await request.post("/api/appointments", {
    data: {
      nome: "João Silva",
      telefone: "(11) 99999-0000",
      email: "joao@teste.com",
      procedimento: "Implantes",
      data: MONDAY,
      horario: "09:00",
      unidade: "Unidade Paulista",
      consent: true,
      _elapsed: 5000,
    },
  });
  expect([201, 202]).toContain(resp.status());
  const body = await resp.json();
  expect(body.protocol).toMatch(/^VIT-\d{8}-[0-9A-F]{4}$/);
  expect(body.whatsapp).toContain("wa.me");
});

test("agendamento em domingo é rejeitado (409)", async ({ request }) => {
  const resp = await request.post("/api/appointments", {
    data: {
      nome: "João Silva",
      telefone: "(11) 99999-0000",
      email: "joao@teste.com",
      procedimento: "Implantes",
      data: SUNDAY,
      horario: "09:00",
      unidade: "Unidade Paulista",
      consent: true,
      _elapsed: 5000,
    },
  });
  expect(resp.status()).toBe(409);
});

test("headers de segurança estão presentes", async ({ request }) => {
  const resp = await request.get("/");
  const headers = resp.headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
});
