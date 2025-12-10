// src/app/admin/documents/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import {
  IconButton,
  Tooltip,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Delete,
  Description,
  Download,
  Refresh,
} from '@mui/icons-material';

const uploadSchema = z.object({
  file: z.any().refine((file) => file && file.size > 0, 'Please select a file'),
  context: z.string().optional(),
  important: z.string().optional(),
  instructions: z.string().optional(),
});

const PAGE_SIZE = 5;

export default function DocumentUpload() {
  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });
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
        loadDocuments(data.company_id, 0); // Load first page
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
      loadDocuments(companyId, documents.length);
    }
  };

  const showStatus = (text, type = 'success') => {
    setUploadStatus({ text, type });
    setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
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

      showStatus('Document deleted!', 'success');
      loadDocuments(companyId, 0); // Refresh from start

    } catch (err) {
      showStatus('Delete failed', 'error');
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

      const { error: dbError } = await supabase
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
        });

      if (dbError) throw dbError;

      const n8nRes = await fetch('https://adityags15.app.n8n.cloud/webhook/document-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileName: file.name,
          companyId,
          adminContext: context || '',
          importantPoints: important || '',
          customInstructions: instructions || '',
        }),
      });

      if (!n8nRes.ok) throw new Error('AI processing failed');

      showStatus('Success! Document uploaded and processing by RAG...', 'success');
      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments(companyId, 0); // Refresh list

    } catch (err) {
      console.error(err);
      showStatus('Error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex h-screen flex items-center justify-center text-2xl text-gray-600">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Document Management</h1>

      {/* UPLOAD FORM */}
      <div className="mb-12 rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Upload New Document</h2>

        
        <Formik
          initialValues={{ file: null, context: '', important: '', instructions: '' }}
          validationSchema={toFormikValidationSchema(uploadSchema)}
          onSubmit={handleUpload}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Document File <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFieldValue('file', e.target.files?.[0] || null)}
                  className="w-full text-gray-800 cursor-pointer rounded-lg border-2 border-gray-300 bg-gray-50 p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-6 file:py-2 file:text-white hover:file:bg-indigo-700"
                />
                <ErrorMessage name="file" component="p" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Additional Context (optional)</label>
                  <Field
                    as="textarea"
                    name="context"
                    rows={3}
                    placeholder="Any background info..."
                    className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Important Points (optional)</label>
                  <Field
                    as="textarea"
                    name="important"
                    rows={3}
                    placeholder="Key highlights..."
                    className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-800 text-sm font-medium text-gray-700">Custom Instructions (optional)</label>
                <Field
                  as="textarea"
                  name="instructions"
                  rows={3}
                  placeholder="e.g., Summarize in bullet points..."
                  className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r text-gray-800 from-indigo-600 to-purple-800  text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-90 transition"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Document'}
              </button>
            </Form>
          )}
        </Formik>

        {uploadStatus.text && (
          <div className={`mt-6 p-4 rounded-lg text-center text-lg font-medium ${
            uploadStatus.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {uploadStatus.text}
          </div>
        )}
      </div>

      {/* DOCUMENTS LIST WITH LOAD MORE */}
      <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Your Documents ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No documents uploaded yet</p>
        ) : (
          <>
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <Description className="text-indigo-600 text-3xl" />
                    <div>
                      <p className="font-semibold text-gray-800">{doc.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()} • {doc.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip title="Download">
                      <IconButton component="a" href={doc.file_url} target="_blank" color="primary">
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doc.id, doc.file_url)}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <Box textAlign="center" mt={6}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {loading ? 'Loading...' : 'Load More Documents'}
                </Button>
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}