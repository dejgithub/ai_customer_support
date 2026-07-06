'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

const categories = ['Retail', 'Restaurant', 'Hotel', 'Clinic', 'Education', 'Service'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ business_name: '', full_name: '', email: '', password: '', confirm_password: '', category: 'Retail' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.full_name || !form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await auth.register({
        business_name: form.business_name,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        category: form.category,
      });
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-2xl text-gray-900">SmartSupport AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Start automating your customer support</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="label" htmlFor="business_name">Business Name</label>
              <input id="business_name" name="business_name" type="text" className="input" placeholder="Your Business" value={form.business_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label" htmlFor="full_name">Your Full Name</label>
              <input id="full_name" name="full_name" type="text" className="input" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label" htmlFor="category">Business Category</label>
              <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label className="label" htmlFor="confirm_password">Confirm Password</label>
              <input id="confirm_password" name="confirm_password" type="password" className="input" placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
