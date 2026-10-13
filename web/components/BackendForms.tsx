"use client";

import { useEffect } from "react";
import { utmFromSearch } from "@/lib/leads";

const field = (form: HTMLFormElement, name: string): string => {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
};

async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json().catch(() => ({}))) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Progressive enhancement: envia os formulários legados para as APIs reais
 * sem alterar a UX já existente em `interactions.js` (validação + feedback).
 */
export default function BackendForms() {
  useEffect(() => {
    const startedAt = Date.now();
    const elapsed = () => Date.now() - startedAt;
    const meta = () => ({ origem: location.pathname, utm: utmFromSearch(location.search) });

    const contactForms = document.querySelectorAll<HTMLFormElement>("[data-contact-form]");
    const appointmentForms = document.querySelectorAll<HTMLFormElement>("[data-stepper-form]");
    const listeners: Array<[HTMLFormElement, EventListener]> = [];

    contactForms.forEach((form) => {
      const handler = () => {
        const telefone = field(form, "telefone");
        const email = field(form, "email");
        const consent = form.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (
          field(form, "nome").length < 2 ||
          !email.includes("@") ||
          telefone.replace(/\D/g, "").length < 10 ||
          !consent?.checked
        ) {
          return;
        }
        void post("/api/leads", {
          nome: field(form, "nome"),
          telefone,
          email,
          assunto: field(form, "assunto") || undefined,
          mensagem: field(form, "mensagem") || undefined,
          canal: "contato",
          _elapsed: elapsed(),
          ...meta(),
        });
      };
      form.addEventListener("submit", handler, true);
      listeners.push([form, handler]);
    });

    appointmentForms.forEach((form) => {
      const handler = () => {
        const consent = form.querySelector<HTMLInputElement>('input[type="checkbox"]');
        const data = field(form, "data");
        const horario = field(form, "horario");
        if (field(form, "nome").length < 2 || !data || !horario || !consent?.checked) return;
        void post("/api/appointments", {
          nome: field(form, "nome"),
          telefone: field(form, "telefone"),
          email: field(form, "email"),
          procedimento: field(form, "procedimento") || "Avaliação geral",
          data,
          horario,
          unidade: field(form, "unidade"),
          obs: field(form, "obs") || undefined,
          consent: true,
          _elapsed: elapsed(),
          ...meta(),
        }).then((result) => {
          const summary = form.querySelector("[data-success-summary]");
          if (summary && typeof result.protocol === "string") {
            summary.textContent = `${summary.textContent ?? ""} Protocolo ${result.protocol}.`;
          }
        });
      };
      form.addEventListener("submit", handler, true);
      listeners.push([form, handler]);
    });

    return () => {
      for (const [form, handler] of listeners) {
        form.removeEventListener("submit", handler, true);
      }
    };
  }, []);

  return null;
}
