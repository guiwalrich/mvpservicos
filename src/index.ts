import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import servicosRoutes from "./routes/servicosRoutes";
import profissionaisRoutes from "./routes/profissionaisRoutes";
import clientesRoutes from "./routes/clientesRoutes";
import agendamentosRoutes from "./routes/agendamentosRoutes";
import agendapublicaRoutes from "./routes/agendapublicaRoutes";
import configuracoesRoutes from "./routes/configuracoesRoutes";
import horariosRoutes from "./routes/horariosRoutes";
import disponibilidadeRoutes from "./routes/disponibilidadeRoutes";
import adminRoutes from "./routes/adminRoutes";
import authMiddleware from "./middlewares/authMiddlewares";
import assinaturaMiddleware from "./middlewares/assinaturaMiddleware";
import { authLimiter, publicAgendamentoLimiter } from "./middlewares/rateLimitMiddleware";
import { iniciarCronLembretes } from "./services/lembreteCronService";

import { sanitizacaoMiddleware } from "./middlewares/sanitizacaoMiddleware";

dotenv.config();

const app = express();
app.set("trust proxy", 1); // Necessário para proxies reversos do Render.com e rate-limit
app.use(cors());
app.use(express.json());

// Cabeçalhos de Segurança HTTP de Produção (Security Headers)
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Middleware de Sanitização Profunda (Anti-XSS e Anti-SQL Injection)
app.use(sanitizacaoMiddleware);

const frontendDistPath = path.join(process.cwd(), "frontend", "dist");
const hasFrontendBuild = require("fs").existsSync(frontendDistPath);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
}
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/ping", (_req, res) => res.json({ status: "online" }));
app.get("/robots.txt", (_req, res) => res.sendFile(path.join(process.cwd(), "public", "robots.txt")));

// Servir o Frontend React (Vite) para as rotas SPA
if (hasFrontendBuild) {
  app.get(["/", "/login", "/registro", "/dashboard", "/agendar/:slug"], (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });
  app.get(["/login", "/login.html", "/registro"], (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "login.html"));
  });
  app.get(["/dashboard", "/dashboard.html"], (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "dashboard.html"));
  });
  app.get("/agendar/:slug", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });
}

// Rotas com Rate Limit para Proteção contra Força Bruta e Spam
app.use("/auth", authLimiter, authRoutes);
app.use("/admin", adminRoutes);

// Rotas da empresa protegidas por Autenticação + Checagem de Assinatura/Trial
app.use("/servicos", authMiddleware, assinaturaMiddleware, servicosRoutes);
app.use("/profissionais", authMiddleware, assinaturaMiddleware, profissionaisRoutes);
app.use("/clientes", authMiddleware, assinaturaMiddleware, clientesRoutes);
app.use("/agendamentos", authMiddleware, assinaturaMiddleware, agendamentosRoutes);
app.use("/configuracoes", authMiddleware, assinaturaMiddleware, configuracoesRoutes);
app.use("/horarios", authMiddleware, assinaturaMiddleware, horariosRoutes);
app.use("/disponibilidade", authMiddleware, assinaturaMiddleware, disponibilidadeRoutes);

app.use("/agendar-api", publicAgendamentoLimiter, agendapublicaRoutes);

// Mantém os erros da API em JSON e torna indisponibilidade do banco explícita
// para o frontend, em vez de devolver a página HTML de erro do Express.
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Erro não tratado:", error);

  if (error?.code === "P1001" || error?.name === "PrismaClientInitializationError") {
    return res.status(503).json({
      erro: "Não foi possível conectar ao banco de dados. Tente novamente em instantes.",
    });
  }

  return res.status(500).json({ erro: "Erro interno do servidor." });
});

const PORTA = process.env.PORT || process.env.PORTA || 3000;
app.listen(Number(PORTA), "0.0.0.0", () => {
  console.log(`MVP rodando na porta ${PORTA}`);
  iniciarCronLembretes();
});

export default app;
