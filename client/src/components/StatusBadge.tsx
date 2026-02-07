/**
 * StatusBadge - Indicador visual de status
 * Design Philosophy: Minimalismo Corporativo
 * - Cores semânticas para cada status
 * - Feedback visual claro
 */

import type { LeadStatus, OrderStatus, ReferralStatus } from '@/types';

type Status = LeadStatus | OrderStatus | ReferralStatus;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  novo: { label: 'Novo', className: 'badge-novo' },
  atendimento: { label: 'Em atendimento', className: 'badge-atendimento' },
  convertido: { label: 'Convertido', className: 'badge-convertido' },
  perdido: { label: 'Perdido', className: 'badge-perdido' },
  aberto: { label: 'Em aberto', className: 'badge-atendimento' },
  confirmado: { label: 'Confirmado', className: 'badge-convertido' },
  finalizado: { label: 'Finalizado', className: 'badge-convertido' },
  indicada: { label: 'Indicada', className: 'badge-novo' },
  contato: { label: 'Em contato', className: 'badge-atendimento' },
  convertida: { label: 'Convertida', className: 'badge-convertido' },
  perdida: { label: 'Perdida', className: 'badge-perdido' },
  recompensada: { label: 'Recompensada', className: 'badge-convertido' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-2',
  };

  return (
    <span className={`${config.className} ${sizeClasses[size]} rounded-full font-medium`}>
      {config.label}
    </span>
  );
}
