import type { CookieOptions, Request } from "express";

// Verifica se é HTTPS ou se está atrás de um proxy seguro
function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    // O PULO DO GATO: Se não for HTTPS (localhost), usa 'lax' para o navegador aceitar
    sameSite: isSecure ? "none" : "lax", 
    secure: isSecure,
  };
}