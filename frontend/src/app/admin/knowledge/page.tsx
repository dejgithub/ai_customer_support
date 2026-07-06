'use client';

import { useState, useEffect } from 'react';
import { knowledge } from '@/lib/api';
import DocumentUpload from '@/components/admin/DocumentUpload';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const loadDocs = () => {
    knowledge.list().then(data => {
      setDocuments(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadDocs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await knowledge.delete(id);
      toast.success('Document deleted');
      loadDocs();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await knowledge.search(searchQuery);
      setSearchResults(res.results || []);
    } catch { toast.error('Search failed'); } finally { setSearching(false); }
  };

  const fileTypeIcons: Record<string, string> = { pdf: '📕', docx: '📘', txt: '📄', md: '📝' };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
      <p className="text-gray-500">Upload documents to train your AI with your business information.</p>

      <DocumentUpload onUploaded={loadDocs} />

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Search Knowledge Base</h3>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Ask something about your documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch} loading={searching}>Search</Button>
        </div>
        {searchResults && (
          <div className="mt-4 space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500">No results found</p>
            ) : (
              searchResults.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{r.content || r.text || JSON.stringify(r)}</div>
              ))
            )}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Chunks</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <span>{fileTypeIcons[doc.file_type] || '📄'}</span>
                    {doc.title}
                  </td>
                  <td className="px-4 py-3"><Badge variant="info">{doc.file_type}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{doc.chunk_count}</td>
                  <td className="px-4 py-3 text-gray-500">{doc.created_at ? format(parseISO(doc.created_at), 'MMM d, yyyy') : '-'}</td>
                  <td className="px-4 py-3">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
