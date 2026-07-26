import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

const router = Router();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin_mvp_secret_2025";

function getParamId(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-admin-secret"] || req.query.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ erro: "Acesso administrativo negado. Secret inválido." });
  }
  next();
}

// ROTA PÚBLICA / AUTENTICADA DE CHECAGEM DO STATUS DA ASSINATURA DA EMPRESA
router.get("/status-empresa/:id", async (req: Request, res: Response) => {
  const idStr = getParamId(req.params.id);
  const empresaId = parseInt(idStr, 10);
  if (isNaN(empresaId)) return res.status(400).json({ erro: "ID inválido" });

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: {
      id: true,
      nome: true,
      email: true,
      plano: true,
      status_assinatura: true,
      trial_expira_em: true,
      proximo_vencimento: true,
    },
  });

  if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });

  const agora = new Date();
  let diasRestantes = 0;
  let bloqueado = false;

  if (empresa.status_assinatura === "ativo" && empresa.proximo_vencimento) {
    diasRestantes = Math.max(0, Math.ceil((empresa.proximo_vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));
    if (diasRestantes <= 0) bloqueado = true;
  } else if (empresa.status_assinatura === "trial" && empresa.trial_expira_em) {
    diasRestantes = Math.max(0, Math.ceil((empresa.trial_expira_em.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));
    if (diasRestantes <= 0) bloqueado = true;
  } else {
    bloqueado = true;
  }

  res.json({
    ...empresa,
    dias_restantes: diasRestantes,
    bloqueado,
  });
});

// ROTAS ADMINISTRATIVAS PROTEGIDAS VIA ADMIN_SECRET
router.use(adminAuthMiddleware);

// GET - Listar todas as empresas com dados de assinatura
router.get("/empresas", async (req: Request, res: Response) => {
  const empresas = await prisma.empresa.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      nicho: true,
      plano: true,
      status_assinatura: true,
      trial_expira_em: true,
      proximo_vencimento: true,
      criado_em: true,
    },
    orderBy: { id: "desc" },
  });

  const agora = new Date();
  const formatadas = empresas.map(emp => {
    let diasRestantes = 0;
    if (emp.status_assinatura === "ativo" && emp.proximo_vencimento) {
      diasRestantes = Math.max(0, Math.ceil((emp.proximo_vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (emp.status_assinatura === "trial" && emp.trial_expira_em) {
      diasRestantes = Math.max(0, Math.ceil((emp.trial_expira_em.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      ...emp,
      dias_restantes: diasRestantes,
    };
  });

  res.json(formatadas);
});

// PUT - Desbloquear ou renovar o plano por EMAIL ou ID
router.put(["/empresas/desbloquear", "/empresas/:id/desbloquear"], async (req: Request, res: Response) => {
  const { email, id, plano = "solo", dias = 30 } = req.body;
  const paramIdStr = getParamId(req.params.id);

  let targetWhere: { id?: number; email?: string } = {};

  if (email) {
    targetWhere = { email: email.toString().trim() };
  } else if (id || paramIdStr) {
    const numId = parseInt((id || paramIdStr).toString(), 10);
    if (isNaN(numId)) return res.status(400).json({ erro: "ID ou E-mail da empresa inválidos" });
    targetWhere = { id: numId };
  } else {
    return res.status(400).json({ erro: "Informe o 'email' ou 'id' da empresa para desbloqueio." });
  }

  const empresaExiste = await prisma.empresa.findFirst({ where: targetWhere });
  if (!empresaExiste) {
    return res.status(404).json({ erro: "Nenhuma empresa foi encontrada com o E-mail ou ID fornecido." });
  }

  const novovencimento = new Date(Date.now() + parseInt(dias, 10) * 24 * 60 * 60 * 1000);

  const empresa = await prisma.empresa.update({
    where: { id: empresaExiste.id },
    data: {
      status_assinatura: "ativo",
      plano: plano.toString().toLowerCase(),
      proximo_vencimento: novovencimento,
    },
  });

  res.json({
    mensagem: `Empresa '${empresa.nome}' (${empresa.email}) desbloqueada com sucesso no plano '${empresa.plano}' até ${novovencimento.toLocaleDateString("pt-BR")}.`,
    empresa: {
      id: empresa.id,
      nome: empresa.nome,
      email: empresa.email,
      plano: empresa.plano,
      status_assinatura: empresa.status_assinatura,
      proximo_vencimento: empresa.proximo_vencimento,
    },
  });
});

// PUT - Bloquear acesso de uma empresa por EMAIL ou ID
router.put(["/empresas/bloquear", "/empresas/:id/bloquear"], async (req: Request, res: Response) => {
  const { email, id } = req.body;
  const paramIdStr = getParamId(req.params.id);

  let targetWhere: { id?: number; email?: string } = {};

  if (email) {
    targetWhere = { email: email.toString().trim() };
  } else if (id || paramIdStr) {
    const numId = parseInt((id || paramIdStr).toString(), 10);
    if (isNaN(numId)) return res.status(400).json({ erro: "ID ou E-mail da empresa inválidos" });
    targetWhere = { id: numId };
  } else {
    return res.status(400).json({ erro: "Informe o 'email' ou 'id' da empresa para bloquear." });
  }

  const empresaExiste = await prisma.empresa.findFirst({ where: targetWhere });
  if (!empresaExiste) {
    return res.status(404).json({ erro: "Nenhuma empresa foi encontrada com o E-mail ou ID fornecido." });
  }

  const empresa = await prisma.empresa.update({
    where: { id: empresaExiste.id },
    data: {
      status_assinatura: "bloqueado",
    },
  });

  res.json({
    mensagem: `Empresa '${empresa.nome}' (${empresa.email}) foi bloqueada manualmente.`,
    empresa,
  });
});

export default router;
