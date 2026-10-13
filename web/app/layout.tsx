import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SiteWidgets from "@/components/SiteWidgets";
import SiteInteractions from "@/components/SiteInteractions";
import BackendForms from "@/components/BackendForms";
import { CLINIC } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  metadataBase: new URL(CLINIC.url),
  title: {
    default: "Clínica Vitalis — Odontologia Premium em São Paulo",
    template: "%s · Clínica Vitalis",
  },
  description:
    "Clínica odontológica premium: implantes, ortodontia, clareamento e estética dental. Agende sua avaliação com especialistas. Atendimento humanizado e tecnologia de ponta.",
  applicationName: "Clínica Vitalis",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: CLINIC.url,
    siteName: CLINIC.name,
    title: "Clínica Vitalis — Odontologia Premium",
    description: "Implantes, ortodontia, clareamento e estética dental com especialistas.",
    images: [{ url: "/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clínica Vitalis — Odontologia Premium",
    description: "Implantes, ortodontia, clareamento e estética dental com especialistas.",
    images: ["/og.png"],
  },
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("vitalis-theme")||"auto";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="auto"?(d?"dark":"light"):t;var e=document.documentElement;e.setAttribute("data-theme",r);e.setAttribute("data-theme-choice",t);}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/inter-normal-800-latin.woff2"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <SiteWidgets />
        <SiteInteractions />
        <BackendForms />
      </body>
    </html>
  );
}
