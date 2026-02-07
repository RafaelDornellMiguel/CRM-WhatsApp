/**
 * Schedule - Agendamento de reuniões e eventos
 * Design Philosophy: Minimalismo Corporativo
 * - Calendário com eventos
 * - Cultura interna (treinamentos, apresentações)
 * - Gerenciamento de participantes
 */

import { useState } from 'react';
import { useCRMStore } from '@/store';
import { Calendar, Plus, Clock, MapPin, Users, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Schedule, ScheduleType } from '@/types';

export default function SchedulePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { schedules, getSchedules, addSchedule, deleteSchedule, phoneNumbers } = useCRMStore();

  const sortedSchedules = getSchedules();

  const getTypeLabel = (tipo: ScheduleType) => {
    const labels: Record<ScheduleType, string> = {
      reuniao: 'Reunião',
      treinamento: 'Treinamento',
      apresentacao: 'Apresentação',
      evento: 'Evento',
    };
    return labels[tipo];
  };

  const getTypeColor = (tipo: ScheduleType) => {
    const colors: Record<ScheduleType, string> = {
      reuniao: 'bg-blue-100 text-blue-800',
      treinamento: 'bg-purple-100 text-purple-800',
      apresentacao: 'bg-green-100 text-green-800',
      evento: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tipo];
  };

  const isUpcoming = (date: Date) => {
    return new Date(date).getTime() > Date.now();
  };

  const upcomingSchedules = sortedSchedules.filter((s) => isUpcoming(s.dataInicio));
  const pastSchedules = sortedSchedules.filter((s) => !isUpcoming(s.dataInicio));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Calendário de reuniões, treinamentos e eventos
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-8">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Próximos Agendamentos</h2>
            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento próximo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={() => deleteSchedule(schedule.id)}
                    typeColor={getTypeColor(schedule.tipo)}
                    typeLabel={getTypeLabel(schedule.tipo)}
                    phoneNumbers={phoneNumbers}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {pastSchedules.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Agendamentos Anteriores</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-60">
                {pastSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={() => deleteSchedule(schedule.id)}
                    typeColor={getTypeColor(schedule.tipo)}
                    typeLabel={getTypeLabel(schedule.tipo)}
                    phoneNumbers={phoneNumbers}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <AddScheduleModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete: () => void;
  typeColor: string;
  typeLabel: string;
  phoneNumbers: any[];
  isPast?: boolean;
}

function ScheduleCard({
  schedule,
  onDelete,
  typeColor,
  typeLabel,
  phoneNumbers,
  isPast,
}: ScheduleCardProps) {
  const getParticipantNames = () => {
    if (!schedule.participantes) return [];
    return schedule.participantes.map((id) => {
      const phone = phoneNumbers.find((p) => p.vendedorId === id);
      return phone?.vendedorName || id;
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-lg">{schedule.titulo}</h3>
          {schedule.descricao && (
            <p className="text-sm text-muted-foreground mt-1">{schedule.descricao}</p>
          )}
        </div>
        {!isPast && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(schedule.dataInicio).toLocaleDateString('pt-BR')} às{' '}
            {new Date(schedule.dataInicio).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {schedule.local && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{schedule.local}</span>
          </div>
        )}

        {schedule.participantes && schedule.participantes.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Users className="w-4 h-4 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {getParticipantNames().map((name) => (
                <span
                  key={name}
                  className="inline-block bg-secondary px-2 py-1 rounded text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AddScheduleModalProps {
  onClose: () => void;
}

function AddScheduleModal({ onClose }: AddScheduleModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'reuniao' as ScheduleType,
    dataInicio: '',
    horaInicio: '',
    duracao: '1',
    local: '',
    participantes: [] as string[],
  });

  const { addSchedule, phoneNumbers } = useCRMStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataInicio = new Date(`${formData.dataInicio}T${formData.horaInicio}`);
    const dataFim = new Date(dataInicio.getTime() + parseInt(formData.duracao) * 60 * 60 * 1000);

    const newSchedule: Schedule = {
      id: nanoid(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      dataInicio,
      dataFim,
      local: formData.local,
      participantes: formData.participantes.length > 0 ? formData.participantes : undefined,
      createdAt: new Date(),
    };

    addSchedule(newSchedule);
    onClose();
  };

  const handleParticipantToggle = (vendedorId: string) => {
    setFormData((prev) => ({
      ...prev,
      participantes: prev.participantes.includes(vendedorId)
        ? prev.participantes.filter((id) => id !== vendedorId)
        : [...prev.participantes, vendedorId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Novo Agendamento</h2>
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
              placeholder="Ex: Treinamento de Produtos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Descrição do agendamento"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tipo
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ScheduleType })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="reuniao">Reunião</option>
                <option value="treinamento">Treinamento</option>
                <option value="apresentacao">Apresentação</option>
                <option value="evento">Evento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Local
              </label>
              <input
                type="text"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Sala de Reuniões"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
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
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Duração (horas)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duracao}
                onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Participants */}
          {phoneNumbers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Participantes
              </label>
              <div className="space-y-2">
                {phoneNumbers.map((phone) => (
                  <label key={phone.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.participantes.includes(phone.vendedorId)}
                      onChange={() => handleParticipantToggle(phone.vendedorId)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      {phone.vendedorName} ({phone.number})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
