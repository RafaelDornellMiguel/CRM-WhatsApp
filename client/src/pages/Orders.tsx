/**
 * Orders - Gerenciamento de pedidos
 * Design Philosophy: Minimalismo Corporativo
 * - Lista de pedidos com status
 * - Vinculação com leads
 * - Alteração de status
 */

import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { ShoppingCart } from 'lucide-react';
import type { OrderStatus } from '@/types';

const orderStatuses: OrderStatus[] = ['aberto', 'confirmado', 'finalizado'];

export default function Orders() {
  const { orders, leads, contacts, products, updateOrderStatus } = useCRMStore();

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const getContactName = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return 'Desconhecido';
    const contact = contacts.find((c) => c.id === lead.contactId);
    return contact?.name || 'Desconhecido';
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Produto desconhecido';
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'finalizado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Total de pedidos: {orders.length} | Receita: R$ {totalRevenue.toFixed(2)}
        </p>
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido criado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Produtos</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-mono">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {getContactName(order.leadId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.productId}>
                            {getProductName(item.productId)} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-semibold text-right">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="text-sm bg-card border border-border rounded px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
