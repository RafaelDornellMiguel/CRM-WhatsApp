/**
 * Referrals - Programa de indicação
 * Design Philosophy: Minimalismo Corporativo
 * - Visualização de indicações
 * - Status de indicação
 * - Clientes que mais indicam
 */

import { useState } from 'react';
import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { Gift, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Referral } from '@/types';

export default function Referrals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { referrals, contacts, leads, addReferral, updateReferralStatus } = useCRMStore();

  const getContactName = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.name || 'Desconhecido';
  };

  const topReferrers = contacts
    .map((contact) => ({
      contact,
      count: referrals.filter((r) => r.referrerId === contact.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleStatusChange = (referralId: string, newStatus: string) => {
    updateReferralStatus(referralId, newStatus as any);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programa de Indicação</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {referrals.length} indicações | {topReferrers.length} clientes indicando
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Indicação
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referrals List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-4">Indicações Recentes</h2>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma indicação ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {getContactName(referral.referrerId)}
                          </span>
                          {' indicou '}
                          <span className="font-semibold text-foreground">
                            {getContactName(referral.referredContactId)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Canal: {referral.channel === 'whatsapp' ? 'WhatsApp' : referral.channel === 'link' ? 'Link' : 'Formulário'}
                        </p>
                      </div>
                      <StatusBadge status={referral.status} size="sm" />
                    </div>

                    {/* Status Selector */}
                    <select
                      value={referral.status}
                      onChange={(e) => handleStatusChange(referral.id, e.target.value)}
                      className="text-sm bg-background border border-border rounded px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="indicada">Indicada</option>
                      <option value="contato">Em contato</option>
                      <option value="convertida">Convertida</option>
                      <option value="perdida">Perdida</option>
                      <option value="recompensada">Recompensada</option>
                    </select>

                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Top Indicadores</h2>
            {topReferrers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Sem indicadores ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((referrer, index) => (
                  <div
                    key={referrer.contact.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {referrer.contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {referrer.count} indicação{referrer.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Referral Modal */}
      {showAddModal && (
        <AddReferralModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

interface AddReferralModalProps {
  onClose: () => void;
}

function AddReferralModal({ onClose }: AddReferralModalProps) {
  const [formData, setFormData] = useState({
    referrerId: '',
    referredContactId: '',
    channel: 'whatsapp' as const,
  });

  const { contacts, addReferral, addContact, addLead } = useCRMStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.referrerId || !formData.referredContactId) return;

    const newReferral: Referral = {
      id: nanoid(),
      referrerId: formData.referrerId,
      referredContactId: formData.referredContactId,
      referredLeadId: '', // Será preenchido ao criar o lead
      status: 'indicada',
      channel: formData.channel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar lead para o contato indicado
    const referredContact = contacts.find((c) => c.id === formData.referredContactId);
    if (referredContact) {
      const newLead: any = {
        id: nanoid(),
        contactId: formData.referredContactId,
        status: 'novo',
        origin: 'indicacao',
        referrerId: formData.referrerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      newReferral.referredLeadId = newLead.id;
      addReferral(newReferral);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nova Indicação</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Quem está indicando?
            </label>
            <select
              required
              value={formData.referrerId}
              onChange={(e) => setFormData({ ...formData, referrerId: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um cliente</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Quem foi indicado?
            </label>
            <select
              required
              value={formData.referredContactId}
              onChange={(e) =>
                setFormData({ ...formData, referredContactId: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um cliente</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Canal
            </label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="link">Link</option>
              <option value="formulario">Formulário</option>
            </select>
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
