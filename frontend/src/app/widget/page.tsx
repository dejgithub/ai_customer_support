'use client';

import { useState } from 'react';
import ChatWidget from '@/components/widget/ChatWidget';

export default function WidgetDemoPage() {
  const [position, setPosition] = useState<'right' | 'left'>('right');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Widget Demo</h1>
          <p className="text-gray-600">Test your SmartSupport AI chat widget. Click the chat bubble to start a conversation.</p>
        </div>

        <div className="card max-w-2xl mx-auto">
          <h2 className="font-semibold text-gray-900 mb-4">Widget Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Widget Position</label>
              <div className="flex gap-3">
                <button onClick={() => setPosition('left')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${position === 'left' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>Left</button>
                <button onClick={() => setPosition('right')} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${position === 'right' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>Right</button>
              </div>
            </div>
            <div>
              <label className="label">Your Business ID</label>
              <input className="input" placeholder="demo-business-123" value="demo-business-123" readOnly />
            </div>
          </div>
        </div>

        <div className="mt-8 card">
          <h2 className="font-semibold text-gray-900 mb-2">Embed Code</h2>
          <p className="text-sm text-gray-500 mb-3">Add this script to your website:</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">
{`<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js" data-business-id="YOUR_BUSINESS_ID" data-primary-color="#2563eb" data-position="right"></script>`}
          </pre>
        </div>
      </div>

      <ChatWidget businessId="demo" title="SmartSupport AI" primaryColor="#2563eb" position={position} />
    </div>
  );
}
