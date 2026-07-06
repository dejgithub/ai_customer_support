export interface User {
  id: string; email: string; full_name: string; role: 'admin' | 'agent' | 'viewer'; business_id: string;
}
export interface Business {
  id: string; name: string; email: string; phone?: string; address?: string; category: string; description?: string; logo_url?: string; website?: string; timezone: string; subscription_tier: string; is_active: boolean;
}
export interface Customer {
  id: string; name: string; email?: string; phone?: string; source: string; metadata?: any; created_at: string;
}
export interface Conversation {
  id: string; customer_id: string; customer_name?: string; channel: string; status: string; language: string; is_escalated: boolean; message_count?: number; last_message?: string; created_at: string;
}
export interface Message {
  id: string; conversation_id: string; sender_type: 'customer' | 'ai' | 'agent' | 'system'; sender_id?: string; content: string; content_type: string; created_at: string;
}
export interface Ticket {
  id: string; customer_id?: string; subject: string; description: string; priority: string; status: string; category?: string; assigned_to?: string; created_at: string; updated_at: string;
}
export interface Appointment {
  id: string; customer_id: string; title: string; start_time: string; end_time: string; status: string; service_name?: string;
}
export interface Order { id: string; customer_id: string; order_number: string; status: string; total_amount: number; currency: string; items?: OrderItem[]; created_at: string; }
export interface OrderItem { id: string; product_id?: string; name: string; quantity: number; unit_price: number; total_price: number; }
export interface Product { id: string; name: string; description?: string; price: number; currency: string; category?: string; is_available: boolean; stock_quantity: number; }
export interface DashboardStats { total_conversations: number; active_conversations: number; total_customers: number; total_tickets: number; open_tickets: number; total_appointments: number; total_orders: number; total_revenue: number; satisfaction_score: number; escalation_rate: number; }
export interface KnowledgeDocument { id: string; title: string; file_type: string; chunk_count: number; created_at: string; }
export interface ChatResponse { message: Message; conversation_id: string; suggested_actions?: string[]; }
export interface Slot { start: string; end: string; available: boolean; }
