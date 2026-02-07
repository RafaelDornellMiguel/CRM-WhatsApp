import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Não recarrega ao trocar de aba (evita piscar)
      retry: false, // Se der erro, não fica tentando infinitamente
      staleTime: 5000, // Mantém dados em cache por 5 segundos
    },
  },
});