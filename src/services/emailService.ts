import nodemailer from "nodemailer";

export async function enviarCodigoVerificacaoEmail(
  emailDestino: string,
  nomeEmpresa: string,
  codigo: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`\n==================================================`);
    console.log(`[SMTP NÃO CONFIGURADO] Código para ${emailDestino}: ${codigo}`);
    console.log(`==================================================\n`);
    return { sucesso: false, erro: "Servidor de e-mail (SMTP) não configurado. Adicione SMTP_HOST, SMTP_USER e SMTP_PASS nas variáveis de ambiente." };
  }

  try {
    // Para Gmail, o remetente (FROM) DEVE ser o mesmo e-mail autenticado
    const fromAddress = smtpHost.includes("gmail")
      ? `"MVP Agenda" <${smtpUser}>`
      : (process.env.SMTP_FROM || `"MVP Agenda" <${smtpUser}>`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">MVP Agenda</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Segurança da Conta</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #cbd5e1; margin-top: 0;">Olá, <strong>${nomeEmpresa}</strong>!</p>
          <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
            Recebemos uma solicitação de login em sua conta. Utilize o código de verificação abaixo para concluir seu acesso:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 36px;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${codigo}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Válido por 10 minutos</p>
          </div>
          <div style="background-color: rgba(234, 179, 8, 0.1); border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13.5px; color: #fef08a; font-weight: 600;">
              ⚠️ Não encontrou o e-mail na Caixa de Entrada?
            </p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #fef9c3; line-height: 1.4;">
              Verifique a sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
            </p>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Se você não solicitou este código, ignore este e-mail.
          </p>
        </div>
        <div style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="font-size: 12px; color: #475569; margin: 0;">
            &copy; ${new Date().getFullYear()} MVP Agenda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: emailDestino,
      subject: `🔑 Seu Código de Acesso: ${codigo} - MVP Agenda`,
      html: htmlContent,
    });

    console.log(`[EMAIL OK] Código enviado para ${emailDestino}`);
    return { sucesso: true };
  } catch (error: any) {
    const mensagemErro = error?.message || "Erro desconhecido";
    console.error(`[EMAIL ERRO] Falha ao enviar para ${emailDestino}:`, mensagemErro);
    return { sucesso: false, erro: mensagemErro };
  }
}

// Função de diagnóstico para testar a conexão SMTP
export async function testarConexaoSMTP(): Promise<{ ok: boolean; detalhes: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      ok: false,
      detalhes: `Variáveis ausentes: ${!smtpHost ? "SMTP_HOST " : ""}${!smtpUser ? "SMTP_USER " : ""}${!smtpPass ? "SMTP_PASS" : ""}`.trim(),
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.verify();
    return { ok: true, detalhes: `Conectado com sucesso a ${smtpHost}:${smtpPort} como ${smtpUser}` };
  } catch (error: any) {
    return { ok: false, detalhes: error?.message || "Falha na conexão SMTP" };
  }
}
