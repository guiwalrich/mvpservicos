import nodemailer from "nodemailer";

export async function enviarCodigoVerificacaoEmail(
  emailDestino: string,
  nomeEmpresa: string,
  codigo: string
): Promise<boolean> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || '"MVP Agenda" <nao-responda@mvpagenda.com>';

    let transporter: nodemailer.Transporter;

    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Caso SMTP não esteja configurado no .env, utiliza conta Ethereal de teste
      // ou simula o envio imprimindo no console em ambiente dev
      console.log(`\n==================================================`);
      console.log(`[EMAIL DEV LOG] Código de Verificação para ${emailDestino}`);
      console.log(`Empresa: ${nomeEmpresa}`);
      console.log(`CÓDIGO OTP: >>> ${codigo} <<<`);
      console.log(`==================================================\n`);

      // Tenta criar conta de testes do Ethereal caso queira testar visualmente
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.5px;">MVP Agenda</h1>
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

          <!-- AVISO DE CAIXA DE SPAM -->
          <div style="background-color: rgba(234, 179, 8, 0.1); border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13.5px; color: #fef08a; font-weight: 600;">
              ⚠️ Não encontrou o e-mail na Caixa de Entrada?
            </p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #fef9c3; line-height: 1.4;">
              Por favor, verifique a sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>. Caso esteja lá, marque nosso e-mail como "Não é Spam" para receber os próximos códigos diretamente na sua entrada.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Se você não solicitou este código, por favor ignore este e-mail ou altere sua senha por segurança.
          </p>
        </div>

        <div style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="font-size: 12px; color: #475569; margin: 0;">
            &copy; ${new Date().getFullYear()} MVP Agenda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to: emailDestino,
      subject: `🔑 Seu Código de Acesso: ${codigo} - MVP Agenda`,
      html: htmlContent,
    });

    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`[ETHEREAL TEST EMAIL URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de verificação:", error);
    return false;
  }
}
