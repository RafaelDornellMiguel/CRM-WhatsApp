/**
 * Chat - Conversa detalhada com cliente integrada à Evolution API
 * Design Philosophy: Minimalismo Corporativo
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowLeft, Send, ShoppingCart, AlertCircle, Tag, Plus, Phone, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Get contatoId from URL or state
  const contatoId = parseInt(new URLSearchParams(window.location.search).get('contatoId') || '0');

  // Fetch messages
  const { data: messages = [], isLoading: loadingMessages } = trpc.messages.getMessages.useQuery(
    { contatoId },
    { enabled: !!contatoId && !!user }
  );

  // Send message mutation
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText('');
      toast.success('Mensagem enviada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !contatoId) return;

    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        contatoId,
        texto: messageText,
        instanceName: 'default', // Será configurável depois
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    toast.info('Funcionalidade de ligação em desenvolvimento');
  };

  const handleCamera = () => {
    setShowCameraModal(true);
  };

  if (!contatoId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione uma conversa</p>
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/inbox')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-foreground">Cliente #{contatoId}</h2>
            <p className="text-sm text-muted-foreground">Conversa ativa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Ligar"
          >
            <Phone className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.remetente === 'usuario'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{msg.conteudo}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowOrderModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Criar pedido"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Adicionar etiqueta"
          >
            <Tag className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={handleCamera}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Câmera"
          >
            <Camera className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite uma mensagem..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showOrderModal && (
        <OrderModal
          contatoId={contatoId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showTagModal && (
        <TagModal
          contatoId={contatoId}
          onClose={() => setShowTagModal(false)}
        />
      )}

      {showCameraModal && (
        <CameraModal
          onClose={() => setShowCameraModal(false)}
          onCapture={(imageData) => {
            // TODO: Enviar imagem via API
            setShowCameraModal(false);
          }}
        />
      )}
    </div>
  );
}

// Order Modal Component
function OrderModal({ contatoId, onClose }: { contatoId: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Criar Pedido</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de pedidos em desenvolvimento
        </p>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </Card>
    </div>
  );
}

// Tag Modal Component
function TagModal({ contatoId, onClose }: { contatoId: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Etiqueta</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de etiquetas em desenvolvimento
        </p>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </Card>
    </div>
  );
}

// Camera Modal Component
function CameraModal({
  onClose,
  onCapture,
}: {
  onClose: () => void;
  onCapture: (imageData: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Câmera</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de câmera em desenvolvimento
        </p>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </Card>
    </div>
  );
}
