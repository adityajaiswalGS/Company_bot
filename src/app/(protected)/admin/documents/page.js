'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';

import UploadForm from './components/UploadForm';
import DocumentList from './components/DocumentList';
import { AuthContext } from '@/components/AuthContextProvider';

const PAGE_SIZE = 5;

export default function DocumentUpload() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const { user, profile, loading: authLoading } = useContext(AuthContext);

  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------- AUTH + INIT -------------------- */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!profile?.company_id) return;

    setCompanyId(profile.company_id);
    loadDocuments(profile.company_id, 0);
  }, [authLoading, user, profile]);

  /* -------------------- LOAD DOCUMENTS -------------------- */
  const loadDocuments = async (cid, start = 0) => {
    if (docsLoading) return;
    setDocsLoading(true);

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
      setDocuments(start === 0 ? data || [] : prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }

    setDocsLoading(false);
  };

  const loadMore = () => {
    if (companyId && hasMore && !docsLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadDocuments(companyId, documents.length);
    }
  };

  /* -------------------- DELETE DOCUMENT -------------------- */
  const handleDelete = async (docId, fileUrl) => {
    if (!confirm('Delete this document permanently?')) return;

    setDocsLoading(true);

    try {
      const path = fileUrl.split('/').slice(-2).join('/');

      await supabase.storage.from('documents').remove([path]);
      await supabase.from('documents').delete().eq('id', docId);

      setUploadStatus({ text: 'Document deleted!', type: 'success' });
      loadDocuments(companyId, 0);
      setCurrentPage(1);
    } catch (err) {
      setUploadStatus({ text: 'Delete failed', type: 'error' });
    } finally {
      setDocsLoading(false);
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 5000);
    }
  };

  /* -------------------- UPLOAD DOCUMENT -------------------- */
  const handleUpload = async (values, { setSubmitting, resetForm }) => {
    const { file, context, important, instructions } = values;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${companyId}/${fileName}`;

      await supabase.storage.from('documents').upload(filePath, file);

      const { data: { publicUrl } } =
        supabase.storage.from('documents').getPublicUrl(filePath);

      const { data: doc } = await supabase
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
          uploaded_by: user.id,
        })
        .select('id')
        .single();

      await fetch(
        'https://adityags15.app.n8n.cloud/webhook/document-process-part',
        {
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
        }
      );

      setUploadStatus({
        text: 'Success! Document uploaded and processing...',
        type: 'success',
      });

      resetForm();
      fileInputRef.current && (fileInputRef.current.value = '');
      loadDocuments(companyId, 0);
      setCurrentPage(1);
    } catch (err) {
      setUploadStatus({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
    }
  };

  /* -------------------- UI -------------------- */
  if (authLoading || !companyId) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">
        Document Management
      </h1>

      <UploadForm
        onSubmit={handleUpload}
        uploadStatus={uploadStatus}
        fileInputRef={fileInputRef}
      />

      <DocumentList
        documents={documents}
        hasMore={hasMore}
        loading={docsLoading}
        onLoadMore={loadMore}
        onDelete={handleDelete}
      />
    </div>
  );
}
