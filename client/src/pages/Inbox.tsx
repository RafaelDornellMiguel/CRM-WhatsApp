import { useState } from 'react';
import { useLocation } from 'wouter'; 
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { 
  Search, MessageCircle, CheckCircle2, Users, Lock, 
  Loader2, AlertCircle, User 
} from 'lucide-react';

// --- COMPONENTES UI SIMPLIFICADOS ---
const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const bg = variant === 'secondary' || variant === 'resolvido' ? 'bg-gray-200 text-gray-800' : 
             variant === 'destructive' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${className}`}>{children}</span>;
};

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

type TabType = 'abertos' | 'resolvidos' | 'busca';
type FilterType = 'todos' | 'meus' | 'espera';

export default function Inbox() {
  const [, setLocation] = useLocation();
  
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<TabType>('abertos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todos');

  // Busca conversas do Backend
  const { data, isLoading, error, refetch } = trpc.messages.listConversations.useQuery(
    undefined, 
    { 
      enabled: !!user,
      refetchInterval: 5000 // Polling a cada 5s
    }
  );

  // --- CORREÇÃO CRÍTICA AQUI ---
  // Garante que 'conversations' seja sempre um array, mesmo se o backend mandar null
  const conversations = Array.isArray(data) ? data : [];
  // -----------------------------

  // Filtros Lógicos
  const filteredConversations = conversations
    .filter((conv: any) => {
      // 1. Filtro por Aba (Status)
      const status = conv.ticketStatus || 'aberto';
      if (activeTab === 'abertos') return status === 'aberto';
      if (activeTab === 'resolvidos') return status === 'resolvido';
      return true; // Busca mostra tudo
    })
    .filter((conv: any) => {
      // 2. Filtro por Responsável
      if (filterType === 'meus') return conv.vendedorId === user?.id;
      if (filterType === 'espera') return false; 
      return true;
    })
    .filter((conv: any) => {
      // 3. Filtro de Texto (Busca)
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (conv.nome || '').toLowerCase().includes(term) ||
        (conv.telefone || '').includes(term)
      );
    });

  const handleSelectConversation = (contatoId: number) => {
    setLocation(`/chat/${contatoId}`); 
  };

  // Contadores seguros
  const abertosCount = conversations.filter((c: any) => (c.ticketStatus || 'aberto') === 'aberto').length;
  const resolvidosCount = conversations.filter((c: any) => c.ticketStatus === 'resolvido').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Erro ao carregar</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* --- HEADER --- */}
      <div className="border-b px-4 py-3 bg-white">
        <h1 className="text-xl font-bold mb-4">Inbox</h1>

        {/* Abas Superiores */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('abertos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'abertos' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Abertos
            <Badge className="ml-1">{abertosCount}</Badge>
          </button>

          <button
            onClick={() => setActiveTab('resolvidos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'resolvidos' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Resolvidos
            <Badge variant="secondary" className="ml-1">{resolvidosCount}</Badge>
          </button>

          <button
            onClick={() => setActiveTab('busca')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'busca' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Busca
          </button>
        </div>

        {/* Barra de Busca e Filtros Rápidos */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar nome ou telefone..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-2 text-xs font-medium rounded border ${filterType === 'todos' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('meus')}
              className={`px-3 py-2 text-xs font-medium rounded border flex items-center gap-1 ${filterType === 'meus' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
            >
              <User className="w-3 h-3" /> Meus
            </button>
          </div>
        </div>
      </div>

      {/* --- LISTA DE CONVERSAS --- */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
            <p>Nenhuma conversa encontrada nesta aba.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                {/* Avatar */}
                <div className="relative">
                    {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.nome} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-200">
                        {(conv.nome || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                    {/* Status Dot (Online/Offline - Simulado) */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                {/* Info Central */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">
                      {conv.nome || conv.telefone}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(conv.updatedAt || new Date()).toLocaleDateString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate max-w-[80%]">
                      {conv.telefone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}