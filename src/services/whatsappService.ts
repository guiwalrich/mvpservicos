interface EvolutionSendTextResponse {
  key?: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
  };
  message?: any;
  status?: string;
  [key: string]: any;
}

export function formatarNumeroWhatsApp(telefone: string): string {
  let numero = telefone.replace(/\D/g, "");
  if (numero.startsWith("0")) {
    numero = numero.substring(1);
  }
  // Se for DDD + Número BR (10 ou 11 dígitos), insere DDI 55
  if (numero.length === 10 || numero.length === 11) {
    numero = `55${numero}`;
  }
  return numero;
}

export async function enviarLembreteWhatsApp(
  telefone: string,
  mensagem: string
): Promise<{ sucesso: boolean; mensagem: string; linkFallback?: string }> {
  const numero = formatarNumeroWhatsApp(telefone);
  const textoEncoded = encodeURIComponent(mensagem);
  const linkFallback = `https://wa.me/${numero}?text=${textoEncoded}`;

  const apiUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  console.log(`📱 [WHATSAPP DISPARADO] Para: +${numero}`);
  console.log(`Mensagem: "${mensagem}"`);

  // Se a Evolution API não estiver configurada no .env, faz log de instrução e retorna fallback
  if (!apiUrl || !apiKey || !instance) {
    console.log(
      `⚠️ [EVOLUTION API PENDENTE DE CONFIGURAÇÃO] Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE no .env para ativar envios automáticos.`
    );
    console.log(`Link Fallback Direct WhatsApp: ${linkFallback}\n`);
    return {
      sucesso: true,
      mensagem: "Evolution API pendente de configuração no .env. Use o link fallback wa.me",
      linkFallback,
    };
  }

  try {
    // Endpoint padrão Evolution API v1 / v2: POST /message/sendText/{instance}
    const endpoint = `${apiUrl}/message/sendText/${instance}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: numero,
        text: mensagem,
        delay: 1200,
        linkPreview: true,
      }),
    });

    const data: EvolutionSendTextResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`❌ [EVOLUTION API ERROR] Status ${response.status}:`, data);
      return {
        sucesso: false,
        mensagem: `Erro Evolution API (${response.status}): ${JSON.stringify(data)}`,
        linkFallback,
      };
    }

    console.log(
      `✅ [EVOLUTION API SUCCESS] Mensagem enviada com sucesso para +${numero}:`,
      data?.key?.id || data?.status || "OK"
    );
    return {
      sucesso: true,
      mensagem: "Mensagem enviada via Evolution API com sucesso!",
      linkFallback,
    };
  } catch (error: any) {
    console.error(`💥 [EVOLUTION API EXCEPTION]`, error);
    return {
      sucesso: false,
      mensagem: `Exceção ao conectar com a Evolution API: ${error?.message || error}`,
      linkFallback,
    };
  }
}