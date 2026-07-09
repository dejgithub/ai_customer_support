'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const languages = [
  { code: 'EN', name: 'English' },
  { code: 'AM', name: 'Amharic' },
  { code: 'OM', name: 'Oromo' },
];

export default function ChatInterface({
  conversationId, messages: initialMessages, onSendMessage, suggestedActions: externalSuggestedActions,
}: {
  conversationId?: string; messages: Message[]; onSendMessage: (text: string, language: string) => Promise<void>; suggestedActions?: string[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('EN');
  const [sending, setSending] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { if (externalSuggestedActions) setSuggestedActions(externalSuggestedActions); }, [externalSuggestedActions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await onSendMessage(text, language);
    } catch {
      // message will be refreshed from server
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <p>Start a conversation</p>
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}
        {sending && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-3"><LoadingSpinner size="sm" /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {suggestedActions.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100">
          {suggestedActions.map((action, i) => (
            <button key={i} onClick={() => { setInput(action); }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          {languages.map(l => (
            <button key={l.code} onClick={() => setLanguage(l.code)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${language === l.code ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l.code}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="input resize-none pr-10 py-2.5"
              style={{ minHeight: '42px' }}
            />
          </div>
          <button onClick={handleSend} disabled={!input.trim() || sending} className="btn-primary p-2.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
