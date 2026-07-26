import rateLimit from "express-rate-limit";

// Rate limit para rotas de Autenticação (previne Força Bruta e Spam de OTP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // máximo de 15 requisições por IP no intervalo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas tentativas de acesso a partir deste IP. Por segurança, aguarde 15 minutos para tentar novamente.",
  },
});

// Rate limit para o endpoint de Agendamento Público (previne Spam de reservas falsas)
export const publicAgendamentoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo de 30 agendamentos por IP no intervalo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas solicitações enviadas. Por favor, aguarde alguns minutos antes de realizar um novo agendamento.",
  },
});
