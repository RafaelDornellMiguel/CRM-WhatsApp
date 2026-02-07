import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema"; // Importa o schema completo para o Drizzle conhecer suas tabelas
import { eq } from "drizzle-orm";
import { users, empresas, contatos, mensagens, InsertUser, InsertEmpresa, InsertContato, InsertMensagem } from "../drizzle/schema";
import { ENV } from './_core/env';

/**
 * CONFIGURAÇÃO DO BANCO DE DADOS
 * Padrão Singleton para conexão MySQL
 */

// Validação da URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não foi definida nas variáveis de ambiente");
}

// Criamos o pool de conexões (Melhor performance que conexão única)
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Exportamos a instância 'db' diretamente. 
// Isso corrige o erro vermelho nos outros arquivos.
export const db = drizzle(poolConnection, { schema, mode: "default" });

// ============================================
// HELPERS DE USUÁRIO
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  try {
    // Se tenantId não foi fornecido, criar/buscar empresa padrão
    let tenantId = user.tenantId;
    if (!tenantId) {
      // Buscar empresa padrão ou criar uma
      const empresaDefault = await db.select().from(empresas).limit(1);
      if (empresaDefault.length > 0) {
        tenantId = empresaDefault[0]!.id;
      } else {
        // Criar empresa padrão
        const result = await db.insert(empresas).values({
          nome: "Minha Empresa",
          ativo: true,
        });
        tenantId = Number(result[0].insertId);
      }
    }

    const values: InsertUser = {
      openId: user.openId,
      tenantId,
    };
    
    // Preparar campos para atualização
    const updateSet: any = {};
    const textFields = ["name", "email", "loginMethod"] as const;

    textFields.forEach((field) => {
      if (user[field] !== undefined) {
        values[field] = user[field] ?? null;
        updateSet[field] = user[field] ?? null;
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // Definir Admin se for o dono
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Upsert (Insert ou Update se existir)
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// HELPER DE CONTATOS (Mantendo compatibilidade)
// ============================================

export async function getContatosByEmpresaId(tenantId: number) {
  return await db
    .select()
    .from(contatos)
    .where(eq(contatos.tenantId, tenantId));
}

export async function getContatoByTelefone(telefone: string) {
  const result = await db
    .select()
    .from(contatos)
    .where(eq(contatos.telefone, telefone))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createContato(data: InsertContato) {
  const result = await db.insert(contatos).values(data);
  const insertId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(contatos)
    .where(eq(contatos.id, insertId))
    .limit(1);

  return created[0];
}

// ============================================
// HELPER DE MENSAGENS
// ============================================

export async function getMensagensByContatoId(contatoId: number) {
  return await db
    .select()
    .from(mensagens)
    .where(eq(mensagens.contatoId, contatoId))
    .orderBy(mensagens.createdAt);
}

export async function createMensagem(data: InsertMensagem) {
  const result = await db.insert(mensagens).values(data);
  const insertId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(mensagens)
    .where(eq(mensagens.id, insertId))
    .limit(1);

  return created[0];
}

export async function markMensagensAsRead(contatoId: number) {
  await db
    .update(mensagens)
    .set({ lida: true })
    .where(eq(mensagens.contatoId, contatoId));
}