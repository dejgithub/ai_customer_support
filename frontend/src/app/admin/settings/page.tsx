'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsPage() {
  const [aiConfig, setAiConfig] = useState({
    welcome_message: 'Hello! How can I help you today?',
    fallback_message: 'I\'ll connect you with a human agent.',
    language: 'EN',
  });
  const [businessHours, setBusinessHours] = useState(
    daysOfWeek.map(d => ({ day: d, open: '09:00', close: '17:00', enabled: d !== 'Saturday' && d !== 'Sunday' }))
  );
  const [channels, setChannels] = useState({
    web_widget: true,
    whatsapp: false,
    telegram: false,
    messenger: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Settings saved');
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">AI Behavior</h2>
        <div className="space-y-4">
          <div><label className="label">Welcome Message</label><textarea className="input min-h-[60px]" value={aiConfig.welcome_message} onChange={e => setAiConfig(f => ({ ...f, welcome_message: e.target.value }))} /></div>
          <div><label className="label">Fallback Message</label><textarea className="input min-h-[60px]" value={aiConfig.fallback_message} onChange={e => setAiConfig(f => ({ ...f, fallback_message: e.target.value }))} /></div>
          <div><label className="label">Default Language</label>
            <select className="input" value={aiConfig.language} onChange={e => setAiConfig(f => ({ ...f, language: e.target.value }))}>
              <option value="EN">English</option><option value="AM">Amharic</option><option value="OM">Oromo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Business Hours</h2>
        <div className="space-y-3">
          {businessHours.map((bh, i) => (
            <div key={bh.day} className="flex items-center gap-4">
              <label className="flex items-center gap-2 w-32">
                <input type="checkbox" checked={bh.enabled} onChange={e => setBusinessHours(prev => prev.map((h, j) => j === i ? { ...h, enabled: e.target.checked } : h))} className="rounded border-gray-300 text-primary-600" />
                <span className="text-sm text-gray-700">{bh.day.slice(0, 3)}</span>
              </label>
              <input type="time" className="input w-32" value={bh.open} disabled={!bh.enabled} onChange={e => setBusinessHours(prev => prev.map((h, j) => j === i ? { ...h, open: e.target.value } : h))} />
              <span className="text-gray-400">to</span>
              <input type="time" className="input w-32" value={bh.close} disabled={!bh.enabled} onChange={e => setBusinessHours(prev => prev.map((h, j) => j === i ? { ...h, close: e.target.value } : h))} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Channels</h2>
        <div className="space-y-3">
          {[
            { key: 'web_widget', label: 'Web Widget', desc: 'Embed chat on your website' },
            { key: 'whatsapp', label: 'WhatsApp', desc: 'Connect WhatsApp Business API' },
            { key: 'telegram', label: 'Telegram', desc: 'Telegram bot integration' },
            { key: 'messenger', label: 'Messenger', desc: 'Facebook Messenger integration' },
          ].map(ch => (
            <label key={ch.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
              <div><p className="font-medium text-gray-900">{ch.label}</p><p className="text-sm text-gray-500">{ch.desc}</p></div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${channels[ch.key as keyof typeof channels] ? 'bg-primary-600' : 'bg-gray-300'}`} onClick={() => setChannels(f => ({ ...f, [ch.key]: !f[ch.key as keyof typeof channels] }))}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${channels[ch.key as keyof typeof channels] ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Free Plan</p>
            <p className="text-sm text-gray-500">100 conversations per month</p>
          </div>
          <Button variant="primary">Upgrade</Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>Save All Settings</Button>
      </div>
    </div>
  );
}
