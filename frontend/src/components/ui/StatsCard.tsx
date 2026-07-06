'use client';

export default function StatsCard({
  icon, label, value, trend, trendValue, className = '',
}: {
  icon: React.ReactNode; label: string; value: string | number; trend?: 'up' | 'down'; trendValue?: string; className?: string;
}) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">{icon}</div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-accent-600' : 'text-red-600'}`}>
            <svg className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
