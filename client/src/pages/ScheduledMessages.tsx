/**
 * Scheduled Messages - Mensagens agendadas
 * Design Philosophy: Minimalismo Corporativo
 * Inspirado no Whaticket
 */

import { useState } from 'react';
import { useCRMStore } from '@/store';
import { Search, Plus, Clock, Send, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { ScheduledMessage } from '@/types';

// Mock data inicial
const initialScheduledMessages: ScheduledMessage[] = [
  {
    id: '1',
    leadId: 'l1',
    contactId: 'c1',
    mensagem: 'Olá! Gostaria de saber se você já decidiu sobre o colchão Royale?',
    dataAgendada: new Date('2026-02-05T10:00:00'),
    enviada: false,
    createdAt: new Date('2026-02-02'),
  },
];

export default function ScheduledMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(initialScheduledMessages);
  const { contacts, leads, getContact } = useCRMStore();

  const filteredMessages = scheduledMessages.filter((msg) => {
    const contact = getContact(msg.contactId);
    return contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingMessages = filteredMessages.filter((m) => !m.enviada && new Date(m.dataAgendada) > new Date());
  const sentMessages = filteredMessages.filter((m) => m.enviada);

  const handleAddMessage = (message: ScheduledMessage) => {
    setScheduledMessages([...scheduledMessages, message]);
  };

  const handleDeleteMessage = (id: string) => {
    setScheduledMessages(scheduledMessages.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mensagens Agendadas</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Agende mensagens para serem enviadas automaticamente
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Agendar Mensagem
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por contato ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-8">
          {/* Pending Messages */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pendentes ({pendingMessages.length})
            </h2>
            {pendingMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma mensagem agendada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    contact={getContact(message.contactId)}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sent Messages */}
          {sentMessages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviadas ({sentMessages.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {sentMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    contact={getContact(message.contactId)}
                    onDelete={handleDeleteMessage}
                    sent
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Message Modal */}
      {showAddModal && (
        <AddScheduledMessageModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMessage}
          contacts={contacts}
          leads={leads}
        />
      )}
    </div>
  );
}

interface MessageCardProps {
  message: ScheduledMessage;
  contact: any;
  onDelete: (id: string) => void;
  sent?: boolean;
}

function MessageCard({ message, contact, onDelete, sent }: MessageCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{contact?.name || 'Contato desconhecido'}</h3>
            {sent && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                Enviada
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{contact?.phone}</p>
          <p className="text-sm text-foreground">{message.mensagem}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {new Date(message.dataAgendada).toLocaleDateString('pt-BR')} às{' '}
            {new Date(message.dataAgendada).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {!sent && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
            title="Cancelar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AddScheduledMessageModalProps {
  onClose: () => void;
  onAdd: (message: ScheduledMessage) => void;
  contacts: any[];
  leads: any[];
}

function AddScheduledMessageModal({ onClose, onAdd, contacts, leads }: AddScheduledMessageModalProps) {
  const [formData, setFormData] = useState({
    contactId: '',
    mensagem: '',
    data: '',
    hora: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lead = leads.find((l) => l.contactId === formData.contactId);
    if (!lead) return;

    const dataAgendada = new Date(`${formData.data}T${formData.hora}`);

    const newMessage: ScheduledMessage = {
      id: nanoid(),
      leadId: lead.id,
      contactId: formData.contactId,
      mensagem: formData.mensagem,
      dataAgendada,
      enviada: false,
      createdAt: new Date(),
    };

    onAdd(newMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Agendar Mensagem</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Contato
            </label>
            <select
              required
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um contato</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.phone}
                </option>
              ))}
            </select>
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
              placeholder="Digite a mensagem..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Horário
              </label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
