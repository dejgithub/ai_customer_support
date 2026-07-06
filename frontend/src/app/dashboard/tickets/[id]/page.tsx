'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets as ticketsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    ticketsApi.get(id).then(setTicket).catch(() => toast.error('Failed to load ticket')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      await ticketsApi.update(id, { status });
      toast.success(`Status updated to ${status}`);
      const updated = await ticketsApi.get(id);
      setTicket(updated);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!ticket) return <div className="text-center py-20 text-gray-500">Ticket not found</div>;

  const priorityColors: Record<string, string> = { low: 'default', medium: 'warning', high: 'danger', critical: 'danger' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id?.slice(0, 8)}</h1>
        <Badge variant={priorityColors[ticket.priority] || 'default'}>{ticket.priority}</Badge>
        <Badge variant={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : ticket.status === 'in_progress' ? 'info' : 'warning'}>{ticket.status}</Badge>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{ticket.subject}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span>Category: {ticket.category || 'N/A'}</span>
          <span>Assigned to: {ticket.assigned_to || 'Unassigned'}</span>
          <span>Created: {ticket.created_at ? format(parseISO(ticket.created_at), 'MMM d, yyyy') : ''}</span>
          <span>Updated: {ticket.updated_at ? format(parseISO(ticket.updated_at), 'MMM d, yyyy') : ''}</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {['open', 'in_progress', 'resolved', 'closed'].map(status => (
            <Button key={status} variant={ticket.status === status ? 'primary' : 'secondary'} size="sm" onClick={() => handleStatusUpdate(status)}>
              {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Assignment</h3>
        <div className="flex items-center gap-2">
          <input className="input flex-1" placeholder="Agent ID or email..." />
          <Button size="sm" onClick={async () => {
            const input = document.querySelector<HTMLInputElement>('[placeholder="Agent ID or email..."]');
            if (input?.value) {
              try {
                await ticketsApi.update(id, { assigned_to: input.value });
                toast.success('Assigned');
                const updated = await ticketsApi.get(id);
                setTicket(updated);
                input.value = '';
              } catch (err: any) { toast.error(err.message); }
            }
          }}>Assign</Button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Notes / Updates</h3>
        <div className="flex gap-2">
          <textarea className="input flex-1 min-h-[80px]" placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} />
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={() => { if (newNote.trim()) { toast.success('Note added (demo)'); setNewNote(''); } }}>Add Note</Button>
        </div>
      </div>
    </div>
  );
}
