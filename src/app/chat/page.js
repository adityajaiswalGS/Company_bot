// src/app/chat/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Chip, CircularProgress, IconButton, Drawer
} from '@mui/material';
import { Send, Menu, Refresh, Logout, FolderOpen } from '@mui/icons-material';
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // ← CLOSED BY DEFAULT
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const WEBHOOK_URL = "https://adityags15.app.n8n.cloud/webhook/880ed6d9-68cb-4a36-b63b-83c110c05def";


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
      await refreshDocs(profile.company_id);
    }
  };

  const refreshDocs = async (cid) => {
    setRefreshLoading(true);
    const { data: docs } = await supabase
      .from('documents')
      .select('id, file_name, status, auto_summary')
      .eq('company_id', cid || companyId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    setDocuments(docs || []);
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

    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

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

      if (!response.ok) throw new Error('AI failed');
      const answer = await response.text();

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = answer.trim() || 'No response received.';
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

  const selectAll = () => setSelectedDocs(documents.map(d => d.id));
  const clearAll = () => setSelectedDocs([]);

  if (!companyId) return (
    <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  );

  return (
    <Box display="flex" height="100vh" bgcolor="#f1f5f9" position="relative">

      {/* TOGGLE BUTTON - CLEAN & FIXED */}
      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: 'absolute',
          left: sidebarOpen ? 350 : 16,
          top: 16,
          zIndex: 1400,
          bgcolor: 'white',
          boxShadow: 6,
          width: 56,
          height: 56,
          border: '2px solid #e0e0e0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { bgcolor: '#f8f9fa', transform: 'scale(1.08)' },
        }}
      >
        {sidebarOpen ? <FolderOpen /> : <Menu />}
      </IconButton>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 380 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 380 : 0,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#ffffff',
            boxShadow: sidebarOpen ? 8 : 0,
          },
        }}
      >
        <Box p={3} pt={10}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6" fontWeight="bold">Your Documents</Typography>
            <Box>
              <IconButton onClick={refreshDocs} disabled={refreshLoading}>
                <Refresh />
              </IconButton>
              <IconButton onClick={logout} color="error">
                <Logout />
              </IconButton>
            </Box>
          </Box>

          <Box mb={2} gap={1} display="flex">
            <Button size="small" variant="outlined" fullWidth onClick={selectAll}>Select All</Button>
            <Button size="small" variant="outlined" fullWidth onClick={clearAll}>Clear</Button>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedDocs.length} selected
          </Typography>

          <List sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            {documents.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" mt={6}>
                No documents ready
              </Typography>
            ) : (
              documents.map(doc => (
                <ListItem
                  key={doc.id}
                  secondaryAction={<Checkbox checked={selectedDocs.includes(doc.id)} onChange={() => toggleDoc(doc.id)} />}
                  sx={{ borderRadius: 2, mb: 1, bgcolor: selectedDocs.includes(doc.id) ? '#e3f2fd' : 'transparent' }}
                >
                  <ListItemIcon><Description color={selectedDocs.includes(doc.id) ? 'primary' : 'action'} /></ListItemIcon>
                  <ListItemText
                    primary={doc.file_name}
                    secondary={doc.auto_summary?.substring(0, 80) + '...'}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>

      {/* MAIN CHAT AREA */}
      <Box flex={1} display="flex" flexDirection="column" ml={sidebarOpen ? 0 : '70px'} transition="margin 0.35s">

       {/* HEADER - SHOW USER NAME */}
<Box p={3} pl={4} bgcolor="white" borderBottom={1} borderColor="divider">
  <Typography variant="h5" fontWeight="bold" color='black'>
    Hello! {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'}
  </Typography>
  <Chip 
    label={`Company ID: ${companyId.substring(0, 8)}...`} 
    size="small" 
    sx={{ mt: 1 }} 
  />
</Box>

        <Box flex={1} p={5} sx={{ overflowY: 'auto', bgcolor: '#f8fafc' }}>
          {messages.length === 0 ? (
            <Box textAlign="center" mt={12}>
              <FolderOpen sx={{ fontSize: 80, color: '#c0c0c0', mb: 3 }} />
              <Typography variant="h6" color="text.secondary">
                {sidebarOpen ? 'Select documents and ask a question' : 'Click the menu to open documents'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Your company has {documents.length} document{documents.length !== 1 ? 's' : ''} ready
              </Typography>
            </Box>
          ) : (
            messages.map((msg, i) => (
              <Box key={i} mb={4} display="flex" flexDirection={msg.role === 'user' ? 'row-reverse' : 'flex-start'}>
                <Paper
                  elevation={3}
                  sx={{
                    maxWidth: '75%',
                    p: 3,
                    borderRadius: 3,
                    bgcolor: msg.role === 'user' ? '#1976d2' : 'white',
                    color: msg.role === 'user' ? 'white' : 'black',
                  }}
                >
                  <Typography whiteSpace="pre-wrap" variant="body1" fontSize="1.05rem">
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box p={3} bgcolor="white" borderTop={1} borderColor="divider">
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={selectedDocs.length === 0 ? "Select documents first" : "Ask about your documents..."}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading || selectedDocs.length === 0}
              sx={{
                '& .MuiOutlinedInput-input::placeholder': { color: '#000 !important', opacity: 0.7 },
                '& .MuiOutlinedInput-root': { borderRadius: 3 }
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSend}
              disabled={loading || selectedDocs.length === 0 || !question.trim()}
              sx={{ px: 6, borderRadius: 3 }}
            >
              <Send />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}