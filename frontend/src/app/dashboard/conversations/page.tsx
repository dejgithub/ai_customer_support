'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { support } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';

const statuses = ['All', 'active', 'waiting', 'resolved', 'escalated'];

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    support.getConversations().then(data => {
      setConversations(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = !search || (c.customer_name || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-500">No conversations found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Channel</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Language</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Messages</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Last Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(conv => (
                  <tr key={conv.id} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/conversations/${conv.id}`)}>
                    <td className="px-4 py-3 font-medium text-gray-900">{conv.customer_name || 'Unknown'}</td>
                    <td className="px-4 py-3"><Badge variant="info">{conv.channel || 'web'}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={conv.status === 'active' ? 'success' : conv.status === 'waiting' ? 'warning' : conv.status === 'escalated' ? 'danger' : 'default'}>{conv.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{conv.language || 'EN'}</td>
                    <td className="px-4 py-3 text-gray-600">{conv.message_count || 0}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{conv.last_message || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{conv.created_at ? format(parseISO(conv.created_at), 'MMM d, HH:mm') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
