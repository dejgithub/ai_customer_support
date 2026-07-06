'use client';

import { useState, useEffect } from 'react';
import { business as businessApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const categories = ['Retail', 'Restaurant', 'Hotel', 'Clinic', 'Education', 'Service'];
const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Africa/Cairo', 'Africa/Addis_Ababa'];

export default function BusinessPage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessApi.getProfile().then(data => {
      setProfile(data);
      setForm(data);
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await businessApi.updateProfile(form);
      toast.success('Business profile updated');
      setProfile(form);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl text-primary-600 font-bold">
            {form.name?.charAt(0) || 'B'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile?.name || 'Your Business'}</h2>
            <p className="text-sm text-gray-500">{profile?.category} • {profile?.subscription_tier} plan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Business Name</label>
            <input className="input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+1 234 567 890" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Address</label>
            <input className="input" placeholder="Street, City, Country" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[80px]" placeholder="Tell customers about your business" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" placeholder="https://example.com" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select className="input" value={form.timezone || 'UTC'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Logo URL</label>
            <input className="input" placeholder="https://storage.googleapis.com/..." value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
          </div>
          <div>
            <label className="label">Subscription</label>
            <input className="input bg-gray-50" value={profile?.subscription_tier || 'Free'} disabled />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
