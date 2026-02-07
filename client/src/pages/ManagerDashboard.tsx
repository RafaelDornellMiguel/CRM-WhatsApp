/**
 * Manager Dashboard - Acesso restrito para Gerente e Dono
 * Design Philosophy: Minimalismo Corporativo
 * - TMR (Tempo Médio de Resposta)
 * - Métricas por vendedor
 * - Rastreamento de comportamento
 * - Múltiplos números centralizados
 */

import { useCRMStore } from '@/store';
import { Phone, TrendingUp, MessageCircle, Clock, DollarSign, Users } from 'lucide-react';

export default function ManagerDashboard() {
  const { getAllVendedoresMetrics, phoneNumbers, currentUserRole } = useCRMStore();

  // Verificar acesso
  if (currentUserRole === 'vendedor') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Acesso Restrito</p>
          <p className="text-sm text-muted-foreground">
            Apenas Gerentes e Donos podem acessar este dashboard
          </p>
        </div>
      </div>
    );
  }

  const vendedoresMetrics = getAllVendedoresMetrics();

  // Calcular totais
  const totalLeads = vendedoresMetrics.reduce((sum, v) => sum + v.leadsAtribuidos, 0);
  const totalConvertidos = vendedoresMetrics.reduce((sum, v) => sum + v.leadsConvertidos, 0);
  const taxaConversaoGeral = totalLeads > 0 ? ((totalConvertidos / totalLeads) * 100).toFixed(1) : '0';
  const totalVendas = vendedoresMetrics.reduce((sum, v) => sum + v.vendaTotal, 0);
  const tmrMedio = vendedoresMetrics.length > 0
    ? Math.round(vendedoresMetrics.reduce((sum, v) => sum + v.tempoMedioRespostaTMR, 0) / vendedoresMetrics.length)
    : 0;

  // Ordenar por performance
  const vendedoresOrdenados = [...vendedoresMetrics].sort((a, b) => b.vendaTotal - a.vendaTotal);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Dashboard de Gerenciamento</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Métricas centralizadas de vendedores e performance
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* KPIs Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total de Leads"
            value={totalLeads}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />
          <MetricCard
            label="Taxa de Conversão"
            value={`${taxaConversaoGeral}%`}
            icon={TrendingUp}
            color="bg-green-100 text-green-600"
          />
          <MetricCard
            label="TMR Médio"
            value={`${tmrMedio}min`}
            icon={Clock}
            color="bg-purple-100 text-purple-600"
            subtitle="Tempo Médio de Resposta"
          />
          <MetricCard
            label="Receita Total"
            value={`R$ ${totalVendas.toFixed(2)}`}
            icon={DollarSign}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        {/* Números Centralizados */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Números Conectados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phoneNumbers.map((phone) => (
              <div key={phone.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{phone.vendedorName}</p>
                      <p className="text-xs text-muted-foreground">{phone.number}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      phone.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {phone.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance por Vendedor */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Performance por Vendedor</h2>
          {vendedoresOrdenados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum vendedor com dados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendedoresOrdenados.map((vendedor) => (
                <VendedorPerformanceCard key={vendedor.vendedorId} vendedor={vendedor} />
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className: string }>;
  color: string;
  subtitle?: string;
}

function MetricCard({ label, value, icon: Icon, color, subtitle }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{label}</h3>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

interface VendedorPerformanceCardProps {
  vendedor: any;
}

function VendedorPerformanceCard({ vendedor }: VendedorPerformanceCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Vendedor Info */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {vendedor.vendedorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{vendedor.vendedorName}</p>
              <p className="text-xs text-muted-foreground">{vendedor.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">Leads</p>
          <p className="text-xl font-bold text-foreground">
            {vendedor.leadsConvertidos}/{vendedor.leadsAtribuidos}
          </p>
          <p className="text-xs text-green-600 mt-1">{vendedor.taxaConversao.toFixed(1)}%</p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">TMR</p>
          <p className="text-xl font-bold text-foreground">{vendedor.tempoMedioRespostaTMR}min</p>
          <p className="text-xs text-muted-foreground mt-1">Tempo Médio</p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">Mensagens</p>
          <p className="text-xl font-bold text-foreground">{vendedor.totalMensagens}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">Receita</p>
          <p className="text-xl font-bold text-foreground">
            R$ {vendedor.vendaTotal.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(vendedor.ultimaAtividade).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-4 pt-4 border-t border-border space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Taxa de Conversão</span>
            <span className="text-xs font-semibold text-foreground">
              {vendedor.taxaConversao.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${Math.min(vendedor.taxaConversao, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Eficiência TMR</span>
            <span className="text-xs font-semibold text-foreground">
              {Math.max(0, 100 - (vendedor.tempoMedioRespostaTMR / 60) * 10).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.max(0, 100 - (vendedor.tempoMedioRespostaTMR / 60) * 10)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
