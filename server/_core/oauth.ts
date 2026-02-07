import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { getSdk } from "./sdk";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getDevIdentity() {
  const openId = process.env.DEV_OPEN_ID ?? "dev-user";
  const name = process.env.DEV_USER_NAME ?? "Dev User";
  const email = process.env.DEV_USER_EMAIL ?? "dev@local";
  return { openId, name, email };
}

export function registerOAuthRoutes(app: Express) {
  // Lazy singleton do SDK (não inicializa OAuth legado no boot)
  const sdk = getSdk();

  /**
   * DEV ONLY: login sem provedor externo
   * - cria/atualiza usuário dev
   * - cria token de sessão
   * - seta cookie
   * - redirect "/"
   */
  app.get("/api/dev/login", async (req: Request, res: Response) => {
    if (isProduction()) {
      res.status(404).end();
      return;
    }

    const { openId, name, email } = getDevIdentity();

    try {
      await db.upsertUser({
        openId,
        tenantId: undefined as any, // será definido automaticamente
        name,
        email,
        loginMethod: "dev",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[DEV Login] Failed", error);
      res.status(500).json({ error: "DEV login failed" });
    }
  });
}
