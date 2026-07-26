import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { enviarCodigoVerificacaoEmail, testarConexaoSMTP } from "../services/emailService";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "desenvolvimento_secret_key_123";

// REGISTRO (Criar Conta da Empresa com 7 Dias de Trial Grátis)
router.post("/registro", async (req: Request, res: Response) => {
  const { nome, email, senha, nicho } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios" });
  }

  const emailExiste = await prisma.empresa.findUnique({ where: { email } });
  if (emailExiste) {
    return res.status(400).json({ erro: "Este e-mail já está cadastrado no sistema" });
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  let slug = nome.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  
  const slugExiste = await prisma.empresa.findUnique({ where: { slug } });
  if (slugExiste) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const trialExpira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const empresa = await prisma.empresa.create({
    data: {
      nome,
      email,
      senha: senha_hash,
      nicho: nicho || "Geral",
      slug,
      plano: "trial",
      status_assinatura: "trial",
      trial_expira_em: trialExpira,
    },
  });

  res.status(201).json({
    mensagem: "Empresa criada com sucesso. Faça login para acessar sua conta.",
    empresa: { id: empresa.id, nome: empresa.nome, email: empresa.email, slug: empresa.slug },
  });
});

// PASSO 1 DO LOGIN: Valida credenciais, gera código e envia por e-mail
router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios" });
  }

  const empresa = await prisma.empresa.findUnique({ where: { email } });
  if (!empresa) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const valida = await bcrypt.compare(senha, empresa.senha);
  if (!valida) return res.status(401).json({ erro: "Email ou senha inválidos" });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracao = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.empresa.update({
    where: { id: empresa.id },
    data: {
      codigo_login: codigo,
      codigo_expira_em: expiracao,
    },
  });

  // Aguarda o envio do e-mail e retorna o erro real se falhar
  const resultado = await enviarCodigoVerificacaoEmail(empresa.email, empresa.nome, codigo);

  if (!resultado.sucesso) {
    return res.json({
      requereCodigo: true,
      email: empresa.email,
      erroEmail: true,
      mensagem: `⚠️ Não foi possível enviar o e-mail: ${resultado.erro}. Verifique as configurações SMTP do servidor.`,
    });
  }

  res.json({
    requereCodigo: true,
    email: empresa.email,
    mensagem: "Código de verificação enviado! Verifique sua caixa de entrada e a pasta de Spam.",
  });
});

// PASSO 2 DO LOGIN: Valida o código de 6 dígitos e emite o token JWT
router.post("/verificar-codigo", async (req: Request, res: Response) => {
  const { email, codigo } = req.body;
  if (!email || !codigo) {
    return res.status(400).json({ erro: "E-mail e código de verificação são obrigatórios" });
  }

  const empresa = await prisma.empresa.findUnique({ where: { email } });
  if (!empresa) {
    return res.status(404).json({ erro: "Empresa não encontrada" });
  }

  if (!empresa.codigo_login || !empresa.codigo_expira_em) {
    return res.status(400).json({ erro: "Nenhum código pendente. Solicite um novo código de acesso." });
  }

  if (new Date() > empresa.codigo_expira_em) {
    return res.status(400).json({ erro: "O código de verificação expirou. Solicite um novo código." });
  }

  if (empresa.codigo_login !== codigo.toString().trim()) {
    return res.status(400).json({ erro: "Código de verificação incorreto. Verifique os números e tente novamente." });
  }

  await prisma.empresa.update({
    where: { id: empresa.id },
    data: {
      codigo_login: null,
      codigo_expira_em: null,
    },
  });

  const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    mensagem: "Login realizado com sucesso",
    token,
    empresa: {
      id: empresa.id,
      nome: empresa.nome,
      nicho: empresa.nicho,
      slug: empresa.slug,
      plano: empresa.plano,
      status_assinatura: empresa.status_assinatura,
      trial_expira_em: empresa.trial_expira_em,
      proximo_vencimento: empresa.proximo_vencimento,
    },
  });
});

// REENVIAR CÓDIGO
router.post("/reenviar-codigo", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ erro: "E-mail é obrigatório" });
  }

  const empresa = await prisma.empresa.findUnique({ where: { email } });
  if (!empresa) {
    return res.status(404).json({ erro: "Empresa não encontrada" });
  }

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracao = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.empresa.update({
    where: { id: empresa.id },
    data: {
      codigo_login: codigo,
      codigo_expira_em: expiracao,
    },
  });

  const resultado = await enviarCodigoVerificacaoEmail(empresa.email, empresa.nome, codigo);

  if (!resultado.sucesso) {
    return res.json({
      erroEmail: true,
      mensagem: `⚠️ Falha no reenvio: ${resultado.erro}`,
    });
  }

  res.json({
    mensagem: "Novo código enviado! Confira sua caixa de entrada e pasta de Spam.",
  });
});

// DIAGNÓSTICO: Testar se o SMTP está funcionando
router.get("/testar-smtp", async (req: Request, res: Response) => {
  const resultado = await testarConexaoSMTP();
  res.json(resultado);
});

export default router;