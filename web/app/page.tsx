import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";
import { CLINIC } from "@/lib/site";

export const metadata: Metadata = {
  title: "Clínica Vitalis — Odontologia Premium em São Paulo",
  alternates: { canonical: "/" },
};

const DENTIST_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: CLINIC.name,
  image: `${CLINIC.url}/og.svg`,
  url: `${CLINIC.url}/`,
  telephone: "+55-41-99999-0000",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Paulista, 1000 - Sala 501",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "01310-100",
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: -23.5613, longitude: -46.6565 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "13:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "328",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vocês atendem convênios?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trabalhamos com os principais convênios odontológicos e também com atendimento particular. Consulte nossa equipe pelo WhatsApp para verificar a cobertura do seu plano.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto custa a avaliação inicial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A avaliação tem valor promocional e inclui exames de imagem. O valor é abatido caso você inicie o tratamento indicado.",
      },
    },
    {
      "@type": "Question",
      name: "É possível parcelar o tratamento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! Parcelamos em até 24x nos principais cartões e oferecemos condições especiais no PIX.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto tempo dura o tratamento com Invisalign?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende de cada caso, mas a média é de 6 a 18 meses. Na avaliação você recebe uma previsão personalizada com simulação do resultado.",
      },
    },
    {
      "@type": "Question",
      name: "A clínica atende urgências?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, reservamos horários para urgências. Pacientes do plano Família têm prioridade no atendimento.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DENTIST_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <LegacyPage page="index" />
    </>
  );
}
