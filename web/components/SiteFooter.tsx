import Link from "next/link";
import { CLINIC } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link className="brand" href="/">
              <span className="brand__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3c-2.5 0-3.5 1-5 1S4 3.5 3.5 5.5 5 12 6 15.5 7.5 21 8.5 21s1-2 1.5-4 .5-3 2-3 1.5 1 2 3 .5 4 1.5 4 1.5-2 2.5-5.5 2-8 1.5-10S15 5 14 5s-2.5-1-5-1z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                Vitalis<small>Odontologia</small>
              </span>
            </Link>
            <p className="mt-2">
              Clínica odontológica premium em São Paulo. Tecnologia, conforto e cuidado humano para
              o seu melhor sorriso.
            </p>
            <div className="socials">
              <a
                href="https://www.instagram.com/clinicavitalis"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/clinicavitalis"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 22v-8h3l1-4h-4V8c0-1 .3-1.5 1.6-1.5H18V3.2C17.5 3.1 16.4 3 15.2 3 12.4 3 11 4.6 11 7.5V10H8v4h3v8h2z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@clinicavitalis"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 001.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 001.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 001.8-1.8C23 15.2 23 12 23 12zm-13 3V9l5 3-5 3z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <p className="footer__title">Tratamentos</p>
            <Link href="/servicos#implantes">Implantes</Link>
            <Link href="/servicos#ortodontia">Ortodontia</Link>
            <Link href="/servicos#clareamento">Clareamento</Link>
            <Link href="/servicos#lentes">Lentes de contato</Link>
          </div>
          <div>
            <p className="footer__title">Institucional</p>
            <Link href="/sobre">A clínica</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/cliente">Área do paciente</Link>
          </div>
          <div>
            <p className="footer__title">Contato</p>
            <a
              href="https://www.openstreetmap.org/?mlat=-23.5613&mlon=-46.6565#map=17/-23.5613/-46.6565"
              target="_blank"
              rel="noopener noreferrer"
            >
              {CLINIC.address.street}
            </a>
            <a href={`tel:${CLINIC.phoneTel}`}>{CLINIC.phoneDisplay}</a>
            <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            <span>CNPJ 00.000.000/0001-00</span>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="seals" aria-label="Selos de conformidade">
            <span className="seal">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>{" "}
              Conforme LGPD
            </span>
            <span className="seal">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>{" "}
              Acessível · WCAG 2.1 AA
            </span>
            <span className="seal">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="11"
                  width="16"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" />
              </svg>{" "}
              Site seguro · HTTPS
            </span>
          </div>
          <span>
            © <span data-year>2026</span> Clínica Vitalis. Todos os direitos reservados.
          </span>
          <Link href="/privacidade" style={{ color: "inherit" }}>
            Política de Privacidade (LGPD)
          </Link>
          <Link href="/admin" style={{ color: "inherit" }}>
            Painel (demo)
          </Link>
        </div>
      </div>
    </footer>
  );
}
