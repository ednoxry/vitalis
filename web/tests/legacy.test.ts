import { describe, it, expect } from "vitest";
import { transformLegacyHtml } from "@/lib/legacy";
import { CLINIC, NAV, MOBILE_NAV } from "@/lib/site";

describe("transformLegacyHtml", () => {
  it("remove tags <script>", () => {
    const out = transformLegacyHtml('<div>ok</div><script src="main.js"></script>');
    expect(out).toBe("<div>ok</div>");
  });

  it("reescreve links .html para rotas limpas", () => {
    expect(transformLegacyHtml('<a href="index.html">x</a>')).toBe('<a href="/">x</a>');
    expect(transformLegacyHtml('<a href="servicos.html">x</a>')).toBe('<a href="/servicos">x</a>');
    expect(transformLegacyHtml('<a href="servicos.html#implantes">x</a>')).toBe(
      '<a href="/servicos#implantes">x</a>',
    );
  });

  it("preserva links externos e âncoras", () => {
    expect(transformLegacyHtml('<a href="https://wa.me/55">x</a>')).toBe(
      '<a href="https://wa.me/55">x</a>',
    );
    expect(transformLegacyHtml('<a href="#main">x</a>')).toBe('<a href="#main">x</a>');
  });

  it("prefixa caminhos de imagem com /", () => {
    expect(transformLegacyHtml('<img src="img/a.jpg" />')).toBe('<img src="/img/a.jpg" />');
    expect(transformLegacyHtml('<img srcset="img/a.jpg 480w, img/b.jpg 800w" />')).toBe(
      '<img srcSet="/img/a.jpg 480w, /img/b.jpg 800w" />',
    );
  });

  it("normaliza atributos React (fetchpriority, imagesrcset)", () => {
    const out = transformLegacyHtml('<img imagesrcset="img/a.jpg 480w" fetchpriority="high" />');
    expect(out).toContain("imageSrcSet=");
    expect(out).toContain("fetchPriority=");
  });

  it("envolve <tr> órfãos em <tbody> para evitar mismatch de hidratação", () => {
    const out = transformLegacyHtml("<table><tr><td>a</td></tr></table>");
    expect(out).toBe("<table><tbody><tr><td>a</td></tr></tbody></table>");
  });

  it("não duplica tbody quando já existe", () => {
    const out = transformLegacyHtml("<table><thead><tr><th>h</th></tr></thead></table>");
    expect(out).toBe("<table><thead><tr><th>h</th></tr></thead></table>");
  });
});

describe("config do site", () => {
  it("expõe dados da clínica", () => {
    expect(CLINIC.whatsapp).toBe("5541999990000");
    expect(CLINIC.url).toMatch(/^https:\/\//);
  });

  it("tem navegação principal e mobile coerentes", () => {
    expect(NAV.length).toBe(5);
    expect(NAV[0]).toEqual({ href: "/", label: "Início" });
    expect(MOBILE_NAV.length).toBe(NAV.length + 1);
    expect(MOBILE_NAV.at(-1)?.href).toBe("/agendamento");
  });
});
