/**
 * Quick Replies - Respostas rápidas
 * Design Philosophy: Minimalismo Corporativo
 * Inspirado no Whaticket
 */

import { useState } from 'react';
import { Search, Plus, MessageSquare, Trash2, Edit, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { QuickReply } from '@/types';

// Mock data inicial
const initialReplies: QuickReply[] = [
  {
    id: '1',
    titulo: 'Saudação',
    mensagem: 'Olá! Bem-vindo(a) à nossa loja. Como posso ajudar você hoje?',
    atalho: '/ola',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    titulo: 'Horário de Funcionamento',
    mensagem: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
    atalho: '/horario',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '3',
    titulo: 'Informações de Entrega',
    mensagem: 'Realizamos entregas em toda a região. O prazo varia de 3 a 7 dias úteis após a confirmação do pagamento.',
    atalho: '/entrega',
    createdAt: new Date('2026-01-15'),
  },
];

export default function QuickReplies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [replies, setReplies] = useState<QuickReply[]>(initialReplies);

  const filteredReplies = replies.filter((reply) =>
    reply.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reply.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reply.atalho?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddReply = (reply: QuickReply) => {
    setReplies([...replies, reply]);
  };

  const handleDeleteReply = (id: string) => {
    setReplies(replies.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Respostas Rápidas</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Crie mensagens prontas para agilizar o atendimento
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Resposta
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, mensagem ou atalho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredReplies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">
              {searchTerm ? 'Nenhuma resposta encontrada' : 'Nenhuma resposta rápida cadastrada'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Crie respostas rápidas para agilizar seu atendimento'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Criar Resposta
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReplies.map((reply) => (
              <QuickReplyCard key={reply.id} reply={reply} onDelete={handleDeleteReply} />
            ))}
          </div>
        )}
      </div>

      {/* Add Reply Modal */}
      {showAddModal && <AddReplyModal onClose={() => setShowAddModal(false)} onAdd={handleAddReply} />}
    </div>
  );
}

interface QuickReplyCardProps {
  reply: QuickReply;
  onDelete: (id: string) => void;
}

function QuickReplyCard({ reply, onDelete }: QuickReplyCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(reply.mensagem);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{reply.titulo}</h3>
            {reply.atalho && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded">
                {reply.atalho}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{reply.mensagem}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
          title="Copiar mensagem"
        >
          <Copy className="w-4 h-4" />
          Copiar
        </button>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(reply.id)}
          className="ml-auto p-1.5 bg-secondary hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          title="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AddReplyModalProps {
  onClose: () => void;
  onAdd: (reply: QuickReply) => void;
}

function AddReplyModal({ onClose, onAdd }: AddReplyModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    atalho: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReply: QuickReply = {
      id: nanoid(),
      titulo: formData.titulo,
      mensagem: formData.mensagem,
      atalho: formData.atalho || undefined,
      createdAt: new Date(),
    };

    onAdd(newReply);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nova Resposta Rápida</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Título
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Saudação"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Mensagem
            </label>
            <textarea
              required
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Digite a mensagem que será enviada..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Atalho (opcional)
            </label>
            <input
              type="text"
              value={formData.atalho}
              onChange={(e) => setFormData({ ...formData, atalho: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              placeholder="/ola"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use um atalho como /ola para inserir rapidamente esta mensagem
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
