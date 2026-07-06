'use client';

import { Message } from '@/types';
import { format, parseISO } from 'date-fns';

export default function ChatMessage({ message }: { message: Message }) {
  const isCustomer = message.sender_type === 'customer';
  const isAI = message.sender_type === 'ai';
  const isAgent = message.sender_type === 'agent';

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] ${isCustomer ? '' : 'flex flex-col items-end'}`}>
        <div className="flex items-start gap-2">
          {isCustomer && (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm shrink-0 mt-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
          {isAI && (
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-1 order-last">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
          )}
          {isAgent && (
            <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-1 order-last">
              <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
            </div>
          )}
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isCustomer ? 'bg-gray-100 text-gray-800' :
            isAI ? 'bg-primary-50 text-gray-800' :
            isAgent ? 'bg-accent-50 text-gray-800' :
            'bg-gray-100 text-gray-500 italic'
          }`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-1 ${isCustomer ? 'text-gray-400' : 'text-gray-400'}`}>
              {message.created_at ? format(parseISO(message.created_at), 'h:mm a') : ''}
              {isAI && ' • AI'}
              {isAgent && ' • Agent'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
