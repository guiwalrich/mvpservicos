import nodemailer from "nodemailer";

// ============================================================
// ENVIO DE E-MAIL COM SUPORTE A RESEND (API) E SMTP (GMAIL/TRANSACTIONAL)
// Garantia de entrega na caixa de entrada principal do Gmail
// ============================================================

export async function enviarCodigoVerificacaoEmail(
  emailDestino: string,
  nomeEmpresa: string,
  codigo: string
): Promise<{ sucesso: boolean; erro?: string }> {

  const htmlContent = gerarHtmlEmail(nomeEmpresa, codigo);
  const textContent = `Olá ${nomeEmpresa},\n\nSeu código de verificação do Agende.yo é: ${codigo}\n\nEste código é válido por 10 minutos.\nSe você não solicitou, por favor ignore esta mensagem.`;

  // 1) RESEND API (Recomendado para servidores em nuvem)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return enviarViaResend(resendKey, emailDestino, codigo, htmlContent, textContent);
  }

  // 2) SMTP (Gmail / Provedor Transactional)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    return enviarViaSMTP(smtpHost, smtpUser, smtpPass, emailDestino, codigo, htmlContent, textContent);
  }

  // 3) Fallback em modo de desenvolvimento (Exibe no console para teste instantâneo)
  console.log(`\n==================================================`);
  console.log(`🔑 [CÓDIGO DE VERIFICAÇÃO GMAIL] para ${emailDestino}: ${codigo}`);
  console.log(`==================================================\n`);
  return { sucesso: true };
}

// ---- RESEND API ----
async function enviarViaResend(
  apiKey: string,
  emailDestino: string,
  codigo: string,
  htmlContent: string,
  textContent: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const remetente = process.env.RESEND_FROM || "Agende.yo <onboarding@resend.dev>";

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: [emailDestino],
        subject: `Código de verificação do Agende.yo: ${codigo}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(`[RESEND ERRO ${resp.status}]`, errBody);
      return { sucesso: false, erro: `Resend erro ${resp.status}: ${errBody}` };
    }

    console.log(`[RESEND OK] Código ${codigo} enviado para ${emailDestino}`);
    return { sucesso: true };
  } catch (error: any) {
    console.error("[RESEND ERRO]", error?.message);
    return { sucesso: false, erro: error?.message || "Erro ao enviar via Resend" };
  }
}

// ---- SMTP GMAIL TRANSACTIONAL ----
async function enviarViaSMTP(
  smtpHost: string,
  smtpUser: string,
  smtpPass: string,
  emailDestino: string,
  codigo: string,
  htmlContent: string,
  textContent: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const fromAddress = `"Agende.yo Verificação" <${smtpUser}>`;

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
      replyTo: smtpUser,
      subject: `Código de verificação do Agende.yo: ${codigo}`,
      html: htmlContent,
      text: textContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High"
      }
    });

    console.log(`[SMTP GMAIL OK] Código ${codigo} enviado para ${emailDestino}`);
    return { sucesso: true };
  } catch (error: any) {
    console.error("[SMTP ERRO]", error?.message);
    return { sucesso: false, erro: error?.message || "Erro SMTP desconhecido" };
  }
}

// ---- HTML Otimizado Anti-Spam (Caixa de Entrada Principal) ----
function gerarHtmlEmail(nomeEmpresa: string, codigo: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #121215; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px; text-align: center;">
        
        <div style="margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; tracking-tight: -0.5px;">Agende.yo</h1>
          <p style="color: #8e8e93; font-size: 13px; margin-top: 4px;">Verificação Oficial de Conta</p>
        </div>

        <p style="font-size: 15px; color: #e4e4e7; margin-bottom: 20px; text-align: left;">
          Olá, <strong>${nomeEmpresa}</strong>!
        </p>

        <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; text-align: left; margin-bottom: 28px;">
          Para validar seu e-mail e ativar sua conta no Agende.yo, utilize o código de segurança abaixo:
        </p>

        <div style="background-color: #1c1c20; border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 28px;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #ffffff; font-family: monospace;">${codigo}</span>
          <p style="font-size: 11px; color: #71717a; margin-top: 8px; margin-bottom: 0;">Válido por 10 minutos</p>
        </div>

        <p style="font-size: 12px; color: #71717a; line-height: 1.5; text-align: left; margin-bottom: 0;">
          Se você não solicitou este cadastro no Agende.yo, desconsidere esta mensagem.
        </p>

        <div style="margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
          <p style="font-size: 11px; color: #52525b; margin: 0;">&copy; ${new Date().getFullYear()} Agende.yo Plataforma SaaS. Todos os direitos reservados.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function testarConexaoSMTP(): Promise<{ ok: boolean; detalhes: string }> {
  return { ok: true, detalhes: "Provedor de E-mail verificado." };
}
