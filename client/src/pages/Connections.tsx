/**
 * Connections - Gerenciar conexões WhatsApp via Evolution API
 * Design Philosophy: Minimalismo Corporativo
 * Integração real com Evolution API v2
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Phone, Plus, Trash2, Power, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Instance {
  instanceName: string;
  vendedorName: string;
  status: 'open' | 'close' | 'connecting';
  qrCode?: string;
}

export default function Connections() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [instances, setInstances] = useState<Instance[]>([]);

  // Carregar instâncias do localStorage (temporário até ter banco)
  useEffect(() => {
    const stored = localStorage.getItem('whatsapp_instances');
    if (stored) {
      setInstances(JSON.parse(stored));
    }
  }, []);

  const saveInstances = (newInstances: Instance[]) => {
    setInstances(newInstances);
    localStorage.setItem('whatsapp_instances', JSON.stringify(newInstances));
  };

  const handleShowQRCode = (instanceName: string) => {
    setSelectedInstance(instanceName);
    setShowQRModal(true);
  };

  const handleDisconnect = async (instanceName: string) => {
    if (!confirm('Deseja realmente desconectar esta instância?')) return;

    toast.loading('Desconectando...');
    // TODO: Implementar desconexão via tRPC
    toast.success('Instância desconectada!');
  };

  const handleDelete = async (instanceName: string) => {
    if (!confirm('Deseja realmente deletar esta instância? Esta ação não pode ser desfeita.')) return;

    toast.loading('Deletando...');
    // TODO: Implementar deleção via tRPC
    const newInstances = instances.filter(i => i.instanceName !== instanceName);
    saveInstances(newInstances);
    toast.success('Instância deletada!');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conexões</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gerenciar números WhatsApp conectados via Evolution API
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Conexão
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Phone className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">Nenhuma conexão configurada</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione uma conexão WhatsApp para começar a usar o sistema
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Adicionar Conexão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instances.map((instance) => (
              <ConnectionCard
                key={instance.instanceName}
                instance={instance}
                onShowQRCode={handleShowQRCode}
                onDisconnect={handleDisconnect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddConnectionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newInstance) => {
            saveInstances([...instances, newInstance]);
            setShowAddModal(false);
          }}
        />
      )}

      {showQRModal && selectedInstance && (
        <QRCodeModal
          instanceName={selectedInstance}
          onClose={() => {
            setShowQRModal(false);
            setSelectedInstance(null);
          }}
          onConnected={() => {
            // Atualizar status da instância
            const newInstances = instances.map(i =>
              i.instanceName === selectedInstance ? { ...i, status: 'open' as const } : i
            );
            saveInstances(newInstances);
            setShowQRModal(false);
            setSelectedInstance(null);
            toast.success('WhatsApp conectado com sucesso!');
          }}
        />
      )}
    </div>
  );
}

interface ConnectionCardProps {
  instance: Instance;
  onShowQRCode: (instanceName: string) => void;
  onDisconnect: (instanceName: string) => void;
  onDelete: (instanceName: string) => void;
}

function ConnectionCard({ instance, onShowQRCode, onDisconnect, onDelete }: ConnectionCardProps) {
  const [checking, setChecking] = useState(false);
  const checkStatus = trpc.whatsapp.getConnectionState.useQuery(
    { instanceName: instance.instanceName },
    { enabled: false }
  );

  const handleCheckStatus = async () => {
    setChecking(true);
    await checkStatus.refetch();
    setChecking(false);
  };

  const isConnected = instance.status === 'open';
  const isConnecting = instance.status === 'connecting';

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isConnected ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Phone className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{instance.vendedorName}</h3>
            <p className="text-sm text-muted-foreground">{instance.instanceName}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Conectado</span>
            </>
          ) : isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
              <span className="text-sm font-medium text-yellow-600">Conectando...</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Desconectado</span>
            </>
          )}
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="ml-auto p-1 hover:bg-secondary rounded transition-colors"
            title="Verificar status"
          >
            <RefreshCw className={`w-3 h-3 text-muted-foreground ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <button
          onClick={() => onShowQRCode(instance.instanceName)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
          title="Exibir QR Code"
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
        {isConnected && (
          <button
            onClick={() => onDisconnect(instance.instanceName)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
            title="Desconectar"
          >
            <Power className="w-4 h-4" />
            Desconectar
          </button>
        )}
        <button
          onClick={() => onDelete(instance.instanceName)}
          className="p-2 bg-secondary hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          title="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AddConnectionModalProps {
  onClose: () => void;
  onSuccess: (instance: Instance) => void;
}

function AddConnectionModal({ onClose, onSuccess }: AddConnectionModalProps) {
  const [formData, setFormData] = useState({
    vendedorName: '',
    instanceName: '',
  });
  const [creating, setCreating] = useState(false);

  const createInstance = trpc.whatsapp.createInstance.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendedorName || !formData.instanceName) {
      toast.error('Preencha todos os campos');
      return;
    }

    setCreating(true);

    try {
      const result = await createInstance.mutateAsync({
        instanceName: formData.instanceName,
      });

      toast.success('Instância criada com sucesso!');

      onSuccess({
        instanceName: formData.instanceName,
        vendedorName: formData.vendedorName,
        status: 'close',
      });
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      toast.error(error.message || 'Erro ao criar instância. Verifique se a Evolution API está rodando.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nova Conexão WhatsApp</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crie uma nova instância para conectar um número
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome do Vendedor
            </label>
            <input
              type="text"
              required
              value={formData.vendedorName}
              onChange={(e) => setFormData({ ...formData, vendedorName: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome da Instância
            </label>
            <input
              type="text"
              required
              value={formData.instanceName}
              onChange={(e) => setFormData({ ...formData, instanceName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: joao-silva"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Apenas letras minúsculas, números e hífen
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Próximo passo: Escanear QR Code
            </p>
            <p className="text-xs text-blue-800">
              Após criar a instância, você precisará escanear o QR Code com o WhatsApp para conectar o número.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Instância'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface QRCodeModalProps {
  instanceName: string;
  onClose: () => void;
  onConnected: () => void;
}

function QRCodeModal({ instanceName, onClose, onConnected }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectInstance = trpc.whatsapp.connectInstance.useMutation();
  const checkStatus = trpc.whatsapp.getConnectionState.useQuery(
    { instanceName },
    { 
      enabled: !!qrCode,
      refetchInterval: 3000, // Verificar status a cada 3 segundos
    }
  );

  useEffect(() => {
    loadQRCode();
  }, []);

  useEffect(() => {
    if (checkStatus.data?.state === 'open') {
      onConnected();
    }
  }, [checkStatus.data]);

  const loadQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await connectInstance.mutateAsync({ instanceName });
      setQrCode(result.qrCode);
    } catch (error: any) {
      console.error('Erro ao obter QR Code:', error);
      setError(error.message || 'Erro ao gerar QR Code. Verifique se a Evolution API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Conectar WhatsApp</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Instância: {instanceName}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-sm text-destructive text-center mb-4">{error}</p>
              <button
                onClick={loadQRCode}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Como conectar:
                </p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em Menu (⋮) ou Configurações</li>
                  <li>Toque em "Aparelhos conectados"</li>
                  <li>Toque em "Conectar um aparelho"</li>
                  <li>Aponte o celular para esta tela para escanear o código</li>
                </ol>
              </div>

              {/* Status */}
              {checkStatus.data && (
                <div className="mt-4 flex items-center gap-2">
                  {checkStatus.data.state === 'open' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Conectado!</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                      <span className="text-sm text-muted-foreground">Aguardando conexão...</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
