import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";

const router = Router();
// Autenticação e validação de assinatura tratadas no index.ts


// GET - Listar disponibilidade de um profissional
router.get("/:profissionalId", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const profissionalIdParam = Array.isArray(req.params.profissionalId) ? req.params.profissionalId[0] : req.params.profissionalId;
  const profissionalId = parseInt(profissionalIdParam || "", 10);

  // Verificar se o profissional pertence à empresa
  const profissional = await prisma.profissional.findFirst({
    where: { id: profissionalId, empresa_id: empresaId },
  });
  if (!profissional) {
    return res.status(404).json({ erro: "Profissional não encontrado" });
  }

  let disponibilidades = await prisma.disponibilidadeProfissional.findMany({
    where: { profissional_id: profissionalId },
    orderBy: { dia_semana: "asc" },
  });

  // Se não existir nenhuma, criar defaults baseados no horário da empresa
  if (disponibilidades.length === 0) {
    const horariosEmpresa = await prisma.horarioFuncionamento.findMany({
      where: { empresa_id: empresaId },
    });

    for (let dia = 0; dia < 7; dia++) {
      const horarioEmpresa = horariosEmpresa.find(h => h.dia_semana === dia);
      const aberto = horarioEmpresa ? horarioEmpresa.aberto : (dia >= 1 && dia <= 6);
      const created = await prisma.disponibilidadeProfissional.create({
        data: {
          profissional_id: profissionalId,
          dia_semana: dia,
          hora_inicio: horarioEmpresa?.hora_abertura || "09:00",
          hora_fim: horarioEmpresa?.hora_fechamento || "19:00",
          aberto,
        },
      });
      disponibilidades.push(created);
    }
  }

  res.json(disponibilidades);
});

// PUT - Atualizar disponibilidade de um dia específico
router.put("/:profissionalId/:diaSemana", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const profIdParam = Array.isArray(req.params.profissionalId) ? req.params.profissionalId[0] : req.params.profissionalId;
  const diaParam = Array.isArray(req.params.diaSemana) ? req.params.diaSemana[0] : req.params.diaSemana;
  const profissionalId = parseInt(profIdParam || "", 10);
  const diaSemana = parseInt(diaParam || "", 10);
  const { hora_inicio, hora_fim, aberto } = req.body;

  if (isNaN(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    return res.status(400).json({ erro: "Dia da semana inválido (0-6)" });
  }

  // Verificar se o profissional pertence à empresa
  const profissional = await prisma.profissional.findFirst({
    where: { id: profissionalId, empresa_id: empresaId },
  });
  if (!profissional) {
    return res.status(404).json({ erro: "Profissional não encontrado" });
  }

  const disponibilidade = await prisma.disponibilidadeProfissional.upsert({
    where: {
      profissional_id_dia_semana: { profissional_id: profissionalId, dia_semana: diaSemana },
    },
    update: {
      hora_inicio: hora_inicio ?? undefined,
      hora_fim: hora_fim ?? undefined,
      aberto: aberto ?? undefined,
    },
    create: {
      profissional_id: profissionalId,
      dia_semana: diaSemana,
      hora_inicio: hora_inicio || "09:00",
      hora_fim: hora_fim || "19:00",
      aberto: aberto ?? true,
    },
  });

  res.json(disponibilidade);
});

export default router;

