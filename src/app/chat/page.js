// src/app/chat/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Divider, Chip, CircularProgress, IconButton
} from '@mui/material';
import { Send, CheckBoxOutlineBlank, CheckBox, Refresh, Logout } from '@mui/icons-material';
import Description from '@mui/icons-material/Description';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const WEBHOOK_URL =
    "https://adityags15.app.n8n.cloud/webhook/b4b1e062-e52b-4299-af28-4b280d63ce0d";

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

    if (profile?.company_id) {
      setCompanyId(profile.company_id);

      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      setDocuments(docs || []);
      if (docs?.length) setSelectedDocs(docs.map(d => d.id));
    }
  };

  const refreshDocs = async () => {
    if (!companyId) return;
    setRefreshLoading(true);

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    setDocuments(docs || []);
    if (docs?.length) setSelectedDocs(docs.map(d => d.id));
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
  if (!question.trim() || !companyId || loading) return;

  const userMessage = { role: 'user', content: question, timestamp: new Date() };
  setMessages(prev => [...prev, userMessage]);
  setQuestion('');
  setLoading(true);

  const assistantMsgId = Date.now();
  setMessages(prev => [...prev, {
    id: assistantMsgId,
    role: 'assistant',
    content: '',
    streaming: true
  }]);

  try {
    const response = await fetch("https://adityags15.app.n8n.cloud/webhook/880ed6d9-68cb-4a36-b63b-83c110c05def", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.trim(),
        companyId: companyId,                    // yeh jaayega filter mein
        documentIds: selectedDocs.length > 0 ? selectedDocs : undefined
      }),
    });

    if (!response.ok || !response.body) throw new Error("AI connection failed");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      answer += chunk;

      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId ? { ...m, content: answer } : m
      ));
    }

    // Final clean
    setMessages(prev => prev.map(m =>
      m.id === assistantMsgId ? { ...m, streaming: false } : m
    ));

  } catch (err) {
    console.error(err);
    setMessages(prev => prev.map(m =>
      m.id === assistantMsgId
        ? { ...m, content: 'Sorry, AI is not available', streaming: false }
        : m
    ));
  } finally {
    setLoading(false);
  }
};

  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedDocs(documents.map(d => d.id));
  const clearAll = () => setSelectedDocs([]);

  if (!companyId) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box display="flex" height="100vh" bgcolor="#f5f5f5">

      {/* SIDEBAR */}
      <Paper elevation={3} sx={{ width: 300, p: 2, overflowY: 'auto' }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={refreshDocs} disabled={refreshLoading}>
            {refreshLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button startIcon={<Logout />} variant="outlined" color="error" size="small" onClick={logout}>
            Logout
          </Button>
        </Box>

        <Typography variant="h6" mb={2}>Your Documents ({documents.length})</Typography>

        <Button onClick={selectAll} size="small" fullWidth sx={{ mb: 1 }}>Select All</Button>
        <Button onClick={clearAll} size="small" fullWidth sx={{ mb: 2 }}>Clear All</Button>

        <List dense>
          {documents.map(doc => (
            <ListItem key={doc.id}
              secondaryAction={
                <Checkbox
                  edge="end"
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                  icon={<CheckBoxOutlineBlank />}
                  checkedIcon={<CheckBox />}
                />
              }
            >
              <ListItemIcon><Description /></ListItemIcon>
              <ListItemText
                primary={doc.file_name}
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      {doc.auto_summary?.substring(0, 100)}...
                    </Typography>
                    <Chip label={doc.status} size="small" color="success" sx={{ mt: 0.5 }} />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* MAIN CHAT */}
      <Box flex={1} display="flex" flexDirection="column">
        
        {/* HEADER FIXED */}
        <Box p={2} bgcolor="white" borderBottom={1} borderColor="divider">
          <Typography variant="h6" sx={{ color: "black", fontWeight: 600 }}>
            AI Assistant
          </Typography>

          <Chip
            label={`Company ID: ${companyId.substring(0, 10)}...`}
            size="small"
            sx={{
              color: "black",
              bgcolor: "#e0e0e0",
              fontWeight: 600
            }}
          />
        </Box>

        <Box flex={1} p={3} sx={{ overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" mt={8}>
              Select documents and ask anything!
            </Typography>
          ) : (
            messages.map((msg, i) => (
              <Box
                key={i}
                mb={3}
                display="flex"
                flexDirection={msg.role === 'user' ? 'row-reverse' : 'flex-start'}
              >
                <Paper
                  elevation={2}
                  sx={{
                    maxWidth: '80%',
                    p: 2.5,
                    bgcolor: msg.role === 'user' ? '#1976d2' : 'white',
                    color: msg.role === 'user' ? 'white' : 'black',  // FIXED
                    borderRadius: 3,
                  }}
                >
                  <Typography whiteSpace="pre-wrap" variant="body1">
                    {msg.content || '...'}
                    {msg.streaming && <span style={{ opacity: 0.7 }}> ▋</span>}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}

          {loading && (
            <Box display="flex" justifyContent="flex-start" ml={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        <Box p={2} display="flex" gap={1} bgcolor="white">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about your company's documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
          />

          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!question.trim() || loading}
            size="large"
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
