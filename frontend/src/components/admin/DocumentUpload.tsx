'use client';

import { useState, useRef } from 'react';
import { knowledge } from '@/lib/api';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function DocumentUpload({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
      toast.error('Supported formats: PDF, DOCX, TXT, MD');
      return;
    }
    setFileName(file.name);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await knowledge.upload(formData);
      toast.success('Document uploaded successfully');
      setFileName('');
      onUploaded();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        {uploading ? (
          <div>
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Uploading {fileName}...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">Drop your document here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports PDF, DOCX, TXT, MD — up to 50MB</p>
          </>
        )}
      </div>
      {fileName && !uploading && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 rounded-xl">
          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm text-gray-700">{fileName}</span>
        </div>
      )}
    </div>
  );
}
