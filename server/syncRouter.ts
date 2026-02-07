import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { evolutionApi } from './evolutionApi';
import { db } from './db'; // Importando db direto
import { contatos, empresas } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Helper para credenciais
async function getCreds(tenantId: number) {
  const [empresa] = await db.select().from(empresas).where(eq(empresas.id, tenantId)).limit(1);
  if (!empresa?.evolutionApiUrl || !empresa?.evolutionApiKey) {
    throw new Error("API não configurada.");
  }
  return { baseUrl: empresa.evolutionApiUrl, apiKey: empresa.evolutionApiKey };
}

export const syncRouter = router({
  syncContatos: protectedProcedure
    .input(z.object({ instanceName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId || 1;
      const creds = await getCreds(tenantId);

      try {
        // 1. Buscar da API
        const contatosEvolution = await evolutionApi.fetchContacts(creds, input.instanceName);

        if (!contatosEvolution || !Array.isArray(contatosEvolution)) {
          return { success: true, sincronizados: 0, atualizados: 0, erros: [] };
        }

        let sincronizados = 0;
        let atualizados = 0;
        const erros: string[] = [];

        // 2. Salvar no Banco
        for (const contatoEvo of contatosEvolution) {
          try {
            const telefone = contatoEvo.id?.replace('@s.whatsapp.net', '') || contatoEvo.number;
            if(!telefone) continue;

            const [contatoExistente] = await db
              .select()
              .from(contatos)
              .where(eq(contatos.telefone, telefone))
              .limit(1);

            if (contatoExistente) {
              await db.update(contatos)
                .set({
                  nome: contatoEvo.name || contatoExistente.nome,
                  avatar: contatoEvo.profilePictureUrl || contatoExistente.avatar, // Ajuste no nome do campo da API
                  updatedAt: new Date(),
                })
                .where(eq(contatos.id, contatoExistente.id));
              atualizados++;
            } else {
              await db.insert(contatos).values({
                tenantId,
                nome: contatoEvo.name || telefone,
                telefone,
                avatar: contatoEvo.profilePictureUrl,
                status: 'novo',
                ticketStatus: 'aberto',
                vendedorId: ctx.user.id,
              });
              sincronizados++;
            }
          } catch (error: any) {
            erros.push(`Erro contato ${contatoEvo.name}: ${error.message}`);
          }
        }

        return { success: true, sincronizados, atualizados, erros };
      } catch (error: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
    }),

  syncStatus: protectedProcedure
    .input(z.object({ instanceName: z.string() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId || 1;
      const creds = await getCreds(tenantId);
      
      const status = await evolutionApi.fetchInstanceStatus(creds, input.instanceName);
      const state = status?.instance?.state || 'close';

      return {
        instanceName: input.instanceName,
        status: state,
        conectado: state === 'open',
      };
    }),
});