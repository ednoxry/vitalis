/* ==========================================================================
   Clínica Vitalis — main.js
   Vanilla JS, sem dependências. Cada módulo roda só se o elemento existir.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const CLINIC = {
    name: "Clínica Vitalis",
    whatsapp: "5541999990000", // formato internacional, só dígitos
  };
  const formatDataPT = (iso) => (iso || "").split("-").reverse().join("/");

  /* ---------- Analytics (stub) -------------------------------------------
     Em produção, troque por GA4 / Meta Pixel. Aqui apenas registra eventos. */
  const track = (event, data = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
      console.debug("[analytics]", event, data);
  };
  window.vitalisTrack = track;

  /* ---------- Leads (painel /admin) -------------------------------------
     Registra contatos e cliques em WhatsApp no localStorage para o painel
     de demonstração. Formato:
     { id, canal, origem, nome, telefone, detalhe, at }                     */
  const LEADS_KEY = "vitalis-leads";
  const UTM_KEY = "vitalis-utm";

  const getLeads = () => {
    try { return JSON.parse(localStorage.getItem(LEADS_KEY)) || []; }
    catch { return []; }
  };
  const saveLeads = (leads) => localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  const getUtm = () => {
    try { return JSON.parse(sessionStorage.getItem(UTM_KEY)) || {}; }
    catch { return {}; }
  };
  const lead = (canal, campos = {}) => {
    const utm = getUtm();
    const l = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      canal,
      origem: utm.source || utm.medium || "(direto)",
      nome: campos.nome || "",
      telefone: campos.telefone || "",
      detalhe: campos.detalhe || "",
      at: new Date().toISOString(),
    };
    const leads = getLeads();
    leads.unshift(l);
    saveLeads(leads);
    track("lead", { canal, origem: l.origem });
    return l;
  };
  window.vitalisLeads = { all: getLeads, save: saveLeads };
  window.vitalisLead = lead;

  /* ---------- Toast (feedback de "produto vivo") ------------------------ */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-show"));
    setTimeout(() => {
      el.classList.remove("is-show");
      setTimeout(() => el.remove(), 320);
    }, 3400);
  }
  window.vitalisToast = toast;

  /* ---------- UTM (para atribuição de origem) --------------------------- */
  function initUtm() {
    const p = new URLSearchParams(location.search);
    const utm = {};
    ["source", "medium", "campaign", "content", "term"].forEach((k) => {
      const v = p.get("utm_" + k);
      if (v) utm[k] = v;
    });
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }

  /* ---------- Tema (claro/escuro/auto) --------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("vitalis-theme");
    const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolve = (t) => (t === "auto" ? (prefersDark() ? "dark" : "light") : t);
    let stored = saved || "auto";
    const apply = (t) => {
      root.setAttribute("data-theme", resolve(t));
      root.setAttribute("data-theme-choice", t);
      updateThemeIcons(t);
    };
    apply(stored);

    // ícone de "auto" injetado via JS (evita duplicar markup em 11 páginas)
    const AUTO_ICON = '<svg class="ic-auto" style="display:none" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>';
    $$("[data-theme-toggle]").forEach((btn) => btn.insertAdjacentHTML("beforeend", AUTO_ICON));

    $$("[data-theme-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const order = ["light", "dark", "auto"];
        const cur = root.getAttribute("data-theme-choice") || stored || "light";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        stored = next;
        localStorage.setItem("vitalis-theme", next);
        apply(next);
        track("toggle_theme", { theme: next });
      })
    );
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (stored === "auto") apply("auto");
    });
  }

  function updateThemeIcons(choice) {
    $$("[data-theme-toggle] .ic-sun").forEach((el) => (el.style.display = choice === "dark" ? "block" : "none"));
    $$("[data-theme-toggle] .ic-moon").forEach((el) => (el.style.display = choice === "light" ? "block" : "none"));
    $$("[data-theme-toggle] .ic-auto").forEach((el) => (el.style.display = choice === "auto" ? "block" : "none"));
    $$("[data-theme-toggle]").forEach((btn) =>
      btn.setAttribute("aria-label", choice === "auto" ? "Tema automático — clique para trocar" : "Alternar tema")
    );
  }

  /* ---------- Header + menu mobile -------------------------------------- */
  function initNav() {
    const header = $(".header");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    const menu = $(".mobile-menu");
    const burger = $(".hamburger");
    if (menu && burger) {
      let savedScroll = -1;
      const close = () => {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        if (savedScroll >= 0) {
          window.scrollTo(0, savedScroll);
          savedScroll = -1;
        }
      };
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
        if (open) {
          savedScroll = window.scrollY;
          const first = $("a", menu);
          if (first) first.focus({ preventScroll: true });
        } else {
          burger.focus({ preventScroll: true });
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
          close();
          burger.focus({ preventScroll: true });
        }
      });
      $$("a", menu).forEach((a) => a.addEventListener("click", close));
    }

    // Marca link ativo
    const path = location.pathname.split("/").pop() || "index.html";
    $$(".nav__links a, .mobile-menu a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- Reveal on scroll ------------------------------------------ */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = e.target.dataset.revealDelay || 0;
            setTimeout(() => e.target.classList.add("is-in"), delay);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Contadores animados --------------------------------------- */
  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach((el) => io.observe(el));
  }

  /* ---------- Carrossel de depoimentos ---------------------------------- */
  function initCarousel() {
    const car = $("[data-carousel]");
    if (!car) return;
    const track = $(".carousel__track", car);
    const slides = $$(".carousel__slide", car);
    const dotsWrap = $(".dots", car);
    if (!track || slides.length < 2) return;
    let idx = 0;
    let timer;

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "dot" + (i === 0 ? " is-active" : "");
        d.setAttribute("aria-label", "Ir para depoimento " + (i + 1));
        d.addEventListener("click", () => go(i));
        dotsWrap.appendChild(d);
      });
    }
    const go = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      $$(".dot", car).forEach((d, k) => d.classList.toggle("is-active", k === idx));
    };
    const next = () => go(idx + 1);
    const play = () => { timer = setInterval(next, 6000); };
    const stop = () => clearInterval(timer);
    car.addEventListener("mouseenter", stop);
    car.addEventListener("mouseleave", play);
    $("[data-carousel-prev]", car)?.addEventListener("click", () => go(idx - 1));
    $("[data-carousel-next]", car)?.addEventListener("click", next);
    play();
  }

  /* ---------- Slider antes/depois --------------------------------------- */
  function initBeforeAfter() {
    $$("[data-ba]").forEach((ba) => {
      const after = $(".ba__after", ba);
      const handle = $(".ba__handle", ba);
      let dragging = false;
      const setPos = (clientX) => {
        const r = ba.getBoundingClientRect();
        let p = ((clientX - r.left) / r.width) * 100;
        p = Math.max(2, Math.min(98, p));
        after.style.clipPath = `inset(0 0 0 ${p}%)`;
        handle.style.left = p + "%";
      };
      const onDown = () => (dragging = true);
      const onUp = () => (dragging = false);
      ba.addEventListener("pointerdown", (e) => { dragging = true; setPos(e.clientX); });
      ba.addEventListener("pointermove", (e) => { if (dragging) setPos(e.clientX); });
      window.addEventListener("pointerup", onUp);
      ba.addEventListener("click", (e) => setPos(e.clientX));
    });
  }

  /* ---------- Calculadora de financiamento ------------------------------ */
  function initCalculator() {
    const calc = $("[data-calc]");
    if (!calc) return;
    const value = $("[data-calc-value]", calc);
    const months = $("[data-calc-months]", calc);
    const out = $("[data-calc-out]", calc);
    const outTotal = $("[data-calc-total]", calc);
    const valueLbl = $("[data-calc-value-label]", calc);
    const monthsLbl = $("[data-calc-months-label]", calc);
    const waBtn = $("[data-budget-wa]", calc);
    const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const update = () => {
      const v = parseFloat(value.value);
      const m = parseInt(months.value, 10);
      const fee = 0.0199; // juros mensal ilustrativo
      const parcela = v * (fee * Math.pow(1 + fee, m)) / (Math.pow(1 + fee, m) - 1);
      out.textContent = fmt(parcela) + "/mês";
      outTotal.textContent = m + "x  •  total " + fmt(parcela * m);
      if (waBtn) {
        const procs = $$("[data-proc]:checked", calc);
        const msg = ["Olá! Vi o simulador da Vitalis e quero um orçamento:"];
        if (procs.length) procs.forEach((p) => msg.push(p.dataset.procLabel));
        else msg.push("Valor de referência de R$ " + v.toLocaleString("pt-BR"));
        msg.push("Parcelamento em " + m + "x de " + fmt(parcela) + ".");
        msg.push("Total estimado: " + fmt(v) + ".");
        waBtn.href = `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(msg.join(" "))}`;
      }
    };

    const refresh = () => {
      const procs = $$("[data-proc]:checked", calc);
      if (procs.length) {
        const sum = procs.reduce((t, p) => t + parseFloat(p.dataset.procPrice || 0), 0);
        value.value = Math.min(30000, Math.max(500, sum));
      }
      if (valueLbl) valueLbl.textContent = fmt(parseFloat(value.value));
      if (monthsLbl) monthsLbl.textContent = months.value + " meses";
      update();
    };
    value.addEventListener("input", refresh);
    months.addEventListener("input", refresh);
    $$("[data-proc]", calc).forEach((p) => p.addEventListener("change", refresh));
    refresh();
  }

  /* ---------- Formulário multi-etapas (agendamento) --------------------- */
  function initStepper() {
    const form = $("[data-stepper-form]");
    if (!form) return;
    const steps = $$(".step", form);
    const dots = $$(".step-dot", form);
    const btnNext = $$("[data-step-next]", form);
    const btnPrev = $$("[data-step-prev]", form);
    const success = $("[data-step-success]", form);
    let cur = 0;

    const show = (i, scroll = true) => {
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      dots.forEach((d, k) => d.classList.toggle("is-active", k <= i));
      cur = i;
      if (scroll) form.scrollIntoView({ behavior: "smooth", block: "start" });
      track("booking_step", { step: i + 1 });
    };

    // Seleção de "choices"
    $$(".choice input", form).forEach((input) => {
      input.addEventListener("change", () => {
        $$(".choice", input.closest(".choices")).forEach((c) => c.classList.toggle("is-selected", $("input", c).checked));
      });
    });

    btnNext.forEach((b) =>
      b.addEventListener("click", () => {
        const stepEl = steps[cur];
        if (!validateStep(stepEl)) return;
        if (cur < steps.length - 1) show(cur + 1);
      })
    );
    btnPrev.forEach((b) => b.addEventListener("click", () => cur > 0 && show(cur - 1)));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem("vitalis-booking", JSON.stringify({ ...data, at: new Date().toISOString() }));
      track("booking_submit", data);
      lead("form-agenda", {
        nome: data.nome || "",
        telefone: data.telefone || "",
        detalhe: [data.procedimento, data.data ? formatDataPT(data.data) + (data.periodo ? " (" + data.periodo + ")" : "") : "", data.horario ? "às " + data.horario : "", data.unidade].filter(Boolean).join(" · "),
      });
      toast("Solicitação registrada! Confirmaremos o horário pelo WhatsApp.");
      // Monta mensagem de WhatsApp com os dados
      const msg = `Olá! Gostaria de agendar uma avaliação.%0A%0A` +
        `Nome: ${data.nome || "-"}%0A` +
        `Telefone: ${data.telefone || "-"}%0A` +
        `Procedimento: ${data.procedimento || "-"}%0A` +
        (data.data ? `Preferência: ${formatDataPT(data.data)}${data.periodo ? " (" + data.periodo + ")" : ""}${data.horario ? " às " + data.horario : ""}` : "");
      const wa = `https://wa.me/${CLINIC.whatsapp}?text=${msg}`;
      if (success) {
        steps.forEach((s) => s.classList.remove("is-active"));
        dots.forEach((d) => d.classList.add("is-active"));
        success.hidden = false;
        $("[data-success-summary]", success).innerHTML =
          `<b>${data.nome || ""}</b>, recebemos seu pedido de <b>${data.procedimento || "avaliação"}</b>.`;
        $("[data-success-whats]", success).href = wa;
        // Preenche comprovante imprimível
        const proto = "VT-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        const when = formatDataPT(data.data) + (data.periodo ? " (" + data.periodo + ")" : "") + (data.horario ? " · às " + data.horario : "");
        $("[data-receipt-proto]", form) && ($("[data-receipt-proto]", form).textContent = proto);
        $("[data-receipt-date]", form) && ($("[data-receipt-date]", form).textContent = new Date().toLocaleString("pt-BR"));
        $("[data-receipt-nome]", form) && ($("[data-receipt-nome]", form).textContent = data.nome || "—");
        $("[data-receipt-proc]", form) && ($("[data-receipt-proc]", form).textContent = data.procedimento || "Avaliação geral");
        $("[data-receipt-when]", form) && ($("[data-receipt-when]", form).textContent = when || "—");
        $("[data-receipt-unid]", form) && ($("[data-receipt-unid]", form).textContent = data.unidade || "—");
        $("[data-receipt-tel]", form) && ($("[data-receipt-tel]", form).textContent = data.telefone || "—");
      }
      // Abre WhatsApp em nova aba (protótipo)
      window.open(wa, "_blank", "noopener");
    });

    show(0, false);
  }

  function validateStep(stepEl) {
    let ok = true;
    const calEl = $("[data-calendar]", stepEl);
    if (calEl) {
      const field = calEl.closest(".field");
      const wrap = $("[data-slot-wrap]", stepEl);
      if (!$("[data-cal-date]", stepEl).value || !$("[data-cal-horario]", stepEl).value) {
        if (!$("[data-cal-date]", stepEl).value) field && field.classList.add("invalid");
        if (!$("[data-cal-horario]", stepEl).value) wrap && !wrap.hidden && wrap.classList.add("invalid");
        ok = false;
      } else {
        field && field.classList.remove("invalid");
        wrap && wrap.classList.remove("invalid");
      }
    }
    $$("[required]", stepEl).forEach((input) => {
      if (input.type === "hidden") return;
      const field = input.closest(".field") || input.closest(".choice");
      const valid = input.type === "radio"
        ? $$(`input[name="${input.name}"]`, stepEl).some((r) => r.checked)
        : input.checkValidity();
      if (field) field.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  /* ---------- Formulário de contato simples ----------------------------- */
  function initContactForm() {
    const forms = $$("[data-contact-form]");
    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateStep(form)) return;
        setBtnLoading(form.querySelector('[type="submit"]'));
        const data = Object.fromEntries(new FormData(form).entries());
        track("contact_submit", data);
        lead("form-contato", {
          nome: data.nome || data["c-nome"] || data.name || "",
          telefone: data.telefone || data["c-tel"] || "",
          detalhe: data.assunto || data["c-assunto"] || data.mensagem || data["c-msg"] || "",
        });
        toast("Nova mensagem recebida via WhatsApp e e-mail.");
        const fb = $("[data-form-feedback]", form);
        if (fb) {
          fb.hidden = false;
          fb.textContent = "Mensagem enviada! Entraremos em contato em breve. ✅";
          fb.style.color = "var(--brand-600)";
        }
        form.reset();
      });
    });
  }

  /* ---------- WhatsApp: links dinâmicos -------------------------------- */
  function initWhatsapp() {
    $$("[data-wa]").forEach((el) => {
      const text = el.dataset.wa || "Olá! Vim pelo site e gostaria de mais informações.";
      el.href = `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(text)}`;
      el.target = "_blank";
      el.rel = "noopener";
      el.addEventListener("click", () => {
        track("whatsapp_click", { from: el.dataset.waFrom || "site" });
        lead("wa-" + (el.dataset.waFrom || "site"));
      });
    });
  }

  /* ---------- Calendário de agendamento ---------------------------------- */
  const CAL_SLOTS = {
    Manhã: ["08:00", "08:40", "09:20", "10:00", "10:40", "11:20"],
    Tarde: ["13:30", "14:10", "14:50", "15:30", "16:10", "16:50"],
    Noite: ["18:00", "18:40"],
  };
  function initCalendar() {
    const cal = $("[data-calendar]");
    if (!cal) return;
    const grid = $("[data-cal-grid]", cal);
    const monthLbl = $("[data-cal-month]", cal);
    const prevBtn = $("[data-cal-prev]", cal);
    const nextBtn = $("[data-cal-next]", cal);
    const dateInp = $("[data-cal-date]", cal);
    const horInp = $("[data-cal-horario]", cal);
    const perInp = $("[data-cal-periodo]", cal);
    const field = cal.closest(".field");
    const slotWrap = $("[data-slot-wrap]", cal.closest(".step"));
    const slotBox = $("[data-cal-slots]", slotWrap);
    const dayLbl = $("[data-cal-day-label]", slotWrap);
    const slotErr = $("[data-slot-err]", slotWrap);

    const now = new Date();
    let viewY = now.getFullYear(), viewM = now.getMonth();
    let selTime = "";
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    function slotsFor(dt) {
      const all = {};
      Object.keys(CAL_SLOTS).forEach((p) => {
        if (dt.getDay() === 6 && p === "Noite") return;
        if (isSameDay(dt, now)) {
          const past = now.getHours() * 60 + now.getMinutes();
          const left = CAL_SLOTS[p].filter((t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m > past + 15;
          });
          if (left.length) all[p] = left;
        } else {
          all[p] = CAL_SLOTS[p].slice();
        }
      });
      return all;
    }

    function renderMonth() {
      monthLbl.textContent = new Date(viewY, viewM, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      prevBtn.disabled = viewY === now.getFullYear() && viewM === now.getMonth();
      grid.innerHTML = "";
      const first = new Date(viewY, viewM, 1).getDay();
      const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
      for (let i = 0; i < first; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "cal-day is-empty"; b.tabIndex = -1;
        grid.appendChild(b);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(viewY, viewM, d);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cal-day";
        b.textContent = String(d);
        const disabled = dt.getDay() === 0 || dt.getTime() < startOfToday;
        if (disabled) b.disabled = true;
        if (isSameDay(dt, now)) b.classList.add("is-today");
        if (dateInp.value && isSameDay(dt, new Date(dateInp.value + "T12:00:00"))) b.classList.add("is-selected");
        b.setAttribute("aria-label", dt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) + (disabled ? " (indisponível)" : ""));
        if (!disabled) b.addEventListener("click", () => pickDay(dt));
        grid.appendChild(b);
      }
    }

    function pickDay(dt) {
      dateInp.value = dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
      horInp.value = ""; perInp.value = ""; selTime = "";
      field.classList.remove("invalid");
      renderMonth();
      buildSlots(dt);
    }

    function buildSlots(dt) {
      const slots = slotsFor(dt);
      const keys = Object.keys(slots);
      slotBox.innerHTML = "";
      dayLbl.textContent = dt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
      slotWrap.hidden = keys.length === 0;
      if (!keys.length) {
        slotErr.textContent = "Sem horários disponíveis neste dia. Escolha outro dia.";
        slotErr.style.color = "var(--muted)";
        return;
      }
      slotErr.textContent = "";
      slotErr.style.color = "";
      keys.forEach((p) => {
        const h = document.createElement("div");
        h.className = "cal-period";
        h.textContent = p;
        slotBox.appendChild(h);
        slots[p].forEach((t) => {
          const lbl = document.createElement("label");
          lbl.className = "choice";
          lbl.innerHTML = "<input type='radio' name='slot' value='" + t + "' /><span>" + t + "</span>";
          lbl.addEventListener("change", () => {
            selTime = t;
            horInp.value = t;
            perInp.value = p;
            slotWrap.classList.remove("invalid");
            $$(".choice", slotBox).forEach((c) => c.classList.toggle("is-selected", c === lbl));
          });
          slotBox.appendChild(lbl);
        });
      });
    }

    prevBtn.addEventListener("click", () => { viewM--; if (viewM < 0) { viewM = 11; viewY--; } renderMonth(); });
    nextBtn.addEventListener("click", () => { viewM++; if (viewM > 11) { viewM = 0; viewY++; } renderMonth(); });

    renderMonth();
  }

  /* ---------- Recibo de agendamento (impressão) ------------------------- */
  function initReceipt() {
    const printBtn = $("[data-print-receipt]");
    if (!printBtn) return;
    printBtn.addEventListener("click", () => window.print());
  }

  /* ---------- Voltar ao topo ------------------------------------------- */
  function initToTop() {
    const btn = $(".to-top");
    if (!btn) return;
    window.addEventListener("scroll", () => btn.classList.toggle("is-visible", window.scrollY > 600), { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Banner LGPD ---------------------------------------------- */
  function initLGPD() {
    const banner = $(".lgpd");
    if (!banner || localStorage.getItem("vitalis-lgpd") === "ok") return;
    setTimeout(() => banner.classList.add("is-show"), 1200);
    $("[data-lgpd-accept]", banner)?.addEventListener("click", () => {
      localStorage.setItem("vitalis-lgpd", "ok");
      banner.classList.remove("is-show");
      track("lgpd_accept");
    });
  }

  /* ---------- PWA ------------------------------------------------------ */
  function initPWA() {
    if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
    if (import.meta.env.PROD) {
      window.addEventListener("load", () =>
        navigator.serviceWorker.register("/sw.js").catch(() => {})
      );
    } else {
      // Em dev o "install" do SW cachêria o CSS servido pelo Vite como
      // text/javascript (o wrapper JS), quebrando o estilo. Remove o SW
      // legado e seus caches em vez de registrar.
      navigator.serviceWorker.getRegistrations?.().then((list) =>
        list.forEach((reg) => reg.unregister())
      );
      if ("caches" in window) {
        caches.keys().then((keys) =>
          keys.filter((k) => k.startsWith("vitalis-")).forEach((k) => caches.delete(k))
        );
      }
    }
  }

  /* ---------- Ano no rodapé -------------------------------------------- */
  function initYear() {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Animações: camada de motion ------------------------------ */
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initScrollFX() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.prepend(bar);
    const header = $(".header");
    const tick = () => {
      const st = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? st / h : 0) + ")";
      if (header) header.classList.toggle("is-scrolled", st > 12);
    };
    window.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  function initRipple() {
    if (reducedMotion()) return;
    $$(".btn, .icon-btn, .chip, .cal-day, .cal__nav").forEach((el) => {
      if (el.dataset.ripple) return;
      el.dataset.ripple = "1";
      el.addEventListener(
        "pointerdown",
        (e) => {
          const r = el.getBoundingClientRect();
          const size = Math.max(r.width, r.height) * 2.2;
          el.style.setProperty("--rs", size + "px");
          el.style.setProperty("--rx", e.clientX - r.left + "px");
          el.style.setProperty("--ry", e.clientY - r.top + "px");
          el.classList.remove("is-rippling");
          void el.offsetWidth;
          el.classList.add("is-rippling");
        },
        { passive: true }
      );
      el.addEventListener("animationend", () => el.classList.remove("is-rippling"));
    });
  }

  function initStagger() {
    $$(".g-2, .g-3, .g-4, .cases, .hero__trust, .trust-item").forEach((g) => {
      Array.from(g.children).forEach((c, i) => {
        c.style.setProperty("--i", i);
        if (c.hasAttribute("data-reveal") && !c.dataset.revealDelay)
          c.dataset.revealDelay = String(i * 70);
      });
    });
  }

  function initMarquee() {
    const box = $(".logos");
    if (!box || reducedMotion()) return;
    const track = document.createElement("div");
    track.className = "logos__track";
    const items = Array.from(box.children);
    if (items.length < 2) return;
    items.forEach((n) => track.appendChild(n));
    items.forEach((n) => track.appendChild(n.cloneNode(true)));
    box.appendChild(track);
    box.classList.add("is-marquee");
  }

  function initTilt() {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const cards = $$("[data-tilt], .hero__media .hero__card");
    cards.forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      const max = parseFloat(card.dataset.tilt) || 6;
      card.addEventListener("pointerenter", () => card.classList.add("is-tilting"));
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + px * max + "deg) rotateX(" + py * -max + "deg) scale(1.02)";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.classList.remove("is-tilting");
      });
    });
  }

  /* Cartas com virada 3D (hover no desktop, toque/teclado no mobile) */
  function initFlipCards() {
    const cards = $$("[data-flip]");
    cards.forEach((card) => {
      if (card.dataset.flipBound) return;
      card.dataset.flipBound = "1";
      const toggle = () => card.classList.toggle("is-flipped");
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) toggle();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* Parallax 3D de profundidade: cena gira e camadas [data-depth] flutuam */
  function initDepthParallax() {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$("[data-depth-scene]").forEach((scene) => {
      if (scene.dataset.depthBound) return;
      scene.dataset.depthBound = "1";
      const layers = $$("[data-depth]", scene);
      scene.addEventListener("pointermove", (e) => {
        if (!scene.classList.contains("is-in")) return;
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        scene.style.transform = "rotateY(" + px * 5 + "deg) rotateX(" + py * -5 + "deg)";
        layers.forEach((l) => {
          const d = parseFloat(l.dataset.depth) || 1;
          l.style.transform = "translateZ(" + d * 34 + "px)";
        });
      });
      scene.addEventListener("pointerleave", () => {
        scene.style.transform = "";
        layers.forEach((l) => (l.style.transform = ""));
      });
    });
  }

  function initMagnetic() {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".btn--primary.btn--lg, .btn--whats.btn--lg, .btn--light.btn--lg, .btn--wa.btn--lg").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.16;
        const y = (e.clientY - r.top - r.height / 2) * 0.16;
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- Interações Premium v2 ------------------------------------ */
  function initPremiumFX() {
    initSplitReveal();
    initIntro();
    initSpotlight();
    initParallax();
    initViewTransitions();
  }

  /* Entrada elegante na primeira dobra (hero, breadcrumb, CTAs) */
  function initIntro() {
    const items = [".hero .eyebrow", ".hero h1", ".hero .lead", ".hero__cta", ".hero__trust", ".breadcrumb"]
      .map((s) => $(s))
      .filter((el) => el && !el.dataset.splitDone);
    if (reducedMotion()) { document.documentElement.classList.add("is-loaded"); return; }
    document.documentElement.classList.add("is-anim-ready");
    items.forEach((el, i) => {
      if (!el.hasAttribute("data-intro")) el.dataset.intro = "";
      el.style.setProperty("--in", i);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-loaded")));
  }

  /* Revelação progressiva de palavras em [data-split] (h1 do hero) */
  function initSplitReveal() {
    if (reducedMotion()) return;
    $$("[data-split]").forEach((el) => {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = "1";
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
      splitText(el);
      $$(".ws", el).forEach((w, i) => w.style.setProperty("--w", i));
    });
  }
  function splitText(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const words = child.textContent.split(" ").filter(Boolean);
        const frag = document.createDocumentFragment();
        words.forEach((word, k) => {
          if (k) frag.appendChild(document.createTextNode(" "));
          const s = document.createElement("span");
          s.className = "ws";
          s.setAttribute("aria-hidden", "true");
          s.textContent = word;
          frag.appendChild(s);
        });
        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitText(child);
      }
    });
  }

  /* Luz que acompanha o cursor em cards / casos / preços */
  function initSpotlight() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".card, .case, .price-card").forEach((el) => {
      el.classList.add("has-spot");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mxp", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--myp", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* Parallax sutil de rolagem (hero media) */
  function initParallax() {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = $("[data-parallax]");
    if (!el) return;
    let raf = null;
    const tick = () => {
      raf = null;
      if (!el.classList.contains("is-in")) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      const y = Math.max(-14, Math.min(14, -p * 22));
      el.style.transform = "translate3d(0, " + y.toFixed(1) + "px, 0)";
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Transições de página via View Transitions API */
  function initViewTransitions() {
    if (!document.startViewTransition) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("//")) return;
      if (a.target === "_blank" || a.rel === "external" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let url;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      e.preventDefault();
      const vt = document.startViewTransition(() => { location.href = url.href; });
      vt.ready.then(() => window.scrollTo({ top: 0 }));
    });
  }

  /* Estado de carregamento em botões de submit */
  function setBtnLoading(btn) {
    if (!btn || btn.disabled) return;
    btn.classList.add("is-loading");
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove("is-loading");
      btn.disabled = false;
    }, 700);
  }

  /* ---------- Filtro de casos ---------- */
  function initCaseFilter() {
    const chips = $$("[data-case-filter]");
    if (!chips.length) return;
    const grid = document.querySelector("[data-case-grid]");
    const cards = grid ? $$(".case", grid) : [];
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-pressed", String(c === chip));
        });
        const f = chip.dataset.caseFilter;
        cards.forEach((card) => {
          const show = f === "todos" || card.dataset.cat === f;
          card.classList.toggle("is-hidden", !show);
          if (!show) card.classList.remove("case-in");
          else {
            card.classList.remove("case-in");
            void card.offsetWidth;
            card.classList.add("case-in");
          }
        });
      });
    });
  }

  /* ---------- CTA sticky mobile ---------- */
  function initStickyCta() {
    const cta = $(".sticky-cta");
    if (!cta) return;
    const menu = $(".mobile-menu");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = 0;
    const sync = () => {
      const open = menu ? menu.classList.contains("is-open") : false;
      const show = window.scrollY > 400 && !open && !rm;
      cta.classList.toggle("is-shown", show);
      document.body.classList.toggle("sticky-cta-on", show);
    };
    window.addEventListener("scroll", () => {
      const now = Date.now();
      if (now - last > 120) { last = now; sync(); }
    }, { passive: true });
    const burger = $(".hamburger");
    if (burger) burger.addEventListener("click", () => requestAnimationFrame(sync));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") sync(); });
    sync();
  }

  /* ---------- Máscara de telefone ---------- */
  function initPhoneMask() {
    $$("input[type=tel]").forEach((el) => {
      el.addEventListener("input", () => {
        const d = el.value.replace(/\D/g, "").slice(0, 11);
        let out = d;
        if (d.length > 10) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
        else if (d.length > 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
        else if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
        else if (d.length) out = "(" + d;
        if (el.value !== out) el.value = out;
      });
    });
  }

  /* ---------- Ilha 3D (three.js, carregada sob demanda) ---------------- */
  function init3D() {
    const stage = $("[data-3d]");
    if (!stage) return;
    const weak =
      (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (_) {
      webgl = false;
    }
    if (reducedMotion() || !webgl || weak) {
      stage.classList.add("is-fallback");
      stage.dataset.fallback = "1";
      return;
    }
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      import("./tooth3d.js")
        .then((m) => m.mountTooth3D(stage))
        .catch(() => {
          stage.classList.add("is-fallback");
          stage.dataset.fallback = "1";
        });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(stage);
  }

  /* ---------- Boot ----------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initUtm();
    initTheme();
    initNav();
    initScrollFX();
    initStagger();
    initReveal();
    initRipple();
    initMarquee();
    initTilt();
    initFlipCards();
    initDepthParallax();
    initMagnetic();
    initPhoneMask();
    initCaseFilter();
    initStickyCta();
    init3D();
    initPremiumFX();
    initCounters();
    initCarousel();
    initBeforeAfter();
    initCalculator();
    initCalendar();
    initStepper();
    initContactForm();
    initWhatsapp();
    initToTop();
    initLGPD();
    initReceipt();
    initPWA();
    initYear();
  });
})();
