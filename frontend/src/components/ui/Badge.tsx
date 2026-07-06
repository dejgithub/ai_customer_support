'use client';

const variants: Record<string, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  default: 'badge bg-gray-100 text-gray-800',
};

export default function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) {
  return <span className={`${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
