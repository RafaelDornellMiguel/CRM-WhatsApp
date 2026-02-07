import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, empresas, InsertEmpresa } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
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
        const novaEmpresa: InsertEmpresa = {
          nome: "Empresa Padrão",
          ativo: true,
        };
        const result = await db.insert(empresas).values(novaEmpresa);
        tenantId = Number(result[0].insertId);
      }
    }

    const values: InsertUser = {
      openId: user.openId,
      tenantId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
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

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ============================================
// CONTATOS
// ============================================

import { contatos, InsertContato, mensagens, InsertMensagem } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function getContatosByEmpresaId(tenantId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contatos: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(contatos)
    .where(eq(contatos.tenantId, tenantId));

  return result;
}

export async function getContatoByTelefone(telefone: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contato: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(contatos)
    .where(eq(contatos.telefone, telefone))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createContato(data: InsertContato) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create contato: database not available");
  }

  const result = await db.insert(contatos).values(data);
  const insertId = Number(result[0].insertId);

  // Buscar contato criado
  const created = await db
    .select()
    .from(contatos)
    .where(eq(contatos.id, insertId))
    .limit(1);

  return created[0];
}

// ============================================
// MENSAGENS
// ============================================

export async function getMensagensByContatoId(contatoId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get mensagens: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(mensagens)
    .where(eq(mensagens.contatoId, contatoId))
    .orderBy(mensagens.createdAt);

  return result;
}

export async function createMensagem(data: InsertMensagem) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create mensagem: database not available");
  }

  const result = await db.insert(mensagens).values(data);
  const insertId = Number(result[0].insertId);

  // Buscar mensagem criada
  const created = await db
    .select()
    .from(mensagens)
    .where(eq(mensagens.id, insertId))
    .limit(1);

  return created[0];
}

export async function markMensagensAsRead(contatoId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot mark mensagens as read: database not available");
  }

  await db
    .update(mensagens)
    .set({ lida: true })
    .where(eq(mensagens.contatoId, contatoId));
}
