'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { business as businessApi, support, appointments as appointApi, analytics as analyticsApi } from '@/lib/api';
import StatsCard from '@/components/ui/StatsCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AIInsights from '@/components/dashboard/AIInsights';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, convs, apps] = await Promise.all([
          businessApi.getStats().catch(() => ({
            total_conversations: 0, active_conversations: 0, total_customers: 0,
            total_tickets: 0, open_tickets: 0, total_appointments: 0,
            total_orders: 0, total_revenue: 0, satisfaction_score: 0, escalation_rate: 0,
          })),
          support.getConversations('per_page=5').catch(() => ({ conversations: [] })),
          appointApi.list('per_page=3').catch(() => ({ appointments: [] })),
        ]);
        setStats(statsData);
        setConversations(convs.conversations || []);
        setAppointments(apps.appointments || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} label="Total Conversations" value={stats?.total_conversations ?? 0} />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="Active Now" value={stats?.active_conversations ?? 0} trend="up" trendValue="12%" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Open Tickets" value={stats?.open_tickets ?? 0} trend="down" trendValue="5%" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Appointments Today" value={stats?.total_appointments ?? 0} />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Revenue" value={`$${(stats?.total_revenue ?? 0).toLocaleString()}`} trend="up" trendValue="8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link href="/dashboard/tickets?new=1" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
          <div><p className="font-medium text-gray-900">New Ticket</p><p className="text-sm text-gray-500">Create support ticket</p></div>
        </Link>
        <Link href="/dashboard/appointments?new=1" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
          <div><p className="font-medium text-gray-900">Book Appointment</p><p className="text-sm text-gray-500">Schedule a booking</p></div>
        </Link>
        <Link href="/dashboard/orders?new=1" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg></div>
          <div><p className="font-medium text-gray-900">New Order</p><p className="text-sm text-gray-500">Create customer order</p></div>
        </Link>
        <Link href="/admin/knowledge" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          <div><p className="font-medium text-gray-900">Upload Document</p><p className="text-sm text-gray-500">Train your AI</p></div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Conversations</h2>
            <Link href="/dashboard/conversations" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No conversations yet</div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv: any) => (
                <Link key={conv.id} href={`/dashboard/conversations/${conv.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.customer_name || 'Unknown Customer'}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.last_message || 'No messages'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={conv.status === 'active' ? 'success' : conv.status === 'waiting' ? 'warning' : conv.status === 'escalated' ? 'danger' : 'default'}>{conv.status}</Badge>
                    <span className="text-xs text-gray-400">{conv.created_at ? format(parseISO(conv.created_at), 'MMM d') : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No upcoming appointments</div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.title}</p>
                    <p className="text-xs text-gray-500">{apt.start_time ? format(parseISO(apt.start_time), 'MMM d, yyyy h:mm a') : ''}</p>
                  </div>
                  <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'scheduled' ? 'info' : apt.status === 'cancelled' ? 'danger' : 'default'}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AIInsights />
    </div>
  );
}
