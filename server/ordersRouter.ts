import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { db } from './db';
import { pedidos, itensPedido } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const ordersRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const tenantId = input?.tenantId || ctx.user?.tenantId || 1;
      return await db.select().from(pedidos).where(eq(pedidos.tenantId, tenantId));
    }),

  create: protectedProcedure
    .input(
      z.object({
        contatoId: z.number(),
        itens: z.array(z.object({
            produtoId: z.number(),
            quantidade: z.number().min(1),
            precoUnitario: z.string(),
        })),
        dataEntrega: z.date(),
        observacoes: z.string().optional(),
        tenantId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = input.tenantId || ctx.user?.tenantId || 1;

      // Calcular total
      let valorTotal = 0;
      input.itens.forEach((item) => {
        valorTotal += parseFloat(item.precoUnitario) * item.quantidade;
      });

      // Insert Pedido
      const result = await db.insert(pedidos).values({
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
      
      const pedidoId = Number(result[0].insertId);

      // Insert Itens
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
    
    // ... mantendo update, delete, getById com a mesma lógica de usar 'db' direto ...
    delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(itensPedido).where(eq(itensPedido.pedidoId, input.id));
      await db.delete(pedidos).where(eq(pedidos.id, input.id));
      return { success: true };
    }),
});