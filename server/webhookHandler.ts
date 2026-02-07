import { Request, Response } from 'express';
import { db } from './db';
import { mensagens, contatos, numerosWhatsapp } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// ... interfaces mantidas ...
interface WebhookPayload {
  event: string;
  instance: string;
  data: any;
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const payload: WebhookPayload = req.body;
    
    // Log mais limpo
    if (payload.event !== 'qrcode.updated') { 
        console.log(`[Webhook] Event: ${payload.event} | Instance: ${payload.instance}`);
    }

    if (payload.event === 'messages.upsert') {
      await processIncomingMessage(payload);
    }
    
    // Precisamos retornar 200 rápido para a Evolution não tentar reenviar
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ success: false });
  }
}

async function processIncomingMessage(payload: WebhookPayload) {
  const { data, instance } = payload;
  const { key, message, pushName } = data;

  if (key.fromMe) return; // Ignora msg enviada pelo próprio sistema

  // 1. Descobrir qual é a empresa dona dessa instância
  const [conexao] = await db
    .select()
    .from(numerosWhatsapp)
    .where(eq(numerosWhatsapp.nome, instance))
    .limit(1);

  if (!conexao) {
    console.warn(`[Webhook] Instância '${instance}' não encontrada no banco. Ignorando msg.`);
    return;
  }

  const tenantId = conexao.tenantId; // Agora temos o ID da empresa correto!

  // 2. Processar Contato
  const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '');
  
  let [contact] = await db
    .select()
    .from(contatos)
    .where(eq(contatos.telefone, phoneNumber))
    .limit(1);

  if (!contact) {
    const result = await db.insert(contatos).values({
      tenantId,
      nome: pushName || phoneNumber,
      telefone: phoneNumber,
      status: 'novo',
    });
    // Busca o contato criado
    [contact] = await db.select().from(contatos).where(eq(contatos.id, Number(result[0].insertId)));
  }

  // 3. Salvar Mensagem
  // Extração simples de texto (pode melhorar com helpers)
  const text = message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || "[Mídia]";
  const tipo = message.imageMessage ? 'imagem' : message.audioMessage ? 'audio' : 'texto';

  await db.insert(mensagens).values({
    tenantId,
    contatoId: contact.id,
    remetente: 'contato',
    conteudo: text,
    tipo,
    lida: false,
    createdAt: new Date(),
  });
  
  console.log(`[Webhook] Msg salva para empresa ${tenantId} de ${phoneNumber}`);
}