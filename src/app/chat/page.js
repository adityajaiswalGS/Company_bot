// src/app/chat/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const router = useRouter();

  // Load company + documents
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        fetchDocuments(profile.company_id);
      }
    };
    load();
  }, [router]);

  const fetchDocuments = async (cid) => {
    setFetchingDocs(true);
    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, status, auto_summary, created_at')
      .eq('company_id', cid || companyId)
      .order('created_at', { ascending: false });

    if (!error) setDocuments(data || []);
    setFetchingDocs(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedDoc) return;
    const question = input;
    setMessages(m => [...m, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        documentId: selectedDoc.id,
        companyId,
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      answer += chunk;
      setMessages(m => {
        const last = m[m.length - 1];
        if (last?.role === 'assistant') {
          last.content = answer;
          return [...m];
        } else {
          return [...m, { role: 'assistant', content: answer }];
        }
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex">
      {/* LEFT: CHAT */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-8 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">AI Chat</h1>
          <button onClick={handleLogout} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">
            Logout
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && selectedDoc && (
            <div className="text-center text-gray-600 mt-20">
              <p className="text-2xl font-medium">You are now chatting with:</p>
              <p className="text-xl font-bold text-indigo-700 mt-2">{selectedDoc.file_name}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-md ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-800 italic">AI is thinking...</div>}
        </div>

        {/* Input */}
        <div className="border-t bg-white p-6">
          <div className="flex gap-4 max-w-5xl mx-auto">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={selectedDoc ? "Ask anything about this document..." : "First select a document →"}
              disabled={!selectedDoc || loading}
              className=" text-gray-800 flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!selectedDoc || loading || !input.trim()}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: DOCUMENT PANEL */}
      <div className="w-96 bg-white shadow-2xl border-l flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Documents</h2>
          <button
            onClick={() => fetchDocuments()}
            disabled={fetchingDocs}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
          >
            {fetchingDocs ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {documents.length === 0 ? (
            <p className="text-center text-gray-800 mt-10">No documents yet</p>
          ) : (
            documents.map(doc => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setMessages([]);
                }}
                className={`p-4 mb-3 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedDoc?.id === doc.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-800 truncate">{doc.file_name}</p>
                <p className="text-xs text-gray-800 mt-1">
                  {doc.status === 'ready' ? 'Ready' : 'Processing...'}
                </p>
                {doc.auto_summary && (
                  <p className="text-xs text-gray-800 mt-2 line-clamp-2">{doc.auto_summary}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}