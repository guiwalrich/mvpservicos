import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { enviarLembreteWhatsApp } from "../services/whatsappService";

const router = Router();

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
    ? date
    : null;
}

function parsePositiveId(value: unknown): number | null {
  const id = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/", (req: Request, res: Response) => {
  return res.status(400).json({ erro: "Informe um slug válido" });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const empresa = await prisma.empresa.findUnique({
    where: { slug },
    select: {
      id: true,
      nome: true,
      nicho: true,
      logo: true,
      telefone: true,
      instagram: true,
      configuracoes: true,
      profissionais: { where: { ativo: true } },
      servicos: { where: { ativo: true } },
      horariosFuncionamento: { orderBy: { dia_semana: "asc" } },
    },
  });

  if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada' });

  res.json(empresa);
});

// GET - Buscar horários disponíveis para um profissional em uma data específica
router.get('/:slug/horarios', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const { data, profissional_id, servico_id } = req.query;

  if (!data || !profissional_id || !servico_id) {
    return res.status(400).json({ erro: "data, profissional_id e servico_id são obrigatórios" });
  }

  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });

  // new Date("YYYY-MM-DD") usa UTC e pode virar o dia anterior no Brasil.
  const dataObj = parseDateOnly(data);
  const profissionalId = parsePositiveId(profissional_id);
  const servicoId = parsePositiveId(servico_id);
  if (!dataObj || !profissionalId || !servicoId) {
    return res.status(400).json({ erro: "Data ou identificadores inválidos" });
  }
  const diaSemana = dataObj.getDay(); // 0=Dom, 1=Seg, ...

  const [profissional, servico] = await Promise.all([
    prisma.profissional.findFirst({ where: { id: profissionalId, empresa_id: empresa.id, ativo: true } }),
    prisma.servico.findFirst({ where: { id: servicoId, empresa_id: empresa.id, ativo: true } }),
  ]);
  if (!profissional) return res.status(404).json({ erro: "Profissional não encontrado" });
  if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });

  // Verificar horário de funcionamento da empresa
  const horarioEmpresa = await prisma.horarioFuncionamento.findUnique({
    where: { empresa_id_dia_semana: { empresa_id: empresa.id, dia_semana: diaSemana } },
  });

  if (!horarioEmpresa || !horarioEmpresa.aberto) {
    return res.json({ horarios_disponiveis: [], motivo: "Empresa não abre neste dia" });
  }

  // Verificar disponibilidade do profissional
  const dispProfissional = await prisma.disponibilidadeProfissional.findUnique({
    where: { profissional_id_dia_semana: { profissional_id: profissionalId, dia_semana: diaSemana } },
  });

  if (!dispProfissional || !dispProfissional.aberto) {
    return res.json({ horarios_disponiveis: [], motivo: "Profissional não disponível neste dia" });
  }

  // Obter duração do serviço (verifica personalizada primeiro)
  const profServico = await prisma.profissionalServico.findUnique({
    where: { profissional_id_servico_id: { profissional_id: profissionalId, servico_id: servicoId } },
  });

  const duracaoMin = profServico?.duracao_min || servico.duracao_min;

  // Buscar agendamentos existentes no dia
  const inicioDia = new Date(dataObj);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataObj);
  fimDia.setHours(23, 59, 59, 999);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissional_id: profissionalId,
      data_hora: { gte: inicioDia, lte: fimDia },
      status: { not: "cancelado" },
    },
    orderBy: { data_hora: "asc" },
  });

  // Gerar slots de horários
  const [horaInicioEmpresa, minInicioEmpresa] = horarioEmpresa.hora_abertura.split(":").map(Number);
  const [horaFimEmpresa, minFimEmpresa] = horarioEmpresa.hora_fechamento.split(":").map(Number);

  // Usar o mais restritivo entre empresa e profissional
  const [horaInicioProf, minInicioProf] = dispProfissional.hora_inicio.split(":").map(Number);
  const [horaFimProf, minFimProf] = dispProfissional.hora_fim.split(":").map(Number);

  const horaInicio = Math.max(horaInicioEmpresa, horaInicioProf);
  const minInicio = horaInicio === horaInicioEmpresa ? minInicioEmpresa : minInicioProf;
  const horaFim = Math.min(horaFimEmpresa, horaFimProf);
  const minFim = horaFim === horaFimEmpresa ? minFimEmpresa : minFimProf;

  const agora = new Date();
  const slots: string[] = [];
  
  let currentMin = horaInicio * 60 + minInicio;
  const fimMin = horaFim * 60 + minFim;

  while (currentMin + duracaoMin <= fimMin) {
    const horas = Math.floor(currentMin / 60).toString().padStart(2, "0");
    const minutos = (currentMin % 60).toString().padStart(2, "0");
    const slotTime = `${horas}:${minutos}`;

    const slotDate = new Date(dataObj);
    slotDate.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // Verificar se slot está no passado
    if (slotDate <= agora) {
      currentMin += duracaoMin;
      continue;
    }

    // Verificar conflito com agendamentos existentes
    let conflito = false;
    for (const ag of agendamentos) {
      const agHoras = ag.data_hora.getHours();
      const agMin = ag.data_hora.getMinutes();
      const agInicioMin = agHoras * 60 + agMin;
      const agFimMin = agInicioMin + duracaoMin;

      if (currentMin < agFimMin && currentMin + duracaoMin > agInicioMin) {
        conflito = true;
        break;
      }
    }

    if (!conflito) {
      slots.push(slotTime);
    }

    currentMin += duracaoMin;
  }

  res.json({
    data: data,
    profissional_id: profissional_id,
    servico_id: servico_id,
    duracao_min: duracaoMin,
    horarios_disponiveis: slots,
  });
});

router.post('/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const { profissional_id, servico_id, data_hora, nome, telefone } = req.body;

  if (!profissional_id || !servico_id || !data_hora || !nome || !telefone) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada' });

  // Validar data/hora não passada
  const profissionalId = parsePositiveId(profissional_id);
  const servicoId = parsePositiveId(servico_id);
  const dataAgendamento = typeof data_hora === "string" ? new Date(data_hora) : new Date(NaN);
  if (!profissionalId || !servicoId || Number.isNaN(dataAgendamento.getTime())) {
    return res.status(400).json({ erro: "Data, profissional ou serviço inválidos" });
  }
  if (dataAgendamento <= new Date()) {
    return res.status(400).json({ erro: 'A data do agendamento deve ser futura' });
  }

  // Validar horário de funcionamento da empresa
  const diaSemana = dataAgendamento.getDay();
  const [profissional, servico] = await Promise.all([
    prisma.profissional.findFirst({ where: { id: profissionalId, empresa_id: empresa.id, ativo: true } }),
    prisma.servico.findFirst({ where: { id: servicoId, empresa_id: empresa.id, ativo: true } }),
  ]);
  if (!profissional) return res.status(404).json({ erro: "Profissional não encontrado" });
  if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });
  const horarioEmpresa = await prisma.horarioFuncionamento.findUnique({
    where: { empresa_id_dia_semana: { empresa_id: empresa.id, dia_semana: diaSemana } },
  });

  if (!horarioEmpresa || !horarioEmpresa.aberto) {
    return res.status(400).json({ erro: 'A empresa não abre neste dia' });
  }

  const horaStr = `${dataAgendamento.getHours().toString().padStart(2, "0")}:${dataAgendamento.getMinutes().toString().padStart(2, "0")}`;
  if (horaStr < horarioEmpresa.hora_abertura || horaStr >= horarioEmpresa.hora_fechamento) {
    return res.status(400).json({ erro: 'Fora do horário de funcionamento' });
  }

  // Validar disponibilidade do profissional
  const dispProfissional = await prisma.disponibilidadeProfissional.findUnique({
    where: { profissional_id_dia_semana: { profissional_id: profissionalId, dia_semana: diaSemana } },
  });

  if (!dispProfissional || !dispProfissional.aberto) {
    return res.status(400).json({ erro: 'Profissional não disponível neste dia' });
  }

  if (horaStr < dispProfissional.hora_inicio || horaStr >= dispProfissional.hora_fim) {
    return res.status(400).json({ erro: 'Fora do horário de atendimento do profissional' });
  }

  // Obter duração do serviço (verifica personalizada primeiro)
  const profServico = await prisma.profissionalServico.findUnique({
    where: { profissional_id_servico_id: { profissional_id: profissionalId, servico_id: servicoId } },
  });
  const duracaoMin = profServico?.duracao_min || servico.duracao_min;

  // Verificar conflito com outros agendamentos
  const fimAgendamento = new Date(dataAgendamento.getTime() + duracaoMin * 60000);
  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissional_id: profissionalId,
      data_hora: {
        gte: new Date(dataAgendamento.getTime() - duracaoMin * 60000),
        lt: fimAgendamento,
      },
      status: { not: "cancelado" },
    },
  });

  if (conflito) {
    return res.status(409).json({ erro: 'Já existe um agendamento neste horário' });
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome,
      telefone,
      empresa_id: empresa.id,
    },
  });

  const agendamento = await prisma.agendamento.create({
    data: {
      cliente_id: cliente.id,
      profissional_id: profissionalId,
      servico_id: servicoId,
      data_hora: dataAgendamento,
      empresa_id: empresa.id,
    },
  });

  try {
    if (telefone && telefone.replace(/\D/g, '').length >= 10) {
      await enviarLembreteWhatsApp(
        telefone,
        `Olá ${nome}! Seu horário foi agendado na ${empresa.nome} para ${dataAgendamento.toLocaleString("pt-BR")}.`
      );
    }
  } catch (error) {
    console.warn('Falha ao enviar lembrete WhatsApp:', error);
  }

  res.status(201).json({ mensagem: 'Agendamento realizado', agendamento });
});



// GET - Listar agendamentos do cliente pelo telefone (Publico)
router.get('/:slug/cliente/:telefone', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const telefone = req.params.telefone as string;
  
  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada' });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      empresa_id: empresa.id,
      cliente: { telefone: telefone },
      data_hora: { gte: new Date() },
      status: { not: "cancelado" }
    },
    include: {
      profissional: { select: { nome: true } },
      servico: { select: { nome: true, preco: true } },
      cliente: { select: { nome: true } }
    },
    orderBy: { data_hora: 'asc' }
  });

  res.json(agendamentos);
});

// POST - Cancelar agendamento (Publico)
router.post('/cancelar/:cancelToken', async (req: Request, res: Response) => {
  const cancelToken = req.params.cancelToken as string;
  
  const agendamento = await prisma.agendamento.findUnique({
    where: { cancel_token: cancelToken }
  });

  if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
  if (agendamento.status === 'cancelado') return res.status(400).json({ erro: 'Agendamento já está cancelado' });

  await prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { status: 'cancelado' }
  });

  res.json({ sucesso: true, mensagem: "Agendamento cancelado com sucesso." });
});

export default router;


