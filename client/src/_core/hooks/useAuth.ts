import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

function isUnauthorized(error: unknown) {
  return (
    error instanceof TRPCClientError &&
    error.data?.code === "UNAUTHORIZED"
  );
}

function isBrowser() {
  return typeof window !== "undefined";
}

function samePathAsCurrent(urlString: string) {
  if (!isBrowser()) return false;
  try {
    const url = new URL(urlString, window.location.origin);
    return window.location.pathname === url.pathname;
  } catch {
    return false;
  }
}

export function useAuth(options?: UseAuthOptions) {
  const utils = trpc.useUtils();

  // Define valores padrão
  const redirectPath = options?.redirectPath ?? getLoginUrl();
  const redirectOnUnauthenticated = options?.redirectOnUnauthenticated ?? false;

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Importante: Cache de 5 minutos evita "piscadas" e chamadas excessivas
    staleTime: 1000 * 60 * 5, 
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (isUnauthorized(error)) return;
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      // Opcional: Forçar ir para login após logout
      if (isBrowser()) {
        window.location.href = getLoginUrl();
      }
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    const loading = meQuery.isLoading || logoutMutation.isPending;
    const error = meQuery.error ?? logoutMutation.error ?? null;

    if (isBrowser() && !loading) {
      if (user) {
        localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
      } else {
        localStorage.removeItem("manus-runtime-user-info");
      }
    }

    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    // Se a opção de redirecionar estiver desligada, não faz nada
    if (!redirectOnUnauthenticated) return;
    
    if (!isBrowser()) return;

    // CRÍTICO: Se ainda está carregando, PARE AQUI.
    // Isso evita o redirecionamento prematuro antes de saber se o user existe.
    if (state.loading) return;

    // Se o usuário existe, não precisa redirecionar
    if (state.user) return;

    // Proteção contra loop infinito: se já estamos na página de login, pare.
    if (samePathAsCurrent(redirectPath)) return;

    // Se chegou até aqui: não está carregando, não tem user e não está no login.
    console.log("[Auth] Sessão não encontrada. Redirecionando...");
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}