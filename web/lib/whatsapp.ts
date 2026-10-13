import { env } from "./env";

export function whatsappLink(message: string, phone: string = env.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsappMessage(input: {
  nome: string;
  procedimento: string;
  data: string;
  horario: string;
  unidade: string;
  protocol: string;
}): string {
  const dataBR = input.data.split("-").reverse().join("/");
  return (
    `Olá! Sou ${input.nome}. Acabei de solicitar uma avaliação pelo site.\n` +
    `Procedimento: ${input.procedimento}\n` +
    `Data/horário: ${dataBR} às ${input.horario}\n` +
    `Unidade: ${input.unidade}\n` +
    `Protocolo: ${input.protocol}`
  );
}

export function contactWhatsappMessage(): string {
  return "Olá! Vim pelo site e gostaria de agendar uma avaliação.";
}
