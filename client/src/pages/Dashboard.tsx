/**
 * Dashboard - Métricas e KPIs
 * Design Philosophy: Minimalismo Corporativo
 * - Números que mudam conforme o uso
 * - Visualização clara de métricas
 * - Impacto visual dos dados
 */

import { useCRMStore } from '@/store';
import { TrendingUp, Users, ShoppingCart, Package, Gift, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { leads, orders, referrals, contacts } = useCRMStore();

  // Calcular métricas
  const leadsRecebidos = leads.length;
  const leadsConvertidos = leads.filter((l) => l.status === 'convertido').length;
  const taxaConversao = leadsRecebidos > 0 ? ((leadsConvertidos / leadsRecebidos) * 100).toFixed(1) : '0';
  const pedidosCriados = orders.length;
  const pedidosFinalizados = orders.filter((o) => o.status === 'finalizado').length;
  const vendaPorIndicacao = orders.filter((o) => {
    const lead = leads.find((l) => l.id === o.leadId);
    return lead?.origin === 'indicacao';
  }).length;

  // Top referrers
  const topReferrers = contacts
    .map((contact) => ({
      name: contact.name,
      count: referrals.filter((r) => r.referrerId === contact.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calcular receita
  const totalRevenue = orders
    .filter((o) => o.status === 'finalizado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const revenueByReferral = orders
    .filter((o) => {
      const lead = leads.find((l) => l.id === o.leadId);
      return lead?.origin === 'indicacao' && o.status === 'finalizado';
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const metrics = [
    {
      label: 'Leads Recebidos',
      value: leadsRecebidos,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      trend: '+12% este mês',
    },
    {
      label: 'Leads Convertidos',
      value: leadsConvertidos,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      trend: `${taxaConversao}% de conversão`,
    },
    {
      label: 'Pedidos Criados',
      value: pedidosCriados,
      icon: ShoppingCart,
      color: 'bg-purple-100 text-purple-600',
      trend: `${pedidosFinalizados} finalizados`,
    },
    {
      label: 'Vendas por Indicação',
      value: vendaPorIndicacao,
      icon: Gift,
      color: 'bg-yellow-100 text-yellow-600',
      trend: `R$ ${revenueByReferral.toFixed(2)}`,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Visão geral do GRUPO EVOLUTION e métricas em tempo real
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">{metric.label}</h3>
                <p className="text-3xl font-bold text-foreground mb-2">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.trend}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">Receita Total</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              R$ {totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {pedidosFinalizados} pedidos finalizados
            </p>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Funil de Conversão</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Leads Novos</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leads.filter((l) => l.status === 'novo').length}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${leadsRecebidos > 0 ? ((leads.filter((l) => l.status === 'novo').length / leadsRecebidos) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Em Atendimento</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leads.filter((l) => l.status === 'atendimento').length}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${leadsRecebidos > 0 ? ((leads.filter((l) => l.status === 'atendimento').length / leadsRecebidos) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Convertidos</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leadsConvertidos}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${leadsRecebidos > 0 ? ((leadsConvertidos / leadsRecebidos) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lead Origin */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Origem dos Leads</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">WhatsApp</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leads.filter((l) => l.origin === 'whatsapp').length}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${leadsRecebidos > 0 ? ((leads.filter((l) => l.origin === 'whatsapp').length / leadsRecebidos) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Indicação</span>
                  <span className="text-sm font-semibold text-foreground">
                    {leads.filter((l) => l.origin === 'indicacao').length}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${leadsRecebidos > 0 ? ((leads.filter((l) => l.origin === 'indicacao').length / leadsRecebidos) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Clientes que Mais Indicam</h3>
            <div className="space-y-3">
              {topReferrers.map((referrer, index) => (
                <div
                  key={referrer.name}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <span className="font-medium text-foreground">{referrer.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {referrer.count} indicação{referrer.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
