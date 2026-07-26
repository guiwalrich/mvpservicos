import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export default async function assinaturaMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const empresaId = (req as any).empresa?.id;
    if (!empresaId) {
      return res.status(401).json({ erro: "Não autorizado" });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        id: true,
        nome: true,
        plano: true,
        status_assinatura: true,
        trial_expira_em: true,
        proximo_vencimento: true,
      },
    });

    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada" });
    }

    const agora = new Date();
    let ativo = false;
    let motivo = "";

    if (empresa.status_assinatura === "ativo") {
      if (empresa.proximo_vencimento && empresa.proximo_vencimento > agora) {
        ativo = true;
      } else {
        motivo = "Sua assinatura mensal venceu. Por favor, efetue a renovação via PIX para continuar utilizando a plataforma.";
      }
    } else if (empresa.status_assinatura === "trial") {
      if (empresa.trial_expira_em && empresa.trial_expira_em > agora) {
        ativo = true;
      } else {
        motivo = "Seu período de testes grátis de 7 dias expirou! Escolha um plano para liberar o seu acesso total.";
      }
    } else {
      motivo = "Sua conta está suspensa ou bloqueada. Entre em contato com o suporte para liberação.";
    }

    if (ativo) {
      (req as any).empresaStatusAssinatura = empresa;
      return next();
    }

    return res.status(402).json({
      bloqueado: true,
      erro: motivo,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        plano: empresa.plano,
        status_assinatura: empresa.status_assinatura,
        trial_expira_em: empresa.trial_expira_em,
        proximo_vencimento: empresa.proximo_vencimento,
      },
    });
  } catch (error) {
    console.error("Erro no middleware de assinatura:", error);
    return res.status(500).json({ erro: "Erro ao verificar status da assinatura" });
  }
}
