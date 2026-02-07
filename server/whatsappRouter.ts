import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { db } from "./db";
import { empresas, numerosWhatsapp } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { evolutionApi } from "./evolutionApi";

// --- Helpers ---

// Busca credenciais e valida se a integração existe
async function getCreds(tenantId: number) {
  const [empresa] = await db
    .select()
    .from(empresas)
    .where(eq(empresas.id, tenantId))
    .limit(1);

  if (!empresa || !empresa.evolutionApiUrl || !empresa.evolutionApiKey) {
    throw new Error(
      "Integração não configurada! Acesse Configurações > Integrações e configure a Evolution API."
    );
  }

  return {
    baseUrl: empresa.evolutionApiUrl,
    apiKey: empresa.evolutionApiKey,
  };
}

export const whatsappRouter = router({
  // 1. LISTAR CONEXÕES
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.user.tenantId || 1;

    const conexoes = await db
      .select()
      .from(numerosWhatsapp)
      .where(eq(numerosWhatsapp.tenantId, tenantId));

    return conexoes.map((c) => ({
      id: c.id,
      instanceName: c.nome,
      status: c.status,
      qrCode: c.qrCode,
      updatedAt: c.updatedAt,
    }));
  }),

  // 2. CRIAR INSTÂNCIA (Upsert Inteligente)
  createConnection: protectedProcedure
    .input(z.object({ instanceName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.user.tenantId || 1;
      const creds = await getCreds(tenantId);

      // Webhook URL para receber eventos
      const webhookUrl = process.env.APP_URL
        ? `${process.env.APP_URL}/api/webhook`
        : undefined;

      try {
        console.log(`[WhatsApp] Criando instância: ${input.instanceName}`);

        // A. Tenta criar na Evolution
        // Se já existir, a API pode dar erro ou retornar sucesso dependendo da versão.
        // O evolutionApi.ts que fizemos já trata o "already exists" sem lançar erro fatal.
        await evolutionApi.createInstance(creds, input.instanceName, webhookUrl);

        // B. Busca o QR Code (Connect)
        const connectionData = await evolutionApi.connectInstance(
          creds,
          input.instanceName
        );

        // C. Salva ou Atualiza no Banco (Lógica Upsert Manual)
        // Verificamos se já existe um registro para este tenant + nome
        const [existingNumber] = await db
          .select()
          .from(numerosWhatsapp)
          .where(
            and(
              eq(numerosWhatsapp.tenantId, tenantId),
              eq(numerosWhatsapp.nome, input.instanceName)
            )
          );

        const statusInicial = "aguardando";
        const qrCodeBase64 = connectionData?.base64 || connectionData?.code || null;

        if (!existingNumber) {
          // INSERT
          await db.insert(numerosWhatsapp).values({
            tenantId,
            nome: input.instanceName,
            numero: "Carregando...",
            status: statusInicial,
            qrCode: qrCodeBase64,
          });
        } else {
          // UPDATE
          await db
            .update(numerosWhatsapp)
            .set({
              qrCode: qrCodeBase64,
              status: statusInicial,
              updatedAt: new Date(),
            })
            .where(eq(numerosWhatsapp.id, existingNumber.id));
        }

        return { success: true, qrCode: qrCodeBase64 };
      } catch (error: any) {
        console.error("[WhatsApp Error]", error);
        // Retorna erro amigável para o frontend
        throw new Error(
          error.message || "Erro ao conectar com o WhatsApp. Verifique os logs."
        );
      }
    }),

  // 3. PEGAR STATUS (Com Auto-Refresh de QR Code)
  getConnectionState: protectedProcedure
    .input(z.object({ instanceName: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.user.tenantId || 1;
      const creds = await getCreds(tenantId);

      // A. Busca status real na API
      const stateData = await evolutionApi.fetchInstanceStatus(
        creds,
        input.instanceName
      );
      
      // Normaliza o status (open, close, connecting)
      const rawState = stateData?.instance?.state || "close";
      const isConnected = rawState === "open";
      const dbStatus = isConnected ? "conectado" : "desconectado";

      // B. Se NÃO estiver conectado, tentamos renovar o QR Code
      // Isso é vital: QR Codes expiram. Se o usuário estiver na tela, queremos o novo.
      let newQrCode: string | null = null;
      
      if (!isConnected) {
          const connectData = await evolutionApi.connectInstance(creds, input.instanceName);
          if (connectData?.base64 || connectData?.code) {
              newQrCode = connectData.base64 || connectData.code;
          }
      }

      // C. Atualiza o banco com o status mais recente
      await db
        .update(numerosWhatsapp)
        .set({ 
            status: dbStatus,
            // Só atualiza o QR Code se tivermos um novo, senão mantém (ou limpa se conectado)
            qrCode: isConnected ? null : (newQrCode || undefined)
        })
        .where(
          and(
            eq(numerosWhatsapp.tenantId, tenantId),
            eq(numerosWhatsapp.nome, input.instanceName)
          )
        );

      return { 
          state: rawState, 
          qrCode: newQrCode // Retorna o QR novo pro frontend atualizar sem refresh
      };
    }),

  // 4. DELETAR / DESCONECTAR
  deleteConnection: protectedProcedure
    .input(z.object({ instanceName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.user.tenantId || 1;
      const creds = await getCreds(tenantId);

      try {
        // Tenta fazer logout e deletar na Evolution
        await evolutionApi.logoutInstance(creds, input.instanceName);
        await evolutionApi.deleteInstance(creds, input.instanceName);
      } catch (e) {
        console.error("Erro ao remover da Evolution (pode já ter sido removido)", e);
      }

      // Remove do banco de dados local
      await db
        .delete(numerosWhatsapp)
        .where(
          and(
            eq(numerosWhatsapp.tenantId, tenantId),
            eq(numerosWhatsapp.nome, input.instanceName)
          )
        );

      return { success: true };
    }),
});