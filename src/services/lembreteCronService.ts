import cron from "node-cron";
import prisma from "../config/prisma";
import { enviarLembreteWhatsApp } from "./whatsappService";

export async function verificarEEnviarLembretes() {
  try {
    const agora = new Date();

    // ==========================================
    // 1. LEMBRETES DE 24 HORAS ANTES
    // ==========================================
    const inicio24h = new Date(agora.getTime() + (23 * 60 + 50) * 60 * 1000); // +23h50m
    const fim24h = new Date(agora.getTime() + (24 * 60 + 10) * 60 * 1000);    // +24h10m

    const agendamentos24h = await prisma.agendamento.findMany({
      where: {
        status: { not: "cancelado" },
        data_hora: { gte: inicio24h, lte: fim24h },
        empresa: {
          plano: { in: ["equipe", "premium", "trial"] },
          configuracoes: {
            lembrete_24h: true,
          },
        },
        lembretes: {
          none: { tipo: "24h" },
        },
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        empresa: true,
      },
    });

    for (const ag of agendamentos24h) {
      if (!ag.cliente.telefone || ag.cliente.telefone.replace(/\D/g, "").length < 10) continue;

      const dataFormatada = ag.data_hora.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const horaFormatada = ag.data_hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      const mensagem = `⏰ *Lembrete de Agendamento (Amanhã)!*\n\nOlá ${ag.cliente.nome}, passando para lembrar do seu agendamento na *${ag.empresa.nome}* amanhã (${dataFormatada}) às ${horaFormatada}.\n\n✂️ Serviço: ${ag.servico.nome}\n👤 Profissional: ${ag.profissional.nome}\n\nTe esperamos lá! 😊`;

      await enviarLembreteWhatsApp(ag.cliente.telefone, mensagem);

      await prisma.lembrete.create({
        data: {
          empresa_id: ag.empresa_id,
          agendamento_id: ag.id,
          tipo: "24h",
          status: "enviado",
        },
      });
    }

    // ==========================================
    // 2. LEMBRETES DE 1 HORA ANTES
    // ==========================================
    const inicio1h = new Date(agora.getTime() + 50 * 60 * 1000); // +50 min
    const fim1h = new Date(agora.getTime() + 70 * 60 * 1000);    // +70 min

    const agendamentos1h = await prisma.agendamento.findMany({
      where: {
        status: { not: "cancelado" },
        data_hora: { gte: inicio1h, lte: fim1h },
        empresa: {
          plano: { in: ["equipe", "premium", "trial"] },
          configuracoes: {
            lembrete_1h: true,
          },
        },
        lembretes: {
          none: { tipo: "1h" },
        },
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        empresa: true,
      },
    });

    for (const ag of agendamentos1h) {
      if (!ag.cliente.telefone || ag.cliente.telefone.replace(/\D/g, "").length < 10) continue;

      const horaFormatada = ag.data_hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      const mensagem = `🚀 *Seu agendamento é daqui a 1 hora!*\n\nOlá ${ag.cliente.nome}, seu atendimento na *${ag.empresa.nome}* será hoje às ${horaFormatada}.\n\n✂️ Serviço: ${ag.servico.nome}\n👤 Profissional: ${ag.profissional.nome}\n\nAté breve! 👋`;

      await enviarLembreteWhatsApp(ag.cliente.telefone, mensagem);

      await prisma.lembrete.create({
        data: {
          empresa_id: ag.empresa_id,
          agendamento_id: ag.id,
          tipo: "1h",
          status: "enviado",
        },
      });
    }
  } catch (error) {
    console.error("Erro na execução do Cron de Lembretes:", error);
  }
}

export function iniciarCronLembretes() {
  console.log("⏰ Serviço de Lembretes Automáticos WhatsApp (24h / 1h) inicializado.");
  
  // Executa uma checagem inicial imediata ao ligar o servidor
  verificarEEnviarLembretes();

  // Executa a cada 10 minutos
  cron.schedule("*/10 * * * *", () => {
    verificarEEnviarLembretes();
  });
}
