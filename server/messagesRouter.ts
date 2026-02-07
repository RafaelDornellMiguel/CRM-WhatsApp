/**
 * Messages Router - tRPC procedures para gerenciar mensagens
 * Integração com Evolution API e banco de dados PostgreSQL
 */

import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { 
  getContatosByEmpresaId, 
  getContatoByTelefone,
  createContato,
  getMensagensByContatoId,
  createMensagem,
  markMensagensAsRead
} from './db';
import { getEvolutionApi } from './evolutionApi';

export const messagesRouter = router({
  /**
   * Listar todas as conversas (contatos com última mensagem)
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Usuário não possui empresa associada',
      });
    }

    try {
      const contatos = await getContatosByEmpresaId(ctx.user.tenantId);
      return contatos;
    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao carregar conversas',
      });
    }
  }),

  /**
   * Buscar mensagens de um contato específico
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        contatoId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        const mensagens = await getMensagensByContatoId(input.contatoId);
        return mensagens;
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao carregar mensagens',
        });
      }
    }),

  /**
   * Enviar mensagem via Evolution API
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        contatoId: z.number(),
        texto: z.string().min(1),
        instanceName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        // Buscar contato para obter telefone
        const contato = await getContatoByTelefone(input.contatoId.toString());
        
        if (!contato) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contato não encontrado',
          });
        }

        // Enviar mensagem via Evolution API
        const evolutionApi = getEvolutionApi();
        const result = await evolutionApi.sendTextMessage(input.instanceName, {
          number: contato.telefone,
          text: input.texto,
        });

        // Salvar mensagem no banco de dados
        const mensagem = await createMensagem({
          tenantId: ctx.user.tenantId,
          contatoId: input.contatoId,
          vendedorId: ctx.user.id,
          remetente: 'usuario',
          conteudo: input.texto,
          tipo: 'texto',
          lida: true,
        });

        return {
          success: true,
          mensagem,
          evolutionResponse: result,
        };
      } catch (error: any) {
        console.error('Erro ao enviar mensagem:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Erro ao enviar mensagem',
        });
      }
    }),

  /**
   * Marcar mensagens como lidas
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        contatoId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        await markMensagensAsRead(input.contatoId);
        return { success: true };
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao atualizar mensagens',
        });
      }
    }),

  /**
   * Criar ou atualizar contato
   */
  upsertContact: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        telefone: z.string(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        // Verificar se contato já existe
        const existingContato = await getContatoByTelefone(input.telefone);

        if (existingContato) {
          return existingContato;
        }

        // Criar novo contato
        const contato = await createContato({
          tenantId: ctx.user.tenantId,
          nome: input.nome,
          telefone: input.telefone,
          email: input.email || null,
        });

        return contato;
      } catch (error) {
        console.error('Erro ao criar/atualizar contato:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao salvar contato',
        });
      }
    }),
});
