import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/servicos",
  "/sobre",
  "/blog",
  "/blog-post",
  "/blog-post-implante",
  "/blog-post-infantil",
  "/contato",
  "/agendamento",
  "/privacidade",
];

test.describe("rotas principais", () => {
  for (const route of ROUTES) {
    test(`${route} responde 200 com conteúdo`, async ({ page }) => {
      const resp = await page.goto(route);
      expect(resp?.status()).toBe(200);
      await expect(page.locator("#main")).toBeVisible();
      await expect(page.locator(".header")).toBeVisible();
      await expect(page.locator(".footer")).toBeVisible();
    });
  }
});

test("redirect 301 de .html para rota limpa", async ({ request }) => {
  const resp = await request.get("/sobre.html", { maxRedirects: 0 });
  expect([301, 308]).toContain(resp.status());
  expect(resp.headers()["location"]).toContain("/sobre");
});

test("links de WhatsApp apontam para wa.me", async ({ page }) => {
  await page.goto("/");
  const href = await page.getAttribute("a.wa-float", "href");
  expect(href).toContain("wa.me");
});

test("formulário de contato envia para a API e mostra feedback", async ({ page }) => {
  await page.goto("/contato");
  const requestPromise = page.waitForRequest(
    (r) => r.url().includes("/api/leads") && r.method() === "POST",
  );
  await page.fill("#ct-nome", "Maria Teste");
  await page.fill("#ct-tel", "(11) 99999-0000");
  await page.fill("#ct-email", "maria@teste.com");
  await page.fill("#ct-msg", "Olá, gostaria de um orçamento.");
  await page.check('[data-contact-form] input[type="checkbox"]');
  await page.click('[data-contact-form] button[type="submit"]');
  const request = await requestPromise;
  expect(request.postData() ?? "").toContain("maria@teste.com");
  await expect(page.locator("[data-form-feedback]")).toBeVisible();
});

test("acessibilidade da home sem violações sérias (WCAG 2.1 AA)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
