'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { support } from '@/lib/api';
import ChatInterface from '@/components/chat/ChatInterface';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ConversationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);

  const load = async () => {
    try {
      const data = await support.getConversation(id);
      setConversation(data);
      setMessages(data.messages || []);
    } catch (err: any) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSendMessage = async (text: string, language: string) => {
    try {
      const res = await support.chat({ message: text, conversation_id: id, language });
      setMessages(prev => [...prev, res.message]);
      if (res.suggested_actions) {
        // show suggested actions
      }
    } catch (err: any) {
      toast.error('Failed to send message');
      throw err;
    }
  };

  const handleEscalate = async () => {
    try {
      await support.escalate(id);
      toast.success('Conversation escalated');
      load();
    } catch { toast.error('Failed to escalate'); }
  };

  const handleAssign = async (agentId: string) => {
    try {
      await support.assign(id, agentId);
      toast.success('Assigned successfully');
      setShowAssign(false);
      load();
    } catch { toast.error('Failed to assign'); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!conversation) return <div className="text-center py-20 text-gray-500">Conversation not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      <div className="flex-1 card flex flex-col p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.customer_name || 'Customer'}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant={conversation.status === 'active' ? 'success' : conversation.status === 'waiting' ? 'warning' : conversation.status === 'escalated' ? 'danger' : 'default'}>{conversation.status}</Badge>
              <span>{conversation.channel}</span>
              <span>{conversation.language}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAssign(!showAssign)}>Assign</Button>
            <Button variant="danger" size="sm" onClick={handleEscalate}>Escalate</Button>
          </div>
        </div>
        {showAssign && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <input className="input text-sm flex-1" placeholder="Agent ID..." />
            <Button size="sm" onClick={() => { const input = document.querySelector<HTMLInputElement>('[placeholder="Agent ID..."]'); if (input?.value) handleAssign(input.value); }}>Assign</Button>
          </div>
        )}
        <ChatInterface conversationId={id} messages={messages} onSendMessage={handleSendMessage} />
      </div>
      <div className="lg:w-72 card h-fit">
        <h3 className="font-semibold text-gray-900 mb-4">Conversation Info</h3>
        <div className="space-y-3 text-sm">
          <div><span className="text-gray-500">Status:</span> <Badge variant={conversation.status === 'active' ? 'success' : conversation.status === 'waiting' ? 'warning' : conversation.status === 'escalated' ? 'danger' : 'default'}>{conversation.status}</Badge></div>
          <div><span className="text-gray-500">Channel:</span> <span className="text-gray-700">{conversation.channel}</span></div>
          <div><span className="text-gray-500">Language:</span> <span className="text-gray-700">{conversation.language}</span></div>
          <div><span className="text-gray-500">Customer:</span> <span className="text-gray-700">{conversation.customer_name || 'Unknown'}</span></div>
          <div><span className="text-gray-500">Messages:</span> <span className="text-gray-700">{conversation.message_count || messages.length}</span></div>
          <div><span className="text-gray-500">Escalated:</span> <span className="text-gray-700">{conversation.is_escalated ? 'Yes' : 'No'}</span></div>
        </div>
      </div>
    </div>
  );
}
