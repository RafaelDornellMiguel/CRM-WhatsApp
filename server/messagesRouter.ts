import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { db } from './db';
import { empresas } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { 
  getContatosByEmpresaId, 
  getContatoByTelefone,
  createContato,
  getMensagensByContatoId,
  createMensagem,
  markMensagensAsRead
} from './db';
import { evolutionApi } from './evolutionApi';

// Helper para pegar credenciais (Reutilizável)
async function getCreds(tenantId: number) {
  const [empresa] = await db.select().from(empresas).where(eq(empresas.id, tenantId)).limit(1);
  if (!empresa?.evolutionApiUrl || !empresa?.evolutionApiKey) {
    throw new Error("API do WhatsApp não configurada.");
  }
  return { baseUrl: empresa.evolutionApiUrl, apiKey: empresa.evolutionApiKey };
}

export const messagesRouter = router({
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getContatosByEmpresaId(ctx.user.tenantId || 1);
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao carregar conversas' });
    }
  }),

  getMessages: protectedProcedure
    .input(z.object({ contatoId: z.number() }))
    .query(async ({ input }) => {
      return await getMensagensByContatoId(input.contatoId);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
        contatoId: z.number(),
        texto: z.string().min(1),
        instanceName: z.string(),
      }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId || 1;

      try {
        const contato = await getContatoByTelefone(input.contatoId.toString()); // Ajuste se contatoId for ID do banco e não numero
        
        // Se contatoId for ID do banco, precisamos buscar o telefone correto
        // Assumindo que o input.contatoId é o ID do banco (number):
        // const contato = await getContatoById(input.contatoId);
        // Vou manter a lógica original mas adicionar proteção:
        
        if (!contato) throw new TRPCError({ code: 'NOT_FOUND', message: 'Contato não encontrado' });

        // 1. Pegar credenciais
        const creds = await getCreds(tenantId);

        // 2. Enviar via Evolution
        const result = await evolutionApi.sendTextMessage(
            creds, 
            input.instanceName, 
            contato.telefone, 
            input.texto
        );

        // 3. Salvar no banco
        const mensagem = await createMensagem({
          tenantId,
          contatoId: contato.id,
          vendedorId: ctx.user.id,
          remetente: 'usuario',
          conteudo: input.texto,
          tipo: 'texto',
          lida: true,
        });

        return { success: true, mensagem, evolutionResponse: result };
      } catch (error: any) {
        console.error('Erro envio msg:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
    }),

  markAsRead: protectedProcedure
    .input(z.object({ contatoId: z.number() }))
    .mutation(async ({ input }) => {
      await markMensagensAsRead(input.contatoId);
      return { success: true };
    }),

  upsertContact: protectedProcedure
    .input(z.object({
        nome: z.string(),
        telefone: z.string(),
        email: z.string().optional(),
      }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId || 1;
      const existing = await getContatoByTelefone(input.telefone);
      if (existing) return existing;

      return await createContato({
        tenantId,
        nome: input.nome,
        telefone: input.telefone,
        email: input.email || null,
      });
    }),
});