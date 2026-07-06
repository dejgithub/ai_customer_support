'use client';

import { useState, useEffect } from 'react';
import { analytics as analyticsApi } from '@/lib/api';

export default function AIInsights() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.opportunities()
      .then(data => setOpportunities(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <h2 className="font-semibold text-gray-900">AI Insights</h2>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🧠</div>
          <p className="text-sm text-gray-500">AI is analyzing your conversations...</p>
          <p className="text-xs text-gray-400 mt-1">Check back later for insights</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg text-lg">
                {opp.type === 'revenue' ? '💰' : opp.type === 'sentiment' ? '😊' : opp.type === 'topic' ? '📊' : '💡'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{opp.title || 'AI Insight'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opp.description || 'AI-detected pattern in your conversations'}</p>
                {opp.value && <p className="text-sm font-semibold text-accent-600 mt-1">Potential value: ${opp.value}</p>}
              </div>
            </div>
          ))}
          {opportunities.length === 0 && !loading && (
            <div className="text-center py-4 text-sm text-gray-400">
              No insights available yet. As you handle conversations, AI will identify patterns and opportunities.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
