import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { getDb } from './db';
import { pedidos, itensPedido, produtos } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const ordersRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const tenantId = input?.tenantId || ctx.user?.tenantId || 1;

      const result = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.tenantId, tenantId));

      return result;
    }),

  create: protectedProcedure
    .input(
      z.object({
        contatoId: z.number(),
        itens: z.array(
          z.object({
            produtoId: z.number(),
            quantidade: z.number().min(1),
            precoUnitario: z.string(),
          })
        ),
        dataEntrega: z.date(),
        observacoes: z.string().optional(),
        tenantId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const tenantId = input.tenantId || ctx.user?.tenantId || 1;

      // Calcular valor total
      let valorTotal = 0;
      input.itens.forEach((item) => {
        const subtotal = parseFloat(item.precoUnitario) * item.quantidade;
        valorTotal += subtotal;
      });

      // Criar pedido
      const pedidoResult = await db.insert(pedidos).values({
        tenantId,
        contatoId: input.contatoId,
        vendedorId: ctx.user?.id || 1,
        valorTotal: valorTotal.toString(),
        status: 'aberto',
        dataEntrega: input.dataEntrega,
        observacoes: input.observacoes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Criar itens do pedido
      const pedidoId = (pedidoResult as any).insertId;
      for (const item of input.itens) {
        const subtotal = parseFloat(item.precoUnitario) * item.quantidade;
        await db.insert(itensPedido).values({
          pedidoId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: subtotal.toString(),
          createdAt: new Date(),
        });
      }

      return { id: pedidoId, ...input };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['aberto', 'confirmado', 'em_producao', 'enviado', 'entregue', 'cancelado']).optional(),
        dataEntrega: z.date().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updateData } = input;

      const result = await db
        .update(pedidos)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(pedidos.id, id));

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Deletar itens do pedido
      await db.delete(itensPedido).where(eq(itensPedido.pedidoId, input.id));

      // Deletar pedido
      const result = await db.delete(pedidos).where(eq(pedidos.id, input.id));

      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, input.id))
        .limit(1);

      if (!result[0]) return null;

      // Buscar itens do pedido
      const itens = await db
        .select()
        .from(itensPedido)
        .where(eq(itensPedido.pedidoId, input.id));

      return {
        ...result[0],
        itens,
      };
    }),

  getByContato: protectedProcedure
    .input(z.object({ contatoId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.contatoId, input.contatoId));

      return result;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['aberto', 'confirmado', 'em_producao', 'enviado', 'entregue', 'cancelado']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .update(pedidos)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(pedidos.id, input.id));

      return result;
    }),
});
