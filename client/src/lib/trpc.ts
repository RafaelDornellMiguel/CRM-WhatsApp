import { createTRPCReact } from "@trpc/react-query";

// Usamos <any> para garantir que o app rode agora, 
// independente de como está o router do servidor.
export const trpc = createTRPCReact<any>();