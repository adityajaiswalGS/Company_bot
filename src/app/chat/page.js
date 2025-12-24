'use client';
// src/app/chat/page.js

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { CircularProgress} from '@mui/material';

const profile = useSelector((state) => state.auth.profile);
const companyId = profile?.company_id;

const WEBHOOK_URL = "https://adityags15.app.n8n.cloud/webhook/880ed6d9-68cb-4a36-b63b-83c110c05deg";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    loadUserAndDocs();
  }, []);

  const loadUserAndDocs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return;

    setCompanyId(profile.company_id);
    await refreshDocs(profile.company_id);
  };

  const refreshDocs = async (cid) => {
    setRefreshLoading(true);
    const { data: docs } = await supabase
      .from('documents')
      .select('id, file_name, status, auto_summary')
      .eq('company_id', cid)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    setDocuments(docs || []);
    if (docs?.length > 0) {
      setSelectedDocs(docs.map(d => d.id));
    }
    setRefreshLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!question.trim() || selectedDocs.length === 0 || loading) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: null }]);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          company_id: companyId,
          selected_doc_ids: selectedDocs,
        }),
      });

      const answer = await response.text();

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = answer.trim() || 'No response.';
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Sorry, AI is not responding right now.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  if (!companyId) {
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center" bgcolor="#f8fafc">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" bgcolor="#f8fafc">
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        documents={documents}
        selectedDocs={selectedDocs}
        onToggleDoc={toggleDoc}
        refreshLoading={refreshLoading}
        onRefresh={() => refreshDocs(companyId)}
        onLogout={logout}
      />

      <Box flex={1} display="flex" flexDirection="column">
        <ChatHeader user={user} companyId={companyId} />
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSend={handleSend}
          loading={loading}
          disabled={selectedDocs.length === 0}
        />
      </Box>
    </Box>
  );
}