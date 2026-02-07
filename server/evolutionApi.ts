import axios from "axios";

interface EvolutionCredentials {
  baseUrl: string;
  apiKey: string;
}

const getClient = (creds: EvolutionCredentials) => {
  if (!creds.baseUrl) throw new Error("URL da API não fornecida");
  
  const baseURL = creds.baseUrl.trim().replace(/\/$/, ""); 
  const apiKey = creds.apiKey.trim();

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
    },
    timeout: 10000,
  });
};

export const evolutionApi = {
  async createInstance(creds: EvolutionCredentials, instanceName: string, webhookUrl?: string) {
    try {
      console.log(`[EVOLUTION] Criando instância '${instanceName}'...`);
      const client = getClient(creds);
      
      const payload: any = {
        instanceName: instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        reject_call: false,
        msg_call: "",
        groups_ignore: true,
        always_online: false,
        read_messages: false,
        read_status: false,
      };

      if (webhookUrl && webhookUrl.includes("http")) {
        payload.webhook = webhookUrl;
        payload.webhook_by_events = true;
        payload.events = ["QRCODE_UPDATED", "MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE"];
      }

      const response = await client.post("/instance/create", payload);
      return response.data;

    } catch (error: any) {
      if (error.response) {
        const data = error.response.data;
        // Pega a mensagem de erro onde quer que ela esteja (string ou array)
        const errorMessage = JSON.stringify(data);

        // VERIFICAÇÃO INTELIGENTE DE "JÁ EXISTE"
        // Se a API disser "already in use" ou "already exists", nós aceitamos como sucesso parcial
        if (errorMessage.includes("already in use") || errorMessage.includes("already exists")) {
            console.log("[EVOLUTION] Instância já existe. Continuando para conexão...");
            return { alreadyExists: true };
        }
        
        console.error(`[EVOLUTION ERRO] ${errorMessage}`);
        throw new Error(data?.response?.message?.[0] || "Erro ao criar instância");
      }
      throw error;
    }
  },

  async connectInstance(creds: EvolutionCredentials, instanceName: string) {
    try {
      const client = getClient(creds);
      console.log(`[EVOLUTION] Buscando QR Code para '${instanceName}'...`);
      
      // Tenta conectar/buscar QR Code
      const response = await client.get(`/instance/connect/${instanceName}`);
      
      // Às vezes o QR Code vem em lugares diferentes dependendo da versão
      return {
        code: response.data?.code || response.data?.base64,
        base64: response.data?.base64 || response.data?.code
      };
    } catch (error: any) { 
        console.warn(`[EVOLUTION] Não foi possível pegar QR Code agora: ${error.message}`);
        return null; 
    }
  },
  
  async fetchInstanceStatus(creds: EvolutionCredentials, instanceName: string) {
      try {
          const client = getClient(creds);
          const response = await client.get(`/instance/connectionState/${instanceName}`);
          return response.data;
      } catch (error: any) { return null; }
  },

  async getInstanceInfo(creds: EvolutionCredentials, instanceName: string) {
    try {
        const client = getClient(creds);
        const response = await client.get(`/instance/fetchInstances/${instanceName}`);
        return response.data;
    } catch (error: any) { return null; }
  },

  async logoutInstance(creds: EvolutionCredentials, instanceName: string) {
    try {
      const client = getClient(creds);
      await client.delete(`/instance/logout/${instanceName}`);
    } catch (error) {}
  },

  async deleteInstance(creds: EvolutionCredentials, instanceName: string) {
      try {
          const client = getClient(creds);
          await client.delete(`/instance/delete/${instanceName}`);
      } catch (error) {}
  },

  async fetchContacts(creds: EvolutionCredentials, instanceName: string) {
    try {
      const client = getClient(creds);
      const response = await client.get(`/chat/fetchContacts/${instanceName}`);
      return response.data;
    } catch (error: any) {
        return [];
    }
  },

  async sendTextMessage(creds: EvolutionCredentials, instanceName: string, number: string, text: string) {
    try {
      const client = getClient(creds);
      await client.post(`/message/sendText/${instanceName}`, {
        number,
        text,
        delay: 1200,
        linkPreview: true
      });
      return { success: true };
    } catch (error: any) {
      throw new Error("Falha ao enviar mensagem");
    }
  }
};