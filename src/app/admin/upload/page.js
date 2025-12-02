// src/app/admin/upload/page.js
'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function UploadDoc() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // HARDCODE YOUR COMPANY ID HERE (from your URL error)
  const HARDCODED_COMPANY_ID = "ac96e606-824f-4194-afca-8191f7e22efc";

  const handleUpload = async () => {
    if (!file) return alert('Choose a file');

    setLoading(true);

    // 1. Upload file with clean path
    const cleanCompanyId = HARDCODED_COMPANY_ID.replace(/-/g, '');
    const fileExt = file.name.split('.').pop();
    const filePath = `${cleanCompanyId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        upsert: false
      });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      console.error(uploadError);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // 2. Trigger n8n — NO MORE SUPABASE READ
    const res = await fetch('https://adityags15.app.n8n.cloud/webhook-test/document-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl: publicUrl,
        fileName: file.name,
        companyId: HARDCODED_COMPANY_ID,
      }),
    });

    if (res.ok) {
      alert('SUCCESS! File uploaded & n8n is processing. Wait 30 sec then go to /chat');
    } else {
      alert('n8n failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">Upload Document (TEST MODE)</h1>
      <p className="mb-6 text-green-600 font-bold">Company ID hardcoded — no RLS errors</p>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={e => setFile(e.target.files[0])}
        className="block w-full text-lg mb-6 p-4 border rounded-lg"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl text-xl font-bold"
      >
        {loading ? 'Uploading...' : 'Upload & Process'}
      </button>
    </div>
  );
}