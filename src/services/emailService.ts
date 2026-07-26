import nodemailer from "nodemailer";

// ============================================================
// ENVIO DE E-MAIL COM SUPORTE A RESEND (API) E SMTP (FALLBACK)
// Prioridade: RESEND_API_KEY > SMTP > Console Log
// ============================================================

export async function enviarCodigoVerificacaoEmail(
  emailDestino: string,
  nomeEmpresa: string,
  codigo: string
): Promise<{ sucesso: boolean; erro?: string }> {

  const htmlContent = gerarHtmlEmail(nomeEmpresa, codigo);

  // 1) RESEND API (Funciona no Render Free sem bloqueio de portas)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return enviarViaResend(resendKey, emailDestino, codigo, htmlContent);
  }

  // 2) SMTP Tradicional (Gmail, Outlook, etc - funciona em VPS/servidores sem bloqueio)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    return enviarViaSMTP(smtpHost, smtpUser, smtpPass, emailDestino, codigo, htmlContent);
  }

  // 3) Nenhum provedor configurado - log no console
  console.log(`\n==================================================`);
  console.log(`[SEM PROVEDOR DE EMAIL] Código para ${emailDestino}: ${codigo}`);
  console.log(`Configure RESEND_API_KEY ou SMTP_HOST/SMTP_USER/SMTP_PASS`);
  console.log(`==================================================\n`);
  return { sucesso: false, erro: "Nenhum provedor de e-mail configurado. Adicione RESEND_API_KEY nas variáveis de ambiente do Render." };
}

// ---- RESEND (via fetch HTTPS - sem bloqueio de portas) ----
async function enviarViaResend(
  apiKey: string,
  emailDestino: string,
  codigo: string,
  htmlContent: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const remetente = process.env.RESEND_FROM || "MVP Agenda <onboarding@resend.dev>";

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: [emailDestino],
        subject: `🔑 Seu Código de Acesso: ${codigo} - MVP Agenda`,
        html: htmlContent,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(`[RESEND ERRO ${resp.status}]`, errBody);
      return { sucesso: false, erro: `Resend erro ${resp.status}: ${errBody}` };
    }

    console.log(`[RESEND OK] Código enviado para ${emailDestino}`);
    return { sucesso: true };
  } catch (error: any) {
    console.error("[RESEND ERRO]", error?.message);
    return { sucesso: false, erro: error?.message || "Erro ao enviar via Resend" };
  }
}

// ---- SMTP Tradicional (Gmail, Outlook, etc) ----
async function enviarViaSMTP(
  smtpHost: string,
  smtpUser: string,
  smtpPass: string,
  emailDestino: string,
  codigo: string,
  htmlContent: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const fromAddress = smtpHost.includes("gmail")
      ? `"MVP Agenda" <${smtpUser}>`
      : (process.env.SMTP_FROM || `"MVP Agenda" <${smtpUser}>`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.sendMail({
      from: fromAddress,
      to: emailDestino,
      subject: `🔑 Seu Código de Acesso: ${codigo} - MVP Agenda`,
      html: htmlContent,
    });

    console.log(`[SMTP OK] Código enviado para ${emailDestino}`);
    return { sucesso: true };
  } catch (error: any) {
    console.error("[SMTP ERRO]", error?.message);
    return { sucesso: false, erro: error?.message || "Erro SMTP desconhecido" };
  }
}

// ---- HTML do E-mail ----
function gerarHtmlEmail(nomeEmpresa: string, codigo: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">MVP Agenda</h1>
        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Segurança da Conta</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #cbd5e1; margin-top: 0;">Olá, <strong>${nomeEmpresa}</strong>!</p>
        <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
          Recebemos uma solicitação de login em sua conta. Utilize o código abaixo:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 36px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${codigo}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Válido por 10 minutos</p>
        </div>
        <div style="background-color: rgba(234, 179, 8, 0.1); border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13.5px; color: #fef08a; font-weight: 600;">⚠️ Não encontrou na Caixa de Entrada?</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fef9c3; line-height: 1.4;">
            Verifique a pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
          </p>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Se você não solicitou este código, ignore este e-mail.
        </p>
      </div>
      <div style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="font-size: 12px; color: #475569; margin: 0;">&copy; ${new Date().getFullYear()} MVP Agenda.</p>
      </div>
    </div>
  `;
}

// ---- Diagnóstico SMTP/Resend ----
export async function testarConexaoSMTP(): Promise<{ ok: boolean; detalhes: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resp = await fetch("https://api.resend.com/domains", {
        headers: { "Authorization": `Bearer ${resendKey}` },
      });
      if (resp.ok) {
        return { ok: true, detalhes: "Resend API conectada com sucesso! E-mails serão enviados via Resend." };
      }
      return { ok: false, detalhes: `Resend API erro ${resp.status}: Verifique se a RESEND_API_KEY está correta.` };
    } catch (err: any) {
      return { ok: false, detalhes: `Resend API erro: ${err?.message}` };
    }
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost && !smtpUser && !smtpPass) {
    return { ok: false, detalhes: "Nenhum provedor configurado. Adicione RESEND_API_KEY (recomendado para Render) ou SMTP_HOST/SMTP_USER/SMTP_PASS." };
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    return { ok: false, detalhes: `Variáveis SMTP incompletas. Faltam: ${!smtpHost ? "SMTP_HOST " : ""}${!smtpUser ? "SMTP_USER " : ""}${!smtpPass ? "SMTP_PASS" : ""}`.trim() };
  }

  try {
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
    });
    await transporter.verify();
    return { ok: true, detalhes: `SMTP conectado: ${smtpHost}:${smtpPort} como ${smtpUser}` };
  } catch (error: any) {
    return { ok: false, detalhes: `SMTP falhou: ${error?.message}. No Render Free, use RESEND_API_KEY em vez de SMTP.` };
  }
}
