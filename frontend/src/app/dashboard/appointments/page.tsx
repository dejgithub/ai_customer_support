'use client';

import { useState, useEffect } from 'react';
import { appointments as appointApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  scheduled: 'info', confirmed: 'success', cancelled: 'danger', completed: 'default',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', customer_id: '', start_time: '', end_time: '', service_name: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    appointApi.list().then(data => {
      setAppointments(data.appointments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filterDate ? appointments.filter(a => a.start_time?.startsWith(filterDate)) : appointments;

  const handleCreate = async () => {
    if (!form.title || !form.start_time) { toast.error('Title and start time are required'); return; }
    try {
      await appointApi.create(form);
      toast.success('Appointment created');
      setShowNew(false);
      setForm({ title: '', customer_id: '', start_time: '', end_time: '', service_name: '' });
      const data = await appointApi.list();
      setAppointments(data.appointments || []);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await appointApi.update(id, { status });
      toast.success(`Status: ${status}`);
      const data = await appointApi.list();
      setAppointments(data.appointments || []);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex items-center gap-3">
          <input type="date" className="input w-auto" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Button onClick={() => setShowNew(true)}>+ Book Appointment</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-500">No appointments found</p>
          <Button className="mt-4" onClick={() => setShowNew(true)}>Book your first appointment</Button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Start</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">End</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr key={apt.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{apt.title}</td>
                    <td className="px-4 py-3 text-gray-600">{apt.service_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{apt.start_time ? format(parseISO(apt.start_time), 'MMM d, h:mm a') : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{apt.end_time ? format(parseISO(apt.end_time), 'h:mm a') : '-'}</td>
                    <td className="px-4 py-3"><Badge variant={statusColors[apt.status] || 'default'}>{apt.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>Confirm</Button>
                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>Cancel</Button>
                          </>
                        )}
                        {apt.status === 'confirmed' && <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(apt.id, 'completed')}>Complete</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Book Appointment" size="md">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" placeholder="Appointment title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label">Customer ID</label><input className="input" placeholder="Customer ID" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} /></div>
          <div><label className="label">Service Name</label><input className="input" placeholder="e.g. Consultation" value={form.service_name} onChange={e => setForm(f => ({ ...f, service_name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Time</label><input type="datetime-local" className="input" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
            <div><label className="label">End Time</label><input type="datetime-local" className="input" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Book</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
