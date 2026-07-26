import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";

const router = Router();

// Autenticação e validação de assinatura tratadas no index.ts


router.get("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const configuracao = await prisma.configuracao.findUnique({ where: { empresa_id: empresaId } });

  if (!configuracao) {
    return res.status(404).json({ erro: "Configuração não encontrada" });
  }

  res.json(configuracao);
});

router.put("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const {
    horario_abertura,
    horario_fechamento,
    intervalo_minutos,
    dias_funcionamento,
    horarios_disponiveis,
    lembrete_24h,
    lembrete_1h,
  } = req.body;

  const existente = await prisma.configuracao.findUnique({ where: { empresa_id: empresaId } });

  const dados = {
    horario_abertura: horario_abertura || "09:00",
    horario_fechamento: horario_fechamento || "19:00",
    intervalo_minutos: intervalo_minutos ? parseInt(intervalo_minutos, 10) : 30,
    dias_funcionamento: dias_funcionamento || "1,2,3,4,5,6",
    horarios_disponiveis: horarios_disponiveis || null,
    lembrete_24h: lembrete_24h !== undefined ? Boolean(lembrete_24h) : true,
    lembrete_1h: lembrete_1h !== undefined ? Boolean(lembrete_1h) : true,
  };

  if (!existente) {
    const configuracao = await prisma.configuracao.create({
      data: { empresa_id: empresaId, ...dados },
    });
    return res.json(configuracao);
  }

  const configuracao = await prisma.configuracao.update({
    where: { empresa_id: empresaId },
    data: dados,
  });

  res.json(configuracao);
});

export default router;
