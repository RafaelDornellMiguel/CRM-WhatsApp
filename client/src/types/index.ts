/**
 * Tipos compartilhados do CRM WhatsApp MVP
 * Design Philosophy: Minimalismo Corporativo
 */

// Etiquetas personalizadas conforme solicitado
export type LeadTag = 'orcamento' | 'venda_fechada' | 'amsterda' | 'royale';
export type LeadStatus = 'novo' | 'atendimento' | 'convertido' | 'perdido';
export type LeadOrigin = 'whatsapp' | 'indicacao';
export type OrderStatus = 'aberto' | 'confirmado' | 'finalizado';
export type ReferralStatus = 'indicada' | 'contato' | 'convertida' | 'perdida' | 'recompensada';
export type ScheduleType = 'reuniao' | 'treinamento' | 'apresentacao' | 'evento';
export type UserRole = 'vendedor' | 'gerente' | 'dono';
export type TicketStatus = 'aberto' | 'resolvido';
export type MessageStatus = 'enviada' | 'entregue' | 'lida';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  contactId: string;
  status: LeadStatus;
  ticketStatus?: TicketStatus;
  origin: LeadOrigin;
  referrerId?: string;
  vendedorId?: string;
  phoneNumberId?: string;
  tags?: LeadTag[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: Date;
  phoneNumberId?: string;
  vendedorId?: string;
  whatsappMessageId?: string;
  status?: MessageStatus;
  read?: boolean;
}

export interface QuickReply {
  id: string;
  titulo: string;
  mensagem: string;
  atalho?: string;
  createdAt: Date;
}

export interface ScheduledMessage {
  id: string;
  leadId: string;
  contactId: string;
  mensagem: string;
  dataAgendada: Date;
  enviada: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  modelo?: string;
  medida?: string;
  price: number;
  stock: number;
  sku: string;
  description?: string;
  categoria?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  leadId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  dataEntrega?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredContactId: string;
  referredLeadId: string;
  status: ReferralStatus;
  channel: 'whatsapp' | 'link' | 'formulario';
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneNumber {
  id: string;
  number: string;
  vendedorId: string;
  vendedorName: string;
  ativo: boolean;
  createdAt: Date;
  whatsappConnected?: boolean;
  whatsappToken?: string;
}

export interface Schedule {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: ScheduleType;
  dataInicio: Date;
  dataFim: Date;
  local?: string;
  participantes?: string[];
  vendedorId?: string;
  createdAt: Date;
}

export interface MessageMetrics {
  leadId: string;
  vendedorId: string;
  primeiraResposta: Date | null;
  ultimaResposta: Date | null;
  tempoMedioResposta: number;
  totalMensagens: number;
  mensagensEnviadas: number;
  mensagensRecebidas: number;
}

export interface VendedorMetrics {
  vendedorId: string;
  vendedorName: string;
  phoneNumber: string;
  leadsAtribuidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  tempoMedioRespostaTMR: number;
  totalMensagens: number;
  pedidosCriados: number;
  vendaTotal: number;
  ultimaAtividade: Date;
}

export interface DashboardMetrics {
  leadsRecebidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  pedidosCriados: number;
  vendaPorIndicacao: number;
  clientesQueIndicam: Array<{ name: string; count: number }>;
  vendedoresMetrics?: VendedorMetrics[];
}

// WhatsApp API Types (Simulação)
export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  connected: boolean;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'image' | 'document';
  text?: { body: string };
  timestamp: string;
}
