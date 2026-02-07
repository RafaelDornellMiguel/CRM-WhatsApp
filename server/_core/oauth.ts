import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { getSdk } from "./sdk";

function getDevIdentity() {
  const openId = process.env.DEV_OPEN_ID ?? "dev-user";
  const name = process.env.DEV_USER_NAME ?? "Dev User";
  const email = process.env.DEV_USER_EMAIL ?? "dev@local";
  return { openId, name, email };
}

export function registerOAuthRoutes(app: Express) {
  const sdk = getSdk();

  /**
   * DEV LOGIN: Cria usuário local e loga automaticamente
   */
  app.get("/api/dev/login", async (req: Request, res: Response) => {
    // Permite login de dev se for development OU se a flag explicita estiver ativa
    const allowDevLogin = process.env.NODE_ENV === "development" || process.env.ALLOW_DEV_LOGIN === "true";

    if (!allowDevLogin) {
      console.log("[Auth] Tentativa de login DEV bloqueada em produção");
      res.status(404).end();
      return;
    }

    const { openId, name, email } = getDevIdentity();

    try {
      // 1. Cria ou atualiza o usuário no banco
      await db.upsertUser({
        openId,
        tenantId: undefined as any, 
        name,
        email,
        loginMethod: "dev",
        lastSignedIn: new Date(),
      });

      // 2. Cria o token de sessão
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      // 3. Grava o cookie (Usando a função corrigida de cookies.ts)
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });

      console.log("[Auth] Login DEV realizado com sucesso. Redirecionando para /");
      res.redirect(302, "/");
    } catch (error) {
      console.error("[DEV Login] Failed", error);
      res.status(500).json({ error: "DEV login failed" });
    }
  });

  // Placeholder para rota do Google (para não dar 404 se o frontend chamar errado)
  app.get("/api/auth/google", (req, res) => {
      console.warn("[Auth] Rota Google chamada, mas redirecionando para DEV em localhost");
      res.redirect("/api/dev/login");
  });
}