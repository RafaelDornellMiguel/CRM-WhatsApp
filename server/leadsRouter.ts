import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { getDb } from './db';
import { contatos } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const leadsRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const tenantId = input?.tenantId || ctx.user?.tenantId || 1;

      const result = await db
        .select()
        .from(contatos)
        .where(eq(contatos.tenantId, tenantId));

      return result;
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        telefone: z.string().min(1),
        email: z.string().email().optional(),
        status: z.enum(['novo', 'em_atendimento', 'convertido', 'perdido']).default('novo'),
        observacoes: z.string().optional(),
        tenantId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const tenantId = input.tenantId || ctx.user?.tenantId || 1;

      const result = await db.insert(contatos).values({
        nome: input.nome,
        telefone: input.telefone,
        email: input.email,
        status: input.status,
        observacoes: input.observacoes,
        tenantId,
        vendedorId: ctx.user?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        status: z.enum(['novo', 'em_atendimento', 'convertido', 'perdido']).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;

      const result = await db
        .update(contatos)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(contatos.id, id));

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.delete(contatos).where(eq(contatos.id, input.id));

      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(contatos)
        .where(eq(contatos.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['novo', 'em_atendimento', 'convertido', 'perdido']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .update(contatos)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(contatos.id, input.id));

      return result;
    }),
});
