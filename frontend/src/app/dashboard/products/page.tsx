'use client';

import { useState, useEffect } from 'react';
import { products as productsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, currency: 'USD', category: '', stock_quantity: 0, is_available: true });

  useEffect(() => {
    productsApi.list().then(data => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error('Product name is required'); return; }
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, form);
        toast.success('Product updated');
      } else {
        await productsApi.create(form);
        toast.success('Product created');
      }
      setShowNew(false); setEditProduct(null);
      setForm({ name: '', description: '', price: 0, currency: 'USD', category: '', stock_quantity: 0, is_available: true });
      const data = await productsApi.list();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleEdit = (product: any) => {
    setEditProduct(product);
    setForm({ name: product.name, description: product.description || '', price: product.price, currency: product.currency || 'USD', category: product.category || '', stock_quantity: product.stock_quantity || 0, is_available: product.is_available });
    setShowNew(true);
  };

  const handleToggleAvailability = async (product: any) => {
    try {
      await productsApi.update(product.id, { is_available: !product.is_available });
      toast.success(`Product ${product.is_available ? 'disabled' : 'enabled'}`);
      const data = await productsApi.list();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => { setEditProduct(null); setForm({ name: '', description: '', price: 0, currency: 'USD', category: '', stock_quantity: 0, is_available: true }); setShowNew(true); }}>+ Add Product</Button>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-500">No products yet</p>
          <Button className="mt-4" onClick={() => setShowNew(true)}>Add your first product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 text-xl">📦</div>
                <button onClick={() => handleToggleAvailability(product)} className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {product.is_available ? 'Active' : 'Inactive'}
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{product.currency || '$'}{product.price?.toFixed(2)}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock_quantity ?? 0}</span>
              </div>
              {product.category && <Badge className="mt-2">{product.category}</Badge>}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => { setShowNew(false); setEditProduct(null); }} title={editProduct ? 'Edit Product' : 'Add Product'} size="md">
        <div className="space-y-4">
          <div><label className="label">Name *</label><input className="input" placeholder="Product name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[80px]" placeholder="Product description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Price</label><input type="number" step="0.01" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
            <div><label className="label">Currency</label><select className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}><option value="USD">USD</option><option value="ETB">ETB</option><option value="EUR">EUR</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label><input className="input" placeholder="e.g. Electronics" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><label className="label">Stock</label><input type="number" className="input" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))} /></div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Available for purchase</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowNew(false); setEditProduct(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editProduct ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
