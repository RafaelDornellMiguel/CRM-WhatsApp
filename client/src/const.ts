export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function getLoginUrl() {
  // Lê a variável do .env. Se não existir, assume 'dev' por segurança.
  const provider = import.meta.env.VITE_LOGIN_PROVIDER || "dev";

  // Se for dev, manda para a rota mágica de login local
  // Se for google, manda para o OAuth do Google
  const path = provider === "dev" 
    ? "/api/dev/login" 
    : "/api/auth/google";

  // Retorna a URL absoluta (http://localhost:3000/api/dev/login)
  return new URL(path, window.location.origin).toString();
}