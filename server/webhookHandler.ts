/**
 * Webhook Handler para Evolution API
 * Recebe eventos do WhatsApp (mensagens, status de conexão, etc)
 */

import { Request, Response } from 'express';
import { getDb } from './db';
import { mensagens, contatos } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface WebhookMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
    imageMessage?: {
      url: string;
      caption?: string;
    };
    videoMessage?: {
      url: string;
      caption?: string;
    };
    audioMessage?: {
      url: string;
    };
    documentMessage?: {
      url: string;
      fileName?: string;
    };
  };
  messageTimestamp: number;
  pushName?: string;
}

interface WebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: any;
    messageTimestamp?: number;
    pushName?: string;
  };
}

/**
 * Extrair texto da mensagem
 */
function extractMessageText(message: any): string {
  if (message.conversation) {
    return message.conversation;
  }
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text;
  }
  if (message.imageMessage?.caption) {
    return message.imageMessage.caption;
  }
  if (message.videoMessage?.caption) {
    return message.videoMessage.caption;
  }
  if (message.documentMessage?.fileName) {
    return `Documento: ${message.documentMessage.fileName}`;
  }
  if (message.audioMessage) {
    return '[Áudio]';
  }
  return '[Mensagem sem texto]';
}

/**
 * Extrair tipo de mídia
 */
function extractMediaType(message: any): 'text' | 'image' | 'video' | 'audio' | 'document' {
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.audioMessage) return 'audio';
  if (message.documentMessage) return 'document';
  return 'text';
}

/**
 * Extrair URL de mídia
 */
function extractMediaUrl(message: any): string | null {
  if (message.imageMessage?.url) return message.imageMessage.url;
  if (message.videoMessage?.url) return message.videoMessage.url;
  if (message.audioMessage?.url) return message.audioMessage.url;
  if (message.documentMessage?.url) return message.documentMessage.url;
  return null;
}

/**
 * Handler principal do webhook
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    const payload: WebhookPayload = req.body;

    console.log('[Webhook] Evento recebido:', payload.event);
    console.log('[Webhook] Instância:', payload.instance);
    console.log('[Webhook] Dados:', JSON.stringify(payload.data, null, 2));

    // Processar apenas mensagens recebidas
    if (payload.event === 'messages.upsert') {
      await processIncomingMessage(payload);
    }

    // Processar status de conexão
    if (payload.event === 'connection.update') {
      await processConnectionUpdate(payload);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar webhook' });
  }
}

/**
 * Processar mensagem recebida
 */
async function processIncomingMessage(payload: WebhookPayload) {
  const db = await getDb();
  if (!db) {
    console.warn('[Webhook] Banco de dados não disponível');
    return;
  }

  const { data, instance } = payload;
  const { key, message, messageTimestamp, pushName } = data;

  // Ignorar mensagens enviadas por nós
  if (key.fromMe) {
    console.log('[Webhook] Mensagem enviada por nós, ignorando');
    return;
  }

  // Extrair número do contato (remover @s.whatsapp.net)
  const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '');

  // Verificar se contato existe, senão criar
  let contact = await db
    .select()
    .from(contatos)
    .where(eq(contatos.telefone, phoneNumber))
    .limit(1);

  if (contact.length === 0) {
    // Criar novo contato
    await db.insert(contatos).values({
      tenantId: 1, // TODO: Obter tenantId correto baseado na instância
      nome: pushName || phoneNumber,
      telefone: phoneNumber,
      status: 'novo',
      ticketStatus: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Buscar contato recém-criado
    contact = await db
      .select()
      .from(contatos)
      .where(eq(contatos.telefone, phoneNumber))
      .limit(1);
  }

  if (contact.length === 0) {
    console.error('[Webhook] Erro ao criar/buscar contato');
    return;
  }

  const contactId = contact[0].id;

  // Extrair informações da mensagem
  const messageText = extractMessageText(message);
  const mediaType = extractMediaType(message);
  const mediaUrl = extractMediaUrl(message);

  // Salvar mensagem no banco
  await db.insert(mensagens).values({
    tenantId: 1, // TODO: Obter tenantId correto baseado na instância
    contatoId: contactId,
    vendedorId: null,
    remetente: 'contato',
    conteudo: messageText,
    tipo: mediaType === 'text' ? 'texto' : mediaType === 'image' ? 'imagem' : mediaType === 'audio' ? 'audio' : 'arquivo',
    arquivoUrl: mediaUrl,
    lida: false,
    createdAt: new Date(),
  });

  console.log('[Webhook] Mensagem salva no banco:', {
    contactId,
    phoneNumber,
    messageText,
    mediaType,
  });
}

/**
 * Processar atualização de conexão
 */
async function processConnectionUpdate(payload: WebhookPayload) {
  console.log('[Webhook] Atualização de conexão:', payload.data);
  
  // TODO: Atualizar status da conexão no banco de dados
  // Exemplo: marcar instância como conectada/desconectada
}
