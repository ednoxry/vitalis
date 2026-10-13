"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="header">
        <div className="container nav">
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
          <nav className="nav__links" aria-label="Navegação principal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav__actions">
            <button className="icon-btn" data-theme-toggle aria-label="Alternar tema">
              <svg className="ic-moon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <svg className="ic-sun" style={{ display: "none" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Link className="btn btn--primary" href="/agendamento" data-wa-from="header">
              Agendar
            </Link>
            <button className="icon-btn hamburger" aria-label="Abrir menu" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div className="mobile-menu">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className="btn btn--primary btn--block mt-2" href="/agendamento">
          Agendar avaliação
        </Link>
      </div>
    </>
  );
}
