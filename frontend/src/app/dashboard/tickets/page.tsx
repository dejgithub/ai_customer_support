'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tickets as ticketsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statuses = ['All', 'open', 'in_progress', 'resolved', 'closed'];

const priorityColors: Record<string, string> = {
  low: 'default', medium: 'warning', high: 'danger', critical: 'danger',
};

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', description: '', priority: 'medium', category: '' });

  useEffect(() => {
    ticketsApi.list().then(data => {
      setTickets(data.tickets || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t => {
    if (filter !== 'All' && t.status !== filter) return false;
    if (search && !t.subject?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!newForm.subject || !newForm.description) { toast.error('Please fill in subject and description'); return; }
    try {
      await ticketsApi.create(newForm);
      toast.success('Ticket created');
      setShowNew(false);
      setNewForm({ subject: '', description: '', priority: 'medium', category: '' });
      const data = await ticketsApi.list();
      setTickets(data.tickets || []);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="input pl-9 w-48" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setShowNew(true)}>+ New Ticket</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'All' ? 'All' : s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🎫</div>
          <p className="text-gray-500">No tickets found</p>
          <Button className="mt-4" onClick={() => setShowNew(true)}>Create your first ticket</Button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{ticket.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{ticket.subject}</td>
                    <td className="px-4 py-3"><Badge variant={priorityColors[ticket.priority] || 'default'}>{ticket.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : ticket.status === 'in_progress' ? 'info' : 'warning'}>{ticket.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{ticket.category || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{ticket.assigned_to || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-gray-500">{ticket.created_at ? format(parseISO(ticket.created_at), 'MMM d') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create New Ticket" size="md">
        <div className="space-y-4">
          <div><label className="label">Subject</label><input className="input" placeholder="Issue summary" value={newForm.subject} onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[100px]" placeholder="Detailed description..." value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Priority</label><select className="input" value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div><label className="label">Category</label><input className="input" placeholder="e.g. billing" value={newForm.category} onChange={e => setNewForm(f => ({ ...f, category: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Ticket</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
