import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";

const router = Router();

const getRouteParamId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

// Autenticação e validação de assinatura tratadas no index.ts


router.get("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const agendamentos = await prisma.agendamento.findMany({
    where: { empresa_id: empresaId },
    include: {
      cliente: true,
      profissional: true,
      servico: true,
    },
    orderBy: { data_hora: "asc" },
  });
  res.json(agendamentos);
});

router.post("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const { cliente_id, profissional_id, servico_id, data_hora, observacao } = req.body;

  if (!cliente_id || !profissional_id || !servico_id || !data_hora) {
    return res.status(400).json({ erro: "Cliente, profissional, serviço e data/hora são obrigatórios" });
  }

  // Verificar conflito de horário
  const dataAgendamento = new Date(data_hora);
  const diaSemana = dataAgendamento.getDay();

  // Obter duração do serviço (verifica personalizada primeiro)
  const profServico = await prisma.profissionalServico.findUnique({
    where: { profissional_id_servico_id: { profissional_id: parseInt(profissional_id), servico_id: parseInt(servico_id) } },
  });
  const servico = await prisma.servico.findUnique({ where: { id: parseInt(servico_id) } });
  const duracaoMin = profServico?.duracao_min || servico?.duracao_min || 30;

  // Verificar horário de funcionamento da empresa
  const horarioEmpresa = await prisma.horarioFuncionamento.findUnique({
    where: { empresa_id_dia_semana: { empresa_id: empresaId, dia_semana: diaSemana } },
  });

  if (horarioEmpresa && !horarioEmpresa.aberto) {
    return res.status(400).json({ erro: "A empresa não abre neste dia" });
  }

  if (horarioEmpresa) {
    const horaStr = `${dataAgendamento.getHours().toString().padStart(2, "0")}:${dataAgendamento.getMinutes().toString().padStart(2, "0")}`;
    if (horaStr < horarioEmpresa.hora_abertura || horaStr >= horarioEmpresa.hora_fechamento) {
      return res.status(400).json({ erro: "Fora do horário de funcionamento" });
    }
  }

  // Verificar disponibilidade do profissional
  const dispProfissional = await prisma.disponibilidadeProfissional.findUnique({
    where: { profissional_id_dia_semana: { profissional_id: parseInt(profissional_id), dia_semana: diaSemana } },
  });

  if (dispProfissional && !dispProfissional.aberto) {
    return res.status(400).json({ erro: "Profissional não disponível neste dia" });
  }

  if (dispProfissional) {
    const horaStr = `${dataAgendamento.getHours().toString().padStart(2, "0")}:${dataAgendamento.getMinutes().toString().padStart(2, "0")}`;
    if (horaStr < dispProfissional.hora_inicio || horaStr >= dispProfissional.hora_fim) {
      return res.status(400).json({ erro: "Fora do horário de atendimento do profissional" });
    }
  }

  // Verificar conflito com outros agendamentos
  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissional_id: parseInt(profissional_id),
      data_hora: {
        gte: new Date(dataAgendamento.getTime() - duracaoMin * 60000),
        lt: new Date(dataAgendamento.getTime() + duracaoMin * 60000),
      },
      status: { not: "cancelado" },
    },
  });

  if (conflito) {
    return res.status(409).json({ erro: "Já existe um agendamento neste horário para este profissional" });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      cliente_id: parseInt(cliente_id),
      profissional_id: parseInt(profissional_id),
      servico_id: parseInt(servico_id),
      data_hora: dataAgendamento,
      observacao,
      empresa_id: empresaId,
    },
    include: {
      cliente: true,
      profissional: true,
      servico: true,
    },
  });
  res.status(201).json(agendamento);
});

router.put("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);
  const { status, forma_pagamento, valor_pago } = req.body;

  const agendamento = await prisma.agendamento.updateMany({
    where: { id, empresa_id: empresaId },
    data: { status, forma_pagamento, valor_pago },
  });

  if (agendamento.count === 0) return res.status(404).json({ erro: "Agendamento não encontrado" });
  res.json({ mensagem: "Agendamento atualizado" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);

  const agendamento = await prisma.agendamento.deleteMany({
    where: { id, empresa_id: empresaId },
  });

  if (agendamento.count === 0) return res.status(404).json({ erro: "Agendamento não encontrado" });
  res.json({ mensagem: "Agendamento removido" });
});

export default router;