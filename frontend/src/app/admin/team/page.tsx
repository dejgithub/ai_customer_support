'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const roles = ['admin', 'agent', 'viewer'];
const roleColors: Record<string, string> = { admin: 'info', agent: 'success', viewer: 'default' };

const initialTeam = [
  { id: '1', full_name: 'You', email: 'admin@company.com', role: 'admin', status: 'active' },
];

export default function TeamPage() {
  const [team, setTeam] = useState(initialTeam);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: '', role: 'agent' });

  const handleInvite = () => {
    if (!invite.email) { toast.error('Email is required'); return; }
    const newMember = { id: Date.now().toString(), full_name: invite.email.split('@')[0], email: invite.email, role: invite.role, status: 'invited' as const };
    setTeam(prev => [...prev, newMember]);
    toast.success(`Invitation sent to ${invite.email}`);
    setShowInvite(false);
    setInvite({ email: '', role: 'agent' });
  };

  const handleRoleChange = (id: string, role: string) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    toast.success('Role updated');
  };

  const handleRemove = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    toast.success('Member removed');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <Button onClick={() => setShowInvite(true)}>+ Invite Member</Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map(member => (
              <tr key={member.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{member.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{member.email}</td>
                <td className="px-4 py-3">
                  <select className="text-xs border border-gray-200 rounded px-2 py-1" value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge></td>
                <td className="px-4 py-3">
                  <Button variant="danger" size="sm" onClick={() => handleRemove(member.id)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div><label className="label">Email</label><input type="email" className="input" placeholder="colleague@company.com" value={invite.email} onChange={e => setInvite(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Role</label>
            <select className="input" value={invite.role} onChange={e => setInvite(f => ({ ...f, role: e.target.value }))}>
              {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
