import { CLINIC } from "@/lib/site";

export default function SiteWidgets() {
  return (
    <>
      <a
        className="sticky-cta"
        data-wa="Olá! Vim pelo site e quero agendar minha avaliação."
        data-wa-from="sticky"
        href={`https://wa.me/${CLINIC.whatsapp}`}
        aria-label="Agendar avaliação"
      >
        Agendar avaliação
      </a>
      <a
        className="wa-float"
        data-wa="Olá! Vim pelo site e gostaria de agendar uma avaliação."
        data-wa-from="float"
        href={`https://wa.me/${CLINIC.whatsapp}`}
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 00-8.7 15L2 22l5.2-1.3A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8 1 .8 1.8 1.1 2 1.2.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6 0 1.2z" />
        </svg>
      </a>
      <button className="to-top" aria-label="Voltar ao topo">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19V5M6 11l6-6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="lgpd" role="dialog" aria-label="Aviso de privacidade">
        <p>
          Usamos cookies para melhorar sua experiência e analisar o tráfego. Ao continuar, você
          concorda com nossa Política de Privacidade (LGPD).
        </p>
        <button className="btn btn--primary" data-lgpd-accept>
          Aceitar
        </button>
      </div>
    </>
  );
}
