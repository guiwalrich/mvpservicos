export async function enviarLembreteWhatsApp(telefone: string, mensagem: string): Promise<string> {
  const numero = telefone.replace(/\D/g, "");
  const texto = encodeURIComponent(mensagem);
  const link = `https://wa.me/55${numero}?text=${texto}`;

  console.log(`📱 [WHATSAPP DISPARADO] Para: +55${numero}`);
  console.log(`Mensagem: "${mensagem}"`);
  console.log(`Link Direto: ${link}\n`);

  // Futura integração com provedores de API como Evolution API, Z-API ou Twilio
  return link;
}