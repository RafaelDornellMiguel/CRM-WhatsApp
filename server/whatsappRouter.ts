import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getEvolutionApi } from "./evolutionApi";
import { TRPCError } from "@trpc/server";

/**
 * Router de WhatsApp com integração Evolution API
 */
export const whatsappRouter = router({
  /**
   * Criar nova instância do WhatsApp
   */
  createInstance: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        token: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.createInstance({
          instanceName: input.instanceName,
          token: input.token,
          qrcode: true,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao criar instância",
        });
      }
    }),

  /**
   * Conectar instância e obter QR Code
   */
  connectInstance: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.connectInstance(input.instanceName);

        return {
          success: true,
          qrCode: result.base64,
          code: result.code,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao conectar instância",
        });
      }
    }),

  /**
   * Obter status de conexão da instância
   */
  getConnectionState: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.getConnectionState(input.instanceName);

        return {
          success: true,
          state: result.state,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao verificar conexão",
        });
      }
    }),

  /**
   * Desconectar instância (logout)
   */
  logoutInstance: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        await api.logoutInstance(input.instanceName);

        return {
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao desconectar instância",
        });
      }
    }),

  /**
   * Deletar instância
   */
  deleteInstance: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        await api.deleteInstance(input.instanceName);

        return {
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao deletar instância",
        });
      }
    }),

  /**
   * Enviar mensagem de texto
   */
  sendTextMessage: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        number: z.string().min(1),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.sendTextMessage(input.instanceName, {
          number: input.number,
          text: input.text,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao enviar mensagem",
        });
      }
    }),

  /**
   * Enviar mensagem com mídia
   */
  sendMediaMessage: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        number: z.string().min(1),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(["image", "video", "audio", "document"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.sendMediaMessage(input.instanceName, {
          number: input.number,
          mediaUrl: input.mediaUrl,
          caption: input.caption,
          mediaType: input.mediaType,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao enviar mídia",
        });
      }
    }),

  /**
   * Buscar contatos da instância
   */
  fetchContacts: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.fetchContacts(input.instanceName);

        return {
          success: true,
          contacts: result,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao buscar contatos",
        });
      }
    }),

  /**
   * Buscar mensagens de um chat
   */
  fetchMessages: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        remoteJid: z.string().min(1),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        const result = await api.fetchMessages(
          input.instanceName,
          input.remoteJid,
          input.limit
        );

        return {
          success: true,
          messages: result,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao buscar mensagens",
        });
      }
    }),

  /**
   * Marcar mensagem como lida
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        remoteJid: z.string().min(1),
        messageId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        await api.markMessageAsRead(
          input.instanceName,
          input.remoteJid,
          input.messageId
        );

        return {
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao marcar como lida",
        });
      }
    }),

  /**
   * Configurar webhook para receber mensagens
   */
  setWebhook: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1),
        webhookUrl: z.string().url(),
        events: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const api = getEvolutionApi();
        await api.setWebhook(
          input.instanceName,
          input.webhookUrl,
          input.events || ["messages.upsert"]
        );

        return {
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao configurar webhook",
        });
      }
    }),
});
