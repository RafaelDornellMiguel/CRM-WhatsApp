import { useState, useEffect } from 'react'; // Adicionado useEffect
import { trpc } from '@/lib/trpc';
import { Phone, Plus, Trash2, Power, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Connections() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

  // 1. Buscando dados REAIS do Backend
  const { data: instances, isLoading, refetch } = trpc.whatsapp.listConnections.useQuery();
  
  // Utilitário para atualizar a lista após ações
  const utils = trpc.useUtils();

  const deleteMutation = trpc.whatsapp.deleteConnection.useMutation({
    onSuccess: () => {
      toast.success('Instância removida!');
      utils.whatsapp.listConnections.invalidate(); // Recarrega a lista
    },
    onError: (err) => toast.error(`Erro: ${err.message}`)
  });

  const handleShowQRCode = (instanceName: string) => {
    setSelectedInstance(instanceName);
    setShowQRModal(true);
  };

  const handleDelete = async (instanceName: string) => {
    if (!confirm('Tem certeza? Isso irá desconectar o WhatsApp.')) return;
    toast.loading('Removendo...');
    await deleteMutation.mutateAsync({ instanceName });
    toast.dismiss();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conexões</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gerenciar números WhatsApp via Evolution API
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
        {isLoading ? (
           <div className="flex justify-center items-center h-40">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : !instances || instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Phone className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">Nenhuma conexão configurada</p>
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
                key={instance.id}
                instance={instance}
                onShowQRCode={handleShowQRCode}
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
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {showQRModal && selectedInstance && (
        <QRCodeModal
          instanceName={selectedInstance}
          onClose={() => {
            setShowQRModal(false);
            setSelectedInstance(null);
            refetch(); // Atualiza status ao fechar
          }}
        />
      )}
    </div>
  );
}

// --- Componentes Menores ---

function ConnectionCard({ instance, onShowQRCode, onDelete }: any) {
  const isConnected = instance.status === 'conectado';

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isConnected ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Phone className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{instance.instanceName}</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        {!isConnected && (
            <button
            onClick={() => onShowQRCode(instance.instanceName)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors text-sm font-medium"
            >
            <QrCode className="w-4 h-4" />
            Ler QR Code
            </button>
        )}
        
        <button
          onClick={() => onDelete(instance.instanceName)}
          className="p-2 bg-secondary hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors ml-auto"
          title="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AddConnectionModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const createMutation = trpc.whatsapp.createConnection.useMutation({
      onSuccess: () => {
          toast.success("Instância criada!");
          onSuccess();
      },
      onError: (e) => toast.error(e.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name) return;
    // Remove espaços e caracteres especiais para criar nome técnico
    const instanceName = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    createMutation.mutate({ instanceName });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Nova Conexão</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Instância</label>
            <input
              autoFocus
              className="w-full px-3 py-2 bg-background border rounded-lg"
              placeholder="Ex: Comercial"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm">Cancelar</button>
            <button 
                disabled={createMutation.isPending}
                type="submit" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex gap-2 items-center"
            >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
                Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QRCodeModal({ instanceName, onClose }: any) {
  // Correção aqui: Removemos a chamada duplicada e não usada
  const connectMutation = trpc.whatsapp.createConnection.useMutation();

  // Correção Principal: Usamos useEffect para efeitos colaterais (chamadas de API), não useState
  useEffect(() => {
      if (instanceName) {
        connectMutation.mutate({ instanceName });
      }
  }, []); // Array vazio garante que rode apenas uma vez ao abrir o modal

  const qrCode = connectMutation.data?.qrCode;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Escaneie o QR Code</h2>
        
        {connectMutation.isPending ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary"/></div>
        ) : connectMutation.error ? (
           // Adicionei tratamento de erro visual
           <div className="text-red-500 py-4">
             Erro: {connectMutation.error.message}
           </div>
        ) : qrCode ? (
            <img src={qrCode} className="w-64 h-64 mx-auto border rounded" alt="QR Code WhatsApp" />
        ) : (
            <div className="text-muted-foreground py-4">Aguardando QR Code...</div>
        )}

        <button onClick={onClose} className="mt-6 w-full py-2 border rounded-lg hover:bg-secondary">
            Fechar
        </button>
      </div>
    </div>
  );
}