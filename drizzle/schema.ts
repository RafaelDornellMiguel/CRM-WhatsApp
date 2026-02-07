import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Schema multiempresa (multi-tenant) para sistema de atendimento WhatsApp
 * Todos os dados vinculados a uma empresa via tenantId
 */

// ============================================
// EMPRESAS
// ============================================
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

// ============================================
// USUÁRIOS (com setor)
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  tenantId: int("tenantId").notNull(), // Vinculado à empresa
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  setor: mysqlEnum("setor", ["vendas", "logistica", "financeiro", "admin"]).default("vendas").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// CONTATOS (clientes)
// ============================================
export const contatos = mysqlTable("contatos", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["novo", "em_atendimento", "convertido", "perdido"]).default("novo").notNull(),
  ticketStatus: mysqlEnum("ticketStatus", ["aberto", "resolvido"]).default("aberto").notNull(),
  vendedorId: int("vendedorId"), // Usuário responsável
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contato = typeof contatos.$inferSelect;
export type InsertContato = typeof contatos.$inferInsert;

// ============================================
// ETIQUETAS (tags)
// ============================================
export const etiquetas = mysqlTable("etiquetas", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 50 }).notNull(), // Ex: "orcamento", "venda_fechada", "royale", "amsterda"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Etiqueta = typeof etiquetas.$inferSelect;
export type InsertEtiqueta = typeof etiquetas.$inferInsert;

// ============================================
// CONTATOS_ETIQUETAS (relação N:N)
// ============================================
export const contatosEtiquetas = mysqlTable("contatos_etiquetas", {
  id: int("id").autoincrement().primaryKey(),
  contatoId: int("contatoId").notNull(),
  etiquetaId: int("etiquetaId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContatoEtiqueta = typeof contatosEtiquetas.$inferSelect;
export type InsertContatoEtiqueta = typeof contatosEtiquetas.$inferInsert;

// ============================================
// PRODUTOS (unificado com estoque)
// ============================================
export const produtos = mysqlTable("produtos", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  modelo: varchar("modelo", { length: 100 }), // Ex: "Royale", "Amsterdã", "Sofá Cama", "Infinity"
  medida: varchar("medida", { length: 100 }), // Ex: "1.88x1.38", "2.30m"
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  estoque: int("estoque").default(0).notNull(),
  sku: varchar("sku", { length: 50 }),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

// ============================================
// PEDIDOS
// ============================================
export const pedidos = mysqlTable("pedidos", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  contatoId: int("contatoId").notNull(),
  vendedorId: int("vendedorId").notNull(),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["aberto", "confirmado", "em_producao", "enviado", "entregue", "cancelado"]).default("aberto").notNull(),
  dataEntrega: timestamp("dataEntrega").notNull(), // OBRIGATÓRIA
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

// ============================================
// ITENS DO PEDIDO
// ============================================
export const itensPedido = mysqlTable("itens_pedido", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: int("pedidoId").notNull(),
  produtoId: int("produtoId").notNull(),
  quantidade: int("quantidade").notNull(),
  precoUnitario: decimal("precoUnitario", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ItemPedido = typeof itensPedido.$inferSelect;
export type InsertItemPedido = typeof itensPedido.$inferInsert;

// ============================================
// MENSAGENS
// ============================================
export const mensagens = mysqlTable("mensagens", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  contatoId: int("contatoId").notNull(),
  vendedorId: int("vendedorId"),
  remetente: mysqlEnum("remetente", ["usuario", "contato", "sistema"]).notNull(),
  conteudo: text("conteudo").notNull(),
  tipo: mysqlEnum("tipo", ["texto", "imagem", "audio", "arquivo", "sistema"]).default("texto").notNull(),
  arquivoUrl: text("arquivoUrl"),
  lida: boolean("lida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Mensagem = typeof mensagens.$inferSelect;
export type InsertMensagem = typeof mensagens.$inferInsert;

// ============================================
// CAMPANHAS
// ============================================
export const campanhas = mysqlTable("campanhas", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  etiquetaId: int("etiquetaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  quantidadeEnvios: int("quantidadeEnvios").default(0).notNull(),
  criadoPor: int("criadoPor").notNull(), // userId
  status: mysqlEnum("status", ["rascunho", "enviada", "agendada"]).default("rascunho").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  enviadaEm: timestamp("enviadaEm"),
});

export type Campanha = typeof campanhas.$inferSelect;
export type InsertCampanha = typeof campanhas.$inferInsert;

// ============================================
// RESPOSTAS RÁPIDAS
// ============================================
export const respostasRapidas = mysqlTable("respostas_rapidas", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  mensagem: text("mensagem").notNull(),
  atalho: varchar("atalho", { length: 50 }), // Ex: "/orcamento"
  criadoPor: int("criadoPor").notNull(), // userId
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RespostaRapida = typeof respostasRapidas.$inferSelect;
export type InsertRespostaRapida = typeof respostasRapidas.$inferInsert;

// ============================================
// NÚMEROS DE TELEFONE (conexões WhatsApp)
// ============================================
export const numerosWhatsapp = mysqlTable("numeros_whatsapp", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  vendedorId: int("vendedorId"), // Usuário responsável
  status: mysqlEnum("status", ["conectado", "desconectado", "aguardando"]).default("aguardando").notNull(),
  qrCode: text("qrCode"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NumeroWhatsapp = typeof numerosWhatsapp.$inferSelect;
export type InsertNumeroWhatsapp = typeof numerosWhatsapp.$inferInsert;

// ============================================
// RELATIONS
// ============================================
export const empresasRelations = relations(empresas, ({ many }) => ({
  usuarios: many(users),
  contatos: many(contatos),
  produtos: many(produtos),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [users.tenantId],
    references: [empresas.id],
  }),
  contatos: many(contatos),
  pedidos: many(pedidos),
  mensagens: many(mensagens),
}));

export const contatosRelations = relations(contatos, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [contatos.tenantId],
    references: [empresas.id],
  }),
  vendedor: one(users, {
    fields: [contatos.vendedorId],
    references: [users.id],
  }),
  pedidos: many(pedidos),
  mensagens: many(mensagens),
  etiquetas: many(contatosEtiquetas),
}));

export const etiquetasRelations = relations(etiquetas, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [etiquetas.tenantId],
    references: [empresas.id],
  }),
  contatos: many(contatosEtiquetas),
  campanhas: many(campanhas),
}));

export const produtosRelations = relations(produtos, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [produtos.tenantId],
    references: [empresas.id],
  }),
  itensPedido: many(itensPedido),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [pedidos.tenantId],
    references: [empresas.id],
  }),
  contato: one(contatos, {
    fields: [pedidos.contatoId],
    references: [contatos.id],
  }),
  vendedor: one(users, {
    fields: [pedidos.vendedorId],
    references: [users.id],
  }),
  itens: many(itensPedido),
}));

export const itensPedidoRelations = relations(itensPedido, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [itensPedido.pedidoId],
    references: [pedidos.id],
  }),
  produto: one(produtos, {
    fields: [itensPedido.produtoId],
    references: [produtos.id],
  }),
}));

export const mensagensRelations = relations(mensagens, ({ one }) => ({
  empresa: one(empresas, {
    fields: [mensagens.tenantId],
    references: [empresas.id],
  }),
  contato: one(contatos, {
    fields: [mensagens.contatoId],
    references: [contatos.id],
  }),
  vendedor: one(users, {
    fields: [mensagens.vendedorId],
    references: [users.id],
  }),
}));

export const campanhasRelations = relations(campanhas, ({ one }) => ({
  empresa: one(empresas, {
    fields: [campanhas.tenantId],
    references: [empresas.id],
  }),
  etiqueta: one(etiquetas, {
    fields: [campanhas.etiquetaId],
    references: [etiquetas.id],
  }),
  criador: one(users, {
    fields: [campanhas.criadoPor],
    references: [users.id],
  }),
}));

export const respostasRapidasRelations = relations(respostasRapidas, ({ one }) => ({
  empresa: one(empresas, {
    fields: [respostasRapidas.tenantId],
    references: [empresas.id],
  }),
  criador: one(users, {
    fields: [respostasRapidas.criadoPor],
    references: [users.id],
  }),
}));

export const numerosWhatsappRelations = relations(numerosWhatsapp, ({ one }) => ({
  empresa: one(empresas, {
    fields: [numerosWhatsapp.tenantId],
    references: [empresas.id],
  }),
  vendedor: one(users, {
    fields: [numerosWhatsapp.vendedorId],
    references: [users.id],
  }),
}));
