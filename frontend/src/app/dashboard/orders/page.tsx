'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orders as ordersApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statuses = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ customer_id: '', order_number: '', total_amount: 0, currency: 'USD', items: [{ name: '', quantity: 1, unit_price: 0, total_price: 0 }] });

  useEffect(() => {
    ordersApi.list().then(data => {
      setOrders(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const handleCreate = async () => {
    if (!form.customer_id) { toast.error('Customer ID is required'); return; }
    try {
      form.total_amount = form.items.reduce((sum, item) => sum + item.total_price, 0);
      await ordersApi.create(form);
      toast.success('Order created');
      setShowNew(false);
      setForm({ customer_id: '', order_number: '', total_amount: 0, currency: 'USD', items: [{ name: '', quantity: 1, unit_price: 0, total_price: 0 }] });
      const data = await ordersApi.list();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button onClick={() => setShowNew(true)}>+ New Order</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-gray-500">No orders found</p>
          <Button className="mt-4" onClick={() => setShowNew(true)}>Create your first order</Button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Items</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number || `#${order.id?.slice(0, 8)}`}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_id?.slice(0, 12) || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.currency || '$'}{order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3"><Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{order.created_at ? format(parseISO(order.created_at), 'MMM d') : '-'}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select className="text-xs border border-gray-200 rounded px-2 py-1" onChange={async e => {
                            try { await ordersApi.updateStatus(order.id, e.target.value); toast.success('Status updated'); const data = await ordersApi.list(); setOrders(Array.isArray(data) ? data : []); } catch (err: any) { toast.error(err.message); }
                          }}>
                            <option value="">Update</option>
                            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Order" size="lg">
        <div className="space-y-4">
          <div><label className="label">Customer ID</label><input className="input" placeholder="Customer ID" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} /></div>
          <div><label className="label">Order Number</label><input className="input" placeholder="ORD-001" value={form.order_number} onChange={e => setForm(f => ({ ...f, order_number: e.target.value }))} /></div>
          <div><label className="label">Items</label>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Product name" value={item.name} onChange={e => { const items = [...form.items]; items[i].name = e.target.value; setForm(f => ({ ...f, items })); }} />
                <input type="number" className="input w-20" placeholder="Qty" value={item.quantity} onChange={e => { const items = [...form.items]; items[i].quantity = Number(e.target.value); items[i].total_price = items[i].quantity * items[i].unit_price; setForm(f => ({ ...f, items })); }} />
                <input type="number" step="0.01" className="input w-24" placeholder="Price" value={item.unit_price} onChange={e => { const items = [...form.items]; items[i].unit_price = Number(e.target.value); items[i].total_price = items[i].quantity * items[i].unit_price; setForm(f => ({ ...f, items })); }} />
                <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="p-2 text-red-500 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: 1, unit_price: 0, total_price: 0 }] }))}>+ Add Item</Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Order</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
