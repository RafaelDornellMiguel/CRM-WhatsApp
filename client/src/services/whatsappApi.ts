/**
 * WhatsApp API Service - Simulação para testes
 * Este serviço simula a API do WhatsApp Business para desenvolvimento
 */

import type { WhatsAppMessage } from '@/types';

// Configuração da API (simulada)
const API_CONFIG = {
  baseUrl: 'https://graph.facebook.com/v18.0',
  version: 'v18.0',
};

// Simula delay de rede
const simulateNetworkDelay = () => new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

// Gera ID único para mensagens
const generateMessageId = () => `wamid.${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Estado local para simular mensagens recebidas
let pendingIncomingMessages: WhatsAppMessage[] = [];

/**
 * Envia mensagem via WhatsApp (simulado)
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  message: string,
  accessToken?: string
): Promise<{ success: boolean; messageId: string; error?: string }> {
  await simulateNetworkDelay();

  // Simula validação
  if (!to || !message) {
    return { success: false, messageId: '', error: 'Número de destino e mensagem são obrigatórios' };
  }

  // Simula envio bem-sucedido
  const messageId = generateMessageId();
  
  console.log('[WhatsApp API] Mensagem enviada:', {
    phoneNumberId,
    to,
    message: message.substring(0, 50) + '...',
    messageId,
  });

  // Simula resposta automática após 2-5 segundos (para testes)
  if (Math.random() > 0.3) {
    setTimeout(() => {
      const responses = [
        'Obrigado pela mensagem!',
        'Vou verificar e retorno em breve.',
        'Interessante! Pode me contar mais?',
        'Perfeito, entendi.',
        'Qual o valor?',
        'Tem disponibilidade para entrega?',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      pendingIncomingMessages.push({
        id: generateMessageId(),
        from: to,
        to: phoneNumberId,
        type: 'text',
        text: { body: randomResponse },
        timestamp: new Date().toISOString(),
      });
    }, 2000 + Math.random() * 3000);
  }

  return { success: true, messageId };
}

/**
 * Busca mensagens recebidas (simulado - webhook)
 */
export async function fetchIncomingMessages(): Promise<WhatsAppMessage[]> {
  await simulateNetworkDelay();
  
  const messages = [...pendingIncomingMessages];
  pendingIncomingMessages = [];
  
  return messages;
}

/**
 * Verifica status de conexão do número
 */
export async function checkConnectionStatus(phoneNumberId: string): Promise<{
  connected: boolean;
  phoneNumber: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
}> {
  await simulateNetworkDelay();
  
  return {
    connected: true,
    phoneNumber: phoneNumberId,
    qualityRating: 'GREEN',
  };
}

/**
 * Registra webhook (simulado)
 */
export async function registerWebhook(
  phoneNumberId: string,
  callbackUrl: string,
  verifyToken: string
): Promise<{ success: boolean; error?: string }> {
  await simulateNetworkDelay();
  
  console.log('[WhatsApp API] Webhook registrado:', {
    phoneNumberId,
    callbackUrl,
    verifyToken: verifyToken.substring(0, 10) + '...',
  });
  
  return { success: true };
}

/**
 * Obtém templates de mensagem (simulado)
 */
export async function getMessageTemplates(businessAccountId: string): Promise<{
  templates: Array<{ name: string; status: string; language: string }>;
}> {
  await simulateNetworkDelay();
  
  return {
    templates: [
      { name: 'hello_world', status: 'APPROVED', language: 'pt_BR' },
      { name: 'orcamento_enviado', status: 'APPROVED', language: 'pt_BR' },
      { name: 'pedido_confirmado', status: 'APPROVED', language: 'pt_BR' },
      { name: 'entrega_agendada', status: 'PENDING', language: 'pt_BR' },
    ],
  };
}

/**
 * Envia template de mensagem (simulado)
 */
export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  languageCode: string = 'pt_BR',
  components?: any[]
): Promise<{ success: boolean; messageId: string; error?: string }> {
  await simulateNetworkDelay();
  
  const messageId = generateMessageId();
  
  console.log('[WhatsApp API] Template enviado:', {
    phoneNumberId,
    to,
    templateName,
    languageCode,
    messageId,
  });
  
  return { success: true, messageId };
}

/**
 * Marca mensagem como lida (simulado)
 */
export async function markMessageAsRead(
  phoneNumberId: string,
  messageId: string
): Promise<{ success: boolean }> {
  await simulateNetworkDelay();
  
  console.log('[WhatsApp API] Mensagem marcada como lida:', { phoneNumberId, messageId });
  
  return { success: true };
}

/**
 * Simula recebimento de mensagem (para testes)
 */
export function simulateIncomingMessage(from: string, to: string, body: string): void {
  pendingIncomingMessages.push({
    id: generateMessageId(),
    from,
    to,
    type: 'text',
    text: { body },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Hook para polling de mensagens (para uso em componentes)
 */
export function useWhatsAppPolling(
  onMessage: (message: WhatsAppMessage) => void,
  intervalMs: number = 3000
) {
  let isPolling = false;
  let intervalId: NodeJS.Timeout | null = null;

  const startPolling = () => {
    if (isPolling) return;
    isPolling = true;

    intervalId = setInterval(async () => {
      try {
        const messages = await fetchIncomingMessages();
        messages.forEach(onMessage);
      } catch (error) {
        console.error('[WhatsApp Polling] Erro:', error);
      }
    }, intervalMs);
  };

  const stopPolling = () => {
    isPolling = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { startPolling, stopPolling, isPolling };
}
