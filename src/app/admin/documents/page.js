// src/app/admin/documents/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState('');
  const [important, setImportant] = useState('');
  const [instructions, setInstructions] = useState('');
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState('');
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

      if (data?.company_id) setCompanyId(data.company_id);
    };
    load();
  }, [router]);

  const handleUpload = async () => {
    if (!file || !companyId) return alert('File or company not ready');

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${companyId}/${fileName}`;

      // 1. Upload file
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Get current user ID for uploaded_by
      const { data: { user } } = await supabase.auth.getUser();

      // 4. Insert row — ONLY ADDED uploaded_by HERE
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
        .select()
        .single();

      if (dbError) throw dbError;

      // 5. Trigger n8n (your original code)
      const n8nResponse = await fetch('https://adityags15.app.n8n.cloud/webhook/document-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,  
          fileUrl: publicUrl,
          fileName: file.name,
          companyId: companyId,
          adminContext: context || '',
          importantPoints: important || '',
          customInstructions: instructions || '',
          uploaded_by: user?.id,
        }),
      });

      if (!n8nResponse.ok) throw new Error('n8n webhook failed');

      alert('Success! AI is now reading your document...');
      router.push('/admin/documents');
    } catch (err) {
      console.error(err);
      alert('Failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!companyId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Upload New Document</h1>

      <div className="bg-white rounded-2xl shadow-xl p-10 border">
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-800">Document File</label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-gray-800 w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-4 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-6 file:py-3 file:text-white hover:file:bg-indigo-700"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <textarea
            placeholder="Additional Context (optional)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="text-gray-800 p-4 border rounded-xl h-32 resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
          />
          <textarea
            placeholder="Important Points (optional)"
            value={important}
            onChange={(e) => setImportant(e.target.value)}
            className="text-gray-800 p-4 border rounded-xl h-32 resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
          />
        </div>

        <textarea
          placeholder="Custom Instructions for AI (optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="text-gray-800 w-full p-4 border rounded-xl mb-8 h-32 resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className=" text-gray-800 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl py-5 rounded-xl transition shadow-lg disabled:opacity-50"
        >
          {uploading ? 'Uploading & Processing...' : 'Upload & Let AI Read It'}
        </button>
      </div>
    </div>
  );
}