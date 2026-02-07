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
  const url = new URL(urlString, window.location.origin);
  return window.location.pathname === url.pathname;
}

export function useAuth(options?: UseAuthOptions) {
  const utils = trpc.useUtils();

  // resolve o redirect uma vez por render (com default sensato)
  const redirectPath = options?.redirectPath ?? getLoginUrl();
  const redirectOnUnauthenticated = options?.redirectOnUnauthenticated ?? false;

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
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
      // se já está deslogado, não explode
      if (isUnauthorized(error)) return;
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    const loading = meQuery.isLoading || logoutMutation.isPending;
    const error = meQuery.error ?? logoutMutation.error ?? null;

    // só persiste quando tem dado ou quando terminou (evita escrever "undefined" o tempo todo)
    if (isBrowser() && !loading) {
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
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
    if (!redirectOnUnauthenticated) return;
    if (!isBrowser()) return;
    if (state.loading) return;
    if (state.user) return;

    // evita loop caso já esteja na rota de login
    if (samePathAsCurrent(redirectPath)) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
