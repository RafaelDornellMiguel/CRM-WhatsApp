/**
 * Settings - Configurações da empresa e integração com Evolution API
 * Design Philosophy: Minimalismo Corporativo
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Loader2, Cog, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('evolution');

  // Evolution API Settings
  const [evolutionUrl, setEvolutionUrl] = useState(
    localStorage.getItem('EVOLUTION_API_URL') || 'http://localhost:8080'
  );
  const [evolutionKey, setEvolutionKey] = useState(
    localStorage.getItem('EVOLUTION_API_KEY') || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync
  const syncMutation = trpc.sync.getInstanceStatus.useQuery(
    { instanceName: 'default' },
    { enabled: false }
  );

  const handleSaveEvolutionSettings = async () => {
    if (!evolutionUrl || !evolutionKey) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem('EVOLUTION_API_URL', evolutionUrl);
      localStorage.setItem('EVOLUTION_API_KEY', evolutionKey);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncInstances = async () => {
    try {
      // TODO: Implementar sincronização de instâncias
      toast.success('Sincronização iniciada!');
    } catch (error: any) {
      toast.error(`Erro ao sincronizar: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 mb-2">
          <Cog className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações da sua empresa e integrações
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="evolution">Evolution API</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="usuario">Usuário</TabsTrigger>
          </TabsList>

          {/* Evolution API Tab */}
          <TabsContent value="evolution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Integração Evolution API
                </CardTitle>
                <CardDescription>
                  Configure as credenciais da Evolution API para conectar números WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    URL da Evolution API
                  </label>
                  <Input
                    type="url"
                    value={evolutionUrl}
                    onChange={(e) => setEvolutionUrl(e.target.value)}
                    placeholder="http://localhost:8080"
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo: http://localhost:8080 ou https://seu-servidor.com
                  </p>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    API Key da Evolution
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      value={evolutionKey}
                      onChange={(e) => setEvolutionKey(e.target.value)}
                      placeholder="Sua API key aqui"
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                      className="flex-shrink-0"
                    >
                      {showKey ? '👁️' : '🔒'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encontre a API key nas configurações da sua instância Evolution
                  </p>
                </div>

                {/* Warning */}
                <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Segurança</p>
                    <p className="text-xs mt-1">
                      As credenciais são salvas localmente no navegador. Não compartilhe sua API key.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveEvolutionSettings}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSyncInstances}
                    variant="outline"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sincronizar Instâncias
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Como Configurar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">1. Inicie o Docker</p>
                  <code className="block bg-muted p-2 rounded text-xs font-mono mt-1">
                    docker compose up -d
                  </code>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">2. Obtenha a API Key</p>
                  <p className="text-muted-foreground">
                    Acesse o painel da Evolution API e copie a API key nas configurações
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">3. Cole as Credenciais</p>
                  <p className="text-muted-foreground">
                    Cole a URL e API key nos campos acima e clique em "Salvar Configurações"
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Detalhes da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome da Empresa</label>
                  <Input
                    type="text"
                    placeholder="GRUPO EVOLUTION"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CNPJ</label>
                  <Input
                    type="text"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Para alterar informações da empresa, entre em contato com o administrador.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuário Tab */}
          <TabsContent value="usuario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
                <CardDescription>
                  Seus dados de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Setor</label>
                  <Input
                    type="text"
                    value={user?.setor || 'vendas'}
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Função</label>
                  <Input
                    type="text"
                    value={user?.role || 'user'}
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
