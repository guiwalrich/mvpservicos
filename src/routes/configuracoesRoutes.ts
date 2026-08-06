import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/authMiddlewares";

const router = Router();

// Autenticação e validação de assinatura tratadas no index.ts


router.get("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const configuracao = await prisma.configuracao.findUnique({ where: { empresa_id: empresaId } });

  if (!configuracao) {
    return res.status(404).json({ erro: "Configuração não encontrada" });
  }

  res.json(configuracao);
});

router.put("/", async (req: Request, res: Response) => {
  const empresaId = (req as any).empresa.id;
  const {
    horario_abertura,
    horario_fechamento,
    intervalo_minutos,
    dias_funcionamento,
    horarios_disponiveis,
    lembrete_24h,
    lembrete_1h,
  } = req.body;

  const existente = await prisma.configuracao.findUnique({ where: { empresa_id: empresaId } });

  const dados = {
    horario_abertura: horario_abertura || "09:00",
    horario_fechamento: horario_fechamento || "19:00",
    intervalo_minutos: intervalo_minutos ? parseInt(intervalo_minutos, 10) : 30,
    dias_funcionamento: dias_funcionamento || "1,2,3,4,5,6",
    horarios_disponiveis: horarios_disponiveis || null,
    lembrete_24h: lembrete_24h !== undefined ? Boolean(lembrete_24h) : true,
    lembrete_1h: lembrete_1h !== undefined ? Boolean(lembrete_1h) : true,
  };

  if (!existente) {
    const configuracao = await prisma.configuracao.create({
      data: { empresa_id: empresaId, ...dados },
    });
    return res.json(configuracao);
  }

  const configuracao = await prisma.configuracao.update({
    where: { empresa_id: empresaId },
    data: dados,
  });

  res.json(configuracao);
});

// GET /configuracoes/empresa - Retorna os dados do perfil do estabelecimento
router.get("/empresa", async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).empresa.id;
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        id: true,
        nome: true,
        email: true,
        slug: true,
        nicho: true,
        logo: true,
        iconUrl: true,
        telefone: true,
        endereco: true,
        latitude: true,
        longitude: true,
        instagram: true,
      },
    });

    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada" });
    }

    res.json(empresa);
  } catch (error: any) {
    res.status(500).json({ erro: "Erro ao buscar dados do perfil da empresa" });
  }
});

// PUT /configuracoes/empresa - Atualiza dados do perfil do estabelecimento
router.put("/empresa", async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).empresa.id;
    const {
      nome,
      slug,
      nicho,
      telefone,
      endereco,
      latitude,
      longitude,
      instagram,
      iconUrl,
      logo,
    } = req.body;

    const safeNumber = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const empresaAtualizada = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ...(nome && { nome }),
        ...(slug && { slug }),
        ...(nicho && { nicho }),
        ...(telefone !== undefined && { telefone: telefone || null }),
        ...(endereco !== undefined && { endereco: endereco || null }),
        ...(latitude !== undefined && { latitude: safeNumber(latitude) }),
        ...(longitude !== undefined && { longitude: safeNumber(longitude) }),
        ...(instagram !== undefined && { instagram: instagram || null }),
        ...(iconUrl !== undefined && { iconUrl: iconUrl || null }),
        ...(logo !== undefined && { logo: logo || null }),
      },
    });

    res.json({
      sucesso: true,
      mensagem: "Perfil da empresa atualizado com sucesso!",
      empresa: empresaAtualizada,
    });
  } catch (error: any) {
    console.error("[ERRO PUT CONFIGURACOES EMPRESA]", error);
    res.status(500).json({ erro: "Erro ao atualizar dados do perfil da empresa" });
  }
});

// POST /configuracoes/icon - Upload de ícone/logo da empresa (Salva localmente em public/company-icons)
router.post("/icon", async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).empresa.id;
    const { imagemBase64, filename } = req.body;

    if (!imagemBase64) {
      return res.status(400).json({ erro: "Imagem não fornecida" });
    }

    // Validação de tamanho (máximo 2MB)
    const buffer = Buffer.from(
      imagemBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ erro: "A imagem excede o limite máximo permitido de 2 MB." });
    }

    // Extensão do arquivo
    let ext = "png";
    if (imagemBase64.includes("data:image/jpeg") || imagemBase64.includes("data:image/jpg")) ext = "jpg";
    else if (imagemBase64.includes("data:image/svg+xml")) ext = "svg";
    else if (imagemBase64.includes("data:image/webp")) ext = "webp";

    const fs = require("fs");
    const path = require("path");
    const iconsDir = path.join(process.cwd(), "public", "company-icons");

    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    const nomeArquivo = `icon-empresa-${empresaId}-${Date.now()}.${ext}`;
    const caminhoCompleto = path.join(iconsDir, nomeArquivo);

    fs.writeFileSync(caminhoCompleto, buffer);

    const relativeUrl = `/company-icons/${nomeArquivo}`;

    // Atualiza iconUrl no banco de dados da empresa
    await prisma.empresa.update({
      where: { id: empresaId },
      data: { iconUrl: relativeUrl },
    });

    res.json({
      sucesso: true,
      iconUrl: relativeUrl,
      mensagem: "Ícone da empresa atualizado e salvo localmente com sucesso!",
    });
  } catch (error: any) {
    console.error("[ERRO POST CONFIGURACOES ICON]", error);
    res.status(500).json({ erro: "Erro ao realizar upload do ícone da empresa" });
  }
});

// POST /configuracoes/testar-whatsapp - Testa disparo WhatsApp via Evolution API
router.post("/testar-whatsapp", async (req: Request, res: Response) => {
  try {
    const { telefone, mensagem } = req.body;
    if (!telefone) {
      return res.status(400).json({ erro: "Telefone de destino é obrigatório" });
    }

    const { enviarLembreteWhatsApp } = await import("../services/whatsappService");
    const texto = mensagem || "👋 Olá! Esta é uma mensagem de teste enviada pela plataforma Agende.yo via Evolution API.";

    const resultado = await enviarLembreteWhatsApp(telefone, texto);

    res.json(resultado);
  } catch (error: any) {
    console.error("[ERRO POST CONFIGURACOES TESTAR-WHATSAPP]", error);
    res.status(500).json({ erro: "Erro ao testar envio de mensagem WhatsApp" });
  }
});

export default router;
