'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orders as ordersApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(id).then(setOrder).catch(() => toast.error('Failed to load order')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success(`Status: ${status}`);
      const updated = await ordersApi.get(id);
      setOrder(updated);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleInvoice = async () => {
    try {
      const inv = await ordersApi.getInvoice(id);
      toast.success('Invoice generated');
      console.log(inv);
    } catch { toast.error('Failed to generate invoice'); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number || `#${order.id?.slice(0, 8)}`}</h1>
        <Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Order Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="text-gray-700">{order.customer_id?.slice(0, 16)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-700">{order.created_at ? format(parseISO(order.created_at), 'MMM d, yyyy') : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge></div>
            <div className="flex justify-between"><span className="text-gray-500">Currency</span><span className="text-gray-700">{order.currency}</span></div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Items</h3>
            <div className="text-lg font-bold text-gray-900">Total: {order.currency || '$'}{order.total_amount?.toFixed(2)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Product</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Qty</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Unit Price</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-gray-700">{item.name}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{order.currency || '$'}{item.unit_price?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{order.currency || '$'}{item.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <Button key={status} variant={order.status === status ? 'primary' : 'secondary'} size="sm" onClick={() => handleStatusUpdate(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleInvoice}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Generate Invoice
        </Button>
      </div>
    </div>
  );
}
