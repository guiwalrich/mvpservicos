import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";

const router = Router();
// Autenticação e validação de assinatura tratadas no index.ts


// GET - Listar horários de funcionamento da empresa
router.get("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const horarios = await prisma.horarioFuncionamento.findMany({
    where: { empresa_id: empresaId },
    orderBy: { dia_semana: "asc" },
  });

  // Se não existir nenhum, criar defaults
  if (horarios.length === 0) {
    const defaults = [];
    for (let dia = 0; dia < 7; dia++) {
      const aberto = dia >= 1 && dia <= 6; // Seg-Sab aberto, Dom fechado
      const created = await prisma.horarioFuncionamento.create({
        data: {
          empresa_id: empresaId,
          dia_semana: dia,
          hora_abertura: "09:00",
          hora_fechamento: "19:00",
          aberto,
        },
      });
      defaults.push(created);
    }
    return res.json(defaults);
  }

  res.json(horarios);
});

// PUT - Atualizar horário de um dia específico
router.put("/:diaSemana", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const diaSemanaParam = Array.isArray(req.params.diaSemana) ? req.params.diaSemana[0] : req.params.diaSemana;
  const diaSemana = parseInt(diaSemanaParam || "", 10);
  const { hora_abertura, hora_fechamento, aberto } = req.body;

  if (isNaN(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    return res.status(400).json({ erro: "Dia da semana inválido (0-6)" });
  }

  const horario = await prisma.horarioFuncionamento.upsert({
    where: {
      empresa_id_dia_semana: { empresa_id: empresaId, dia_semana: diaSemana },
    },
    update: {
      hora_abertura: hora_abertura ?? undefined,
      hora_fechamento: hora_fechamento ?? undefined,
      aberto: aberto ?? undefined,
    },
    create: {
      empresa_id: empresaId,
      dia_semana: diaSemana,
      hora_abertura: hora_abertura || "09:00",
      hora_fechamento: hora_fechamento || "19:00",
      aberto: aberto ?? true,
    },
  });

  res.json(horario);
});

export default router;

