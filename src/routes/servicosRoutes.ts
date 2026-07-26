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
  const servicos = await prisma.servico.findMany({ where: { empresa_id: empresaId } });
  res.json(servicos);
});

router.post("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const { nome, preco, duracao_min } = req.body;
  if (!nome || !preco) return res.status(400).json({ erro: "Nome e preço são obrigatórios" });

  const servico = await prisma.servico.create({
    data: { nome, preco: parseFloat(preco), duracao_min: duracao_min ? parseInt(duracao_min) : 30, empresa_id: empresaId },
  });
  res.status(201).json(servico);
});

router.put("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);

  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);
  const { nome, preco, duracao_min, ativo } = req.body;

  const servico = await prisma.servico.updateMany({
    where: { id, empresa_id: empresaId },
    data: { nome, preco, duracao_min, ativo },
  });

  if (servico.count === 0) return res.status(404).json({ erro: "Serviço não encontrado" });
  res.json({ mensagem: "Serviço atualizado" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const idParam = getRouteParamId(req.params.id);

  if (!idParam) return res.status(400).json({ erro: "ID inválido" });

  const id = parseInt(idParam, 10);

  const servico = await prisma.servico.deleteMany({
    where: { id, empresa_id: empresaId },
  });

  if (servico.count === 0) return res.status(404).json({ erro: "Serviço não encontrado" });
  res.json({ mensagem: "Serviço removido" });

});
export default router;
