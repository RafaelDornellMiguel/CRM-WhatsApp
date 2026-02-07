/**
 * Serviço de integração com Evolution API v2
 * Documentação: https://doc.evolution-api.com/v2/pt/get-started/introduction
 */

import axios, { AxiosInstance } from 'axios';

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

interface CreateInstancePayload {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  integration?: string;
}

interface SendTextMessagePayload {
  number: string;
  text: string;
}

interface SendMediaMessagePayload {
  number: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
}

interface QRCodeResponse {
  code: string;
  base64: string;
}

interface InstanceInfo {
  instance: {
    instanceName: string;
    status: 'open' | 'close' | 'connecting';
  };
}

interface ConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}

export class EvolutionApiService {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor(config: EvolutionConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      timeout: 30000,
    });
  }

  /**
   * Criar uma nova instância do WhatsApp
   */
  async createInstance(payload: CreateInstancePayload): Promise<any> {
    try {
      const response = await this.client.post('/instance/create', {
        instanceName: payload.instanceName,
        token: payload.token,
        qrcode: payload.qrcode ?? true,
        integration: payload.integration ?? 'WHATSAPP-BAILEYS',
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao criar instância:', error.response?.data || error.message);
      throw new Error(`Falha ao criar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Conectar instância e obter QR Code
   */
  async connectInstance(instanceName: string): Promise<QRCodeResponse> {
    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao conectar instância:', error.response?.data || error.message);
      throw new Error(`Falha ao conectar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obter informações da instância
   */
  async getInstanceInfo(instanceName: string): Promise<InstanceInfo> {
    try {
      const response = await this.client.get(`/instance/fetchInstances/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao buscar instância:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verificar status de conexão da instância
   */
  async getConnectionState(instanceName: string): Promise<ConnectionState> {
    try {
      const response = await this.client.get(`/instance/connectionState/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao verificar conexão:', error.response?.data || error.message);
      throw new Error(`Falha ao verificar conexão: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Desconectar instância (logout)
   */
  async logoutInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.client.delete(`/instance/logout/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao desconectar instância:', error.response?.data || error.message);
      throw new Error(`Falha ao desconectar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Deletar instância
   */
  async deleteInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.client.delete(`/instance/delete/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao deletar instância:', error.response?.data || error.message);
      throw new Error(`Falha ao deletar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(instanceName: string, payload: SendTextMessagePayload): Promise<any> {
    try {
      const response = await this.client.post(`/message/sendText/${instanceName}`, {
        number: payload.number,
        text: payload.text,
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao enviar mensagem:', error.response?.data || error.message);
      throw new Error(`Falha ao enviar mensagem: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Enviar mensagem com mídia (imagem, vídeo, áudio, documento)
   */
  async sendMediaMessage(instanceName: string, payload: SendMediaMessagePayload): Promise<any> {
    try {
      const endpoint = `/message/sendMedia/${instanceName}`;
      const response = await this.client.post(endpoint, {
        number: payload.number,
        mediaUrl: payload.mediaUrl,
        caption: payload.caption,
        mediaType: payload.mediaType,
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao enviar mídia:', error.response?.data || error.message);
      throw new Error(`Falha ao enviar mídia: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Buscar contatos da instância
   */
  async fetchContacts(instanceName: string): Promise<any> {
    try {
      const response = await this.client.get(`/chat/fetchContacts/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao buscar contatos:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar contatos: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Buscar mensagens de um chat
   */
  async fetchMessages(instanceName: string, remoteJid: string, limit: number = 50): Promise<any> {
    try {
      const response = await this.client.get(`/chat/fetchMessages/${instanceName}`, {
        params: {
          remoteJid,
          limit,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao buscar mensagens:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar mensagens: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async markMessageAsRead(instanceName: string, remoteJid: string, messageId: string): Promise<any> {
    try {
      const response = await this.client.post(`/chat/markMessageAsRead/${instanceName}`, {
        remoteJid,
        messageId,
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao marcar como lida:', error.response?.data || error.message);
      throw new Error(`Falha ao marcar como lida: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Configurar webhook para receber mensagens
   */
  async setWebhook(instanceName: string, webhookUrl: string, events: string[] = ['messages.upsert']): Promise<any> {
    try {
      const response = await this.client.post(`/webhook/set/${instanceName}`, {
        url: webhookUrl,
        events,
        webhook_by_events: true,
      });
      return response.data;
    } catch (error: any) {
      console.error('[Evolution API] Erro ao configurar webhook:', error.response?.data || error.message);
      throw new Error(`Falha ao configurar webhook: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Singleton instance
let evolutionApiInstance: EvolutionApiService | null = null;

export function getEvolutionApi(): EvolutionApiService {
  if (!evolutionApiInstance) {
    const baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || '';

    if (!apiKey) {
      throw new Error('EVOLUTION_API_KEY não configurada. Configure via webdev_request_secrets.');
    }

    evolutionApiInstance = new EvolutionApiService({
      baseUrl,
      apiKey,
    });
  }

  return evolutionApiInstance;
}
