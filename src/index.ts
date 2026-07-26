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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Rota Principal: Serve a Landing Page Oficial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
app.get("/ping", (req, res) => res.json({ status: "online" }));

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

app.get("/agendar/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "agendar.html"));
});
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
