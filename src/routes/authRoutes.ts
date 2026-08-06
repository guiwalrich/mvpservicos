import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { enviarCodigoVerificacaoEmail, testarConexaoSMTP } from "../services/emailService";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "mvp_agendamento_2025_seguro_abc123";

// Helper: Gera código aleatório de 6 dígitos
const gerarCodigoOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

// ============================================================================
// 1. REGISTRO (Criar Conta da Empresa com Envio de Código OTP & 14 Dias Trial)
// ============================================================================
router.post("/registro", async (req: Request, res: Response) => {
  try {
    let { nome, email, senha, whatsapp, nicho, aceitou_lgpd } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Nome da empresa, e-mail e senha são obrigatórios" });
    }

    email = email.trim().toLowerCase();

    // Verifica unicidade do e-mail
    const emailExiste = await prisma.empresa.findUnique({ where: { email } });
    if (emailExiste) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado no sistema." });
    }

    // Hash da senha e geração do slug
    const senha_hash = await bcrypt.hash(senha, 10);
    let slug = nome.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug) slug = `empresa-${Date.now()}`;
    
    const slugExiste = await prisma.empresa.findUnique({ where: { slug } });
    if (slugExiste) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const trialExpira = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const codigoOTP = gerarCodigoOTP();
    const expiracaoOTP = new Date(Date.now() + 10 * 60 * 1000);

    const empresa = await prisma.empresa.create({
      data: {
        nome,
        email,
        senha: senha_hash,
        nicho: nicho || "Barbearia",
        slug,
        plano: "trial",
        status_assinatura: "trial",
        trial_expira_em: trialExpira,
        email_verificado: false,
        codigo_login: codigoOTP,
        codigo_expira_em: expiracaoOTP
      },
    });

    // Dispara o e-mail com o código de 6 dígitos
    const resultadoEmail = await enviarCodigoVerificacaoEmail(empresa.email, empresa.nome, codigoOTP);

    return res.status(201).json({
      sucesso: true,
      requereCodigo: true,
      mensagem: "Empresa cadastrada com sucesso. Digite o código de 6 dígitos enviado ao seu e-mail.",
      email: empresa.email,
      erroEmail: !resultadoEmail.sucesso,
      detalheEmail: resultadoEmail.erro || null
    });
  } catch (error: any) {
    console.error("[ERRO AUTENTICACAO REGISTRO]", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar empresa. Tente novamente." });
  }
});

// ============================================================================
// 2. LOGIN (Valida credenciais, verifica e-mail ou emite OTP)
// ============================================================================
router.post("/login", async (req: Request, res: Response) => {
  try {
    let { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios" });
    }

    email = email.trim().toLowerCase();

    const empresa = await prisma.empresa.findUnique({ where: { email } });
    if (!empresa) {
      return res.status(401).json({ erro: "Credenciais inválidas. Verifique seu e-mail e senha." });
    }

    const valida = await bcrypt.compare(senha, empresa.senha);
    if (!valida) {
      return res.status(401).json({ erro: "Credenciais inválidas. Verifique seu e-mail e senha." });
    }

    // Se a conta já tiver o e-mail verificado, emite o Token JWT diretamente
    if (empresa.email_verificado) {
      const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        mensagem: "Login realizado com sucesso",
        token,
        empresa: {
          id: empresa.id,
          nome: empresa.nome,
          email: empresa.email,
          nicho: empresa.nicho,
          slug: empresa.slug,
          plano: empresa.plano,
          status_assinatura: empresa.status_assinatura,
          trial_expira_em: empresa.trial_expira_em,
        },
      });
    }

    // Se o e-mail ainda não foi verificado, gera novo código OTP e envia
    const codigoOTP = gerarCodigoOTP();
    const expiracaoOTP = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        codigo_login: codigoOTP,
        codigo_expira_em: expiracaoOTP,
      },
    });

    const resultado = await enviarCodigoVerificacaoEmail(empresa.email, empresa.nome, codigoOTP);

    return res.json({
      requereCodigo: true,
      email: empresa.email,
      mensagem: "Código de verificação enviado ao e-mail cadastrado.",
      erroEmail: !resultado.sucesso
    });
  } catch (error: any) {
    console.error("[ERRO AUTENTICACAO LOGIN]", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao realizar login. Tente novamente." });
  }
});

// ============================================================================
// 3. VERIFICAR CÓDIGO OTP (Valida o código de 6 dígitos e ativa a conta)
// ============================================================================
router.post("/verificar-codigo", async (req: Request, res: Response) => {
  try {
    let { email, codigo } = req.body;
    if (!email || !codigo) {
      return res.status(400).json({ erro: "E-mail e código de verificação são obrigatórios" });
    }

    email = email.trim().toLowerCase();
    const codigoDigitado = codigo.toString().trim();

    const empresa = await prisma.empresa.findUnique({ where: { email } });
    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada" });
    }

    // Verifica se o código expirou
    if (empresa.codigo_expira_em && new Date() > empresa.codigo_expira_em) {
      return res.status(400).json({ erro: "O código de verificação expirou. Por favor, solicite um novo envio." });
    }

    const codigoValido = empresa.codigo_login && empresa.codigo_login === codigoDigitado;

    if (!codigoValido) {
      return res.status(400).json({ erro: "Código de verificação incorreto. Verifique os dígitos e tente novamente." });
    }

    // Confirma verificação e emite o token JWT
    await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        codigo_login: null,
        codigo_expira_em: null,
        email_verificado: true,
      },
    });

    const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      sucesso: true,
      mensagem: "Conta verificada e ativada com sucesso!",
      token,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        nicho: empresa.nicho,
        slug: empresa.slug,
        plano: empresa.plano,
        status_assinatura: empresa.status_assinatura,
        trial_expira_em: empresa.trial_expira_em,
      },
    });
  } catch (error: any) {
    console.error("[ERRO AUTENTICACAO VERIFICAR CODIGO]", error);
    return res.status(500).json({ erro: "Erro interno ao verificar código. Tente novamente." });
  }
});

// ============================================================================
// 4. REENVIAR CÓDIGO OTP
// ============================================================================
router.post("/reenviar-codigo", async (req: Request, res: Response) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: "E-mail é obrigatório" });
    }

    email = email.trim().toLowerCase();
    const empresa = await prisma.empresa.findUnique({ where: { email } });
    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada" });
    }

    const codigoOTP = gerarCodigoOTP();
    const expiracaoOTP = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        codigo_login: codigoOTP,
        codigo_expira_em: expiracaoOTP,
      },
    });

    const resultado = await enviarCodigoVerificacaoEmail(empresa.email, empresa.nome, codigoOTP);

    return res.json({
      sucesso: true,
      mensagem: "Novo código enviado para seu e-mail!",
      erroEmail: !resultado.sucesso
    });
  } catch (error: any) {
    console.error("[ERRO REENVIAR CODIGO]", error);
    return res.status(500).json({ erro: "Erro ao reenviar código." });
  }
});

// ============================================================================
// 5. VALIDAR SESSÃO / TOKEN ATUAL (GET /auth/me)
// ============================================================================
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const empresa = await prisma.empresa.findUnique({ where: { id: decoded.id } });
    if (!empresa) {
      return res.status(404).json({ erro: "Sessão não encontrada" });
    }

    return res.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        nicho: empresa.nicho,
        slug: empresa.slug,
        plano: empresa.plano,
        status_assinatura: empresa.status_assinatura,
      }
    });
  } catch (error: any) {
    return res.status(401).json({ erro: "Sessão expirada ou token inválido" });
  }
});

// ============================================================================
// 6. AUTENTICAÇÃO VIA GOOGLE (POST /auth/google-auth)
// ============================================================================
router.post("/google-auth", async (req: Request, res: Response) => {
  try {
    let { email, name, picture, sub, whatsapp } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "E-mail do usuário Google não foi fornecido." });
    }

    email = email.trim().toLowerCase();

    // Busca se a empresa já está registrada no sistema pelo e-mail do Google
    let empresa = await prisma.empresa.findUnique({ where: { email } });
    let isNewUser = false;

    // Se não existir, cria o REGISTRO RASCUNHO no banco de dados
    if (!empresa) {
      isNewUser = true;
      const trialExpira = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const senhaHash = await bcrypt.hash(`GoogleDraftSecret_${Date.now()}_${Math.random()}`, 10);

      const baseSlug = (name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'empresa';
      let slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      empresa = await prisma.empresa.create({
        data: {
          nome: name || "Meu Estabelecimento",
          email,
          senha: senhaHash,
          nicho: "Barbearia",
          slug,
          plano: "trial",
          status_assinatura: "trial",
          trial_expira_em: trialExpira,
          email_verificado: true,
          iconUrl: picture || null,
          telefone: whatsapp || null,
        },
      });
    }

    // Emite o Token JWT oficial assinado pelo backend
    const token = jwt.sign({ id: empresa.id, email: empresa.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      sucesso: true,
      isNewUser,
      mensagem: isNewUser 
        ? "Conta rascunho criada via Google com sucesso. Por favor, complete o cadastro da sua empresa."
        : "Autenticação Google realizada com sucesso!",
      token,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        nicho: empresa.nicho,
        slug: empresa.slug,
        plano: empresa.plano,
        status_assinatura: empresa.status_assinatura,
        trial_expira_em: empresa.trial_expira_em,
        iconUrl: empresa.iconUrl,
        telefone: empresa.telefone,
        endereco: empresa.endereco,
      },
    });
  } catch (error: any) {
    console.error("[ERRO AUTENTICACAO GOOGLE BACKEND]", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao processar autenticação do Google." });
  }
});

// ============================================================================
// 7. DIAGNÓSTICO SMTP
// ============================================================================
router.get("/testar-smtp", async (req: Request, res: Response) => {
  const resultado = await testarConexaoSMTP();
  res.json(resultado);
});

export default router;