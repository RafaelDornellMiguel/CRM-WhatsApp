/**
 * Sidebar - Navegação principal
 * Design Philosophy: Minimalismo Corporativo
 * - Sidebar persistente à esquerda
 * - Navegação clara com ícones
 * - Indicadores visuais de seção ativa
 */

import { Link, useLocation } from 'wouter';
import {
  MessageCircle,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Gift,
  BarChart3,
  Calendar,
  Shield,
  Menu,
  X,
  Phone,
  UserCircle,
  Zap,
  Clock,
  Moon,
  Sun,
  Cog,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCRMStore } from '@/store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { messages } = useCRMStore();

  // Contar mensagens não lidas
  const unreadCount = messages.filter((m) => m.sender === 'contact' && !m.read).length;

  const navItems: NavItem[] = [
    { label: 'Conversas', href: '/', icon: <MessageCircle className="w-5 h-5" />, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Conexões', href: '/connections', icon: <Phone className="w-5 h-5" /> },
    { label: 'Contatos', href: '/contacts', icon: <UserCircle className="w-5 h-5" /> },
    { label: 'Respostas Rápidas', href: '/quick-replies', icon: <Zap className="w-5 h-5" /> },
    { label: 'Mensagens Agendadas', href: '/scheduled-messages', icon: <Clock className="w-5 h-5" /> },
    { label: 'Leads', href: '/leads', icon: <Users className="w-5 h-5" /> },
    { label: 'Pedidos', href: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Produtos & Estoque', href: '/products-inventory', icon: <Package className="w-5 h-5" /> },
    { label: 'Indicações', href: '/referrals', icon: <Gift className="w-5 h-5" /> },
    { label: 'Agendamentos', href: '/schedule', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Gerenciamento', href: '/manager', icon: <Shield className="w-5 h-5" /> },
    { label: 'Configurações', href: '/settings', icon: <Cog className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-secondary rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">GRUPO</h1>
              <p className="text-xs text-sidebar-accent-foreground">EVOLUTION</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
