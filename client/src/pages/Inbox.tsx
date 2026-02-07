/**
 * Inbox - Lista de conversas estilo Whaticket com dados reais do banco
 * Design Philosophy: Minimalismo Corporativo
 * Integração com Evolution API e PostgreSQL
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Search, MessageCircle, CheckCircle2, Filter, Users, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TabType = 'abertos' | 'resolvidos' | 'busca';
type FilterType = 'todos' | 'meus' | 'espera';

export default function Inbox() {
  const [, setLocation] = useLocation();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<TabType>('abertos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todos');

  // Fetch conversations from database
  const { data: conversations = [], isLoading, error } = trpc.messages.listConversations.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mark as read mutation
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  // Filter conversations
  const filteredConversations = conversations
    .filter((conv) => {
      // Filter by tab (status)
      const status = conv.ticketStatus || 'aberto';
      if (activeTab === 'abertos') return status === 'aberto';
      if (activeTab === 'resolvidos') return status === 'resolvido';
      return true;
    })
    .filter((conv) => {
      // Filter by type
      if (filterType === 'meus') return conv.vendedorId === user?.id;
      if (filterType === 'espera') return false; // TODO: Implementar contador de não lidas
      return true;
    })
    .filter((conv) => {
      // Filter by search
      if (!searchTerm) return true;
      return (
        conv.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.telefone.includes(searchTerm)
      );
    });

  const handleSelectConversation = (contatoId: number) => {
    // Mark as read
    markAsReadMutation.mutate({ contatoId });
    // Navigate to chat
    setLocation(`/chat?contatoId=${contatoId}`);
  };

  const handleToggleStatus = (contatoId: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement toggle status mutation
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Erro ao carregar conversas</p>
        </div>
      </div>
    );
  }

  const abertosCount = conversations.filter((c) => c.ticketStatus === 'aberto').length;
  const resolvidosCount = conversations.filter((c) => c.ticketStatus === 'resolvido').length;
  const emEsperaCount = 0; // TODO: Implementar contador de não lidas

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground mb-4">Conversas</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border">
          <button
            onClick={() => setActiveTab('abertos')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'abertos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            ABERTOS
            <Badge variant="secondary" className="ml-2">
              {abertosCount}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab('resolvidos')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'resolvidos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            RESOLVIDOS
            <Badge variant="secondary" className="ml-2">
              {resolvidosCount}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab('busca')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'busca'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            BUSCA
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nome, número ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'todos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('meus')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterType === 'meus'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Users className="w-4 h-4" />
              Meus chats
            </button>
            <button
              onClick={() => setFilterType('espera')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterType === 'espera'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Lock className="w-4 h-4" />
              Em espera
              {emEsperaCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {emEsperaCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="rounded-none border-0 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar and Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {conv.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{conv.nome}</h3>
                        <p className="text-sm text-muted-foreground">{conv.telefone}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate ml-14">
                      Última mensagem aqui
                    </p>
                  </div>

                  {/* Status and Unread */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      variant={conv.ticketStatus === 'resolvido' ? 'secondary' : 'default'}
                      className="capitalize"
                    >
                      {conv.ticketStatus === 'resolvido' ? 'Resolvido' : 'Aberto'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
