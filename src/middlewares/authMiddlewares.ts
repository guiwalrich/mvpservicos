import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mvp_agendamento_2025_seguro_abc123";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ erro: "Token não fornecido" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).empresa = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}