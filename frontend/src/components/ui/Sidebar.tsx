'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: '💬' },
  { href: '/dashboard/tickets', label: 'Tickets', icon: '🎫' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { href: '/dashboard/orders', label: 'Orders', icon: '🛒' },
  { href: '/dashboard/products', label: 'Products', icon: '📦' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
];

const adminItems = [
  { href: '/admin/business', label: 'Business', icon: '🏢' },
  { href: '/admin/knowledge', label: 'Knowledge Base', icon: '📚' },
  { href: '/admin/team', label: 'Team', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="font-bold text-lg text-gray-900">SmartSupport</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-65px)]">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">Main</div>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {(user?.role === 'admin') && (
            <>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2 mt-4">Admin</div>
              {adminItems.map(item => (
                <Link key={item.href} href={item.href} onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
