export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function getLoginUrl() {
  const provider = import.meta.env.VITE_LOGIN_PROVIDER ?? "google";

  const path =
    provider === "dev"
      ? "/api/dev/login"
      : "/api/auth/google";

  return new URL(path, window.location.origin).toString();
}
