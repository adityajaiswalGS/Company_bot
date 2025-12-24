'use client';
// src/app/admin/documents/page.js

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadForm from './components/UploadForm';
import DocumentList from './components/DocumentList';
import { useRef } from 'react';

import { useSelector } from 'react-redux';

const profile = useSelector((state) => state.auth.profile);
const companyId = profile?.company_id;
const role = profile?.role;

const PAGE_SIZE = 5;

export default function DocumentUpload() {
  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);  
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');

      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (data?.company_id) {
        setCompanyId(data.company_id);
        loadDocuments(data.company_id, 0);
      }
    };
    load();
  }, [router]);

  const loadDocuments = async (cid, start = 0) => {
    if (loading) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, file_url, created_at, status')
      .eq('company_id', cid)
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.error('Load docs error:', error);
      setHasMore(false);
    } else {
      if (start === 0) {
        setDocuments(data || []);
      } else {
        setDocuments(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
  };

  const loadMore = () => {
    if (companyId && hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
      loadDocuments(companyId, documents.length);
    }
  };

  const handleDelete = async (docId, fileUrl) => {
    if (!confirm('Delete this document permanently?')) return;

    setLoading(true);

    try {
      const path = fileUrl.split('/').slice(-2).join('/');

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      setUploadStatus({ text: 'Document deleted!', type: 'success' });
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);

      const newPage = Math.max(1, currentPage - (documents.length === PAGE_SIZE ? 0 : 1));
      setCurrentPage(newPage);
      loadDocuments(companyId, (newPage - 1) * PAGE_SIZE);

    } catch (err) {
      setUploadStatus({ text: 'Delete failed', type: 'error' });
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values, { setSubmitting, resetForm }) => {
    const { file, context, important, instructions } = values;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${companyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          company_id: companyId,
          file_name: file.name,
          storage_path: filePath,
          file_url: publicUrl,
          admin_context: context || null,
          important_points: important || null,
          custom_instructions: instructions || null,
          status: 'uploaded',
          uploaded_by: user?.id,
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      const n8nRes = await fetch('https://adityags15.app.n8n.cloud/webhook/document-process-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          fileUrl: publicUrl,
          fileName: file.name,
          companyId,
          adminContext: context || '',
          importantPoints: important || '',
          customInstructions: instructions || '',
        }),
      });

      if (!n8nRes.ok) throw new Error('AI processing failed');

      setUploadStatus({ text: 'Success! Document uploaded and processing...', type: 'success' });
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments(companyId, 0);
      setCurrentPage(1);

    } catch (err) {
      console.error(err);
      setUploadStatus({ text: 'Error: ' + err.message, type: 'error' });
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Document Management</h1>

      <UploadForm
        onSubmit={handleUpload}
        uploadStatus={uploadStatus}
        fileInputRef={fileInputRef}
      />

      <DocumentList
        documents={documents}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        onDelete={handleDelete}
      />
    </div>
  );
}