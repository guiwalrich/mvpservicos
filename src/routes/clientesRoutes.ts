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
  const clientes = await prisma.cliente.findMany({ where: { empresa_id: empresaId } });
  res.json(clientes);
});

router.post("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const { nome, telefone, email, nascimento } = req.body;
  if (!nome || !telefone) return res.status(400).json({ erro: "Nome e telefone são obrigatórios" });

  const cliente = await prisma.cliente.create({
    data: {
      nome,
      telefone,
      email,
      nascimento: nascimento ? new Date(nascimento) : null,
      empresa_id: empresaId,
    },
  });
  res.status(201).json(cliente);
});

router.put("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);
  const { nome, telefone, email, nascimento } = req.body;

  const cliente = await prisma.cliente.updateMany({
    where: { id, empresa_id: empresaId },
    data: { nome, telefone, email, nascimento: nascimento ? new Date(nascimento) : undefined },
  });

  if (cliente.count === 0) return res.status(404).json({ erro: "Cliente não encontrado" });
  res.json({ mensagem: "Cliente atualizado" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);
  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);

  const cliente = await prisma.cliente.deleteMany({
    where: { id, empresa_id: empresaId },
  });

  if (cliente.count === 0) return res.status(404).json({ erro: "Cliente não encontrado" });
  res.json({ mensagem: "Cliente removido" });
});

export default router;