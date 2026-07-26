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
  const profissionais = await prisma.profissional.findMany({ where: { empresa_id: empresaId } });
  res.json(profissionais);
});

router.post("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const { nome, email, telefone, cor_agenda, comissao } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { plano: true, status_assinatura: true },
  });

  const plano = empresa?.plano || "trial";
  const totalProf = await prisma.profissional.count({ where: { empresa_id: empresaId } });

  if (plano === "solo" && totalProf >= 1) {
    return res.status(403).json({
      erro: "O seu plano Solo permite apenas 1 profissional cadastrado. Faça o upgrade para o plano Equipe para cadastrar mais membros.",
      limiteAtingido: true,
      planoAtual: "solo",
      maximoPermitido: 1,
    });
  }

  if (plano === "equipe" && totalProf >= 5) {
    return res.status(403).json({
      erro: "O seu plano Equipe permite até 5 profissionais cadastrados. Faça o upgrade para o plano Premium para cadastrar equipe ilimitada.",
      limiteAtingido: true,
      planoAtual: "equipe",
      maximoPermitido: 5,
    });
  }

  const profissional = await prisma.profissional.create({
    data: {
      nome,
      email,
      telefone,
      cor_agenda: cor_agenda || "#7AB8D6",
      comissoes: comissao ? parseFloat(comissao) : 50,
      empresa_id: empresaId,
    },
  });
  res.status(201).json(profissional);
});

router.put("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);
  const { nome, email, telefone, cor_agenda, comissao, ativo } = req.body;

  const profissional = await prisma.profissional.updateMany({
    where: { id, empresa_id: empresaId },
    data: { nome, email, telefone, cor_agenda, comissoes: comissao, ativo },
  });

  if (profissional.count === 0) return res.status(404).json({ erro: "Profissional não encontrado" });
  res.json({ mensagem: "Profissional atualizado" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);

  const profissional = await prisma.profissional.deleteMany({
    where: { id, empresa_id: empresaId },
  });

  if (profissional.count === 0) return res.status(404).json({ erro: "Profissional não encontrado" });
  res.json({ mensagem: "Profissional removido" });
});

// ===== SUB-ROTAS: Duração personalizada por serviço =====

// GET - Listar durações personalizadas do profissional
router.get("/:id/servicos", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });
  const profissionalId = parseInt(idParam, 10);

  const profissional = await prisma.profissional.findFirst({
    where: { id: profissionalId, empresa_id: empresaId },
  });
  if (!profissional) return res.status(404).json({ erro: "Profissional não encontrado" });

  const servicos = await prisma.profissionalServico.findMany({
    where: { profissional_id: profissionalId },
    include: { servico: true },
  });

  res.json(servicos);
});

// POST - Criar/atualizar duração personalizada para um serviço
router.post("/:id/servicos", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });
  const profissionalId = parseInt(idParam, 10);
  
  const { servico_id, duracao_min, preco } = req.body;
  if (!servico_id || !duracao_min) {
    return res.status(400).json({ erro: "servico_id e duracao_min são obrigatórios" });
  }

  const profissional = await prisma.profissional.findFirst({
    where: { id: profissionalId, empresa_id: empresaId },
  });
  if (!profissional) return res.status(404).json({ erro: "Profissional não encontrado" });

  const servico = await prisma.servico.findFirst({
    where: { id: parseInt(servico_id), empresa_id: empresaId },
  });
  if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });

  const relacao = await prisma.profissionalServico.upsert({
    where: {
      profissional_id_servico_id: { profissional_id: profissionalId, servico_id: parseInt(servico_id) },
    },
    update: {
      duracao_min: parseInt(duracao_min),
      preco: preco ? parseFloat(preco) : undefined,
    },
    create: {
      profissional_id: profissionalId,
      servico_id: parseInt(servico_id),
      duracao_min: parseInt(duracao_min),
      preco: preco ? parseFloat(preco) : null,
    },
    include: { servico: true },
  });

  res.status(201).json(relacao);
});

// DELETE - Remover duração personalizada (volta ao padrão do serviço)
router.delete("/:id/servicos/:servicoId", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  const servicoIdParam = getRouteParamId(req.params.servicoId);
  if (!idParam || !servicoIdParam) return res.status(400).json({ erro: "IDs inválidos" });

  const profissionalId = parseInt(idParam);
  const servicoId = parseInt(servicoIdParam);

  const result = await prisma.profissionalServico.deleteMany({
    where: { profissional_id: profissionalId, servico_id: servicoId, profissional: { empresa_id: empresaId } },
  });

  if (result.count === 0) return res.status(404).json({ erro: "Relação não encontrada" });
  res.json({ mensagem: "Duração personalizada removida" });
});

export default router;
