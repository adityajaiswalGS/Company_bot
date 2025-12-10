'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Chip, CircularProgress, IconButton, Drawer, Avatar, Tooltip
} from '@mui/material';
import { Send, Menu, Refresh, Logout, FolderOpen, SmartToy } from '@mui/icons-material';
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
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const WEBHOOK_URL = "https://adityags15.app.n8n.cloud/webhook/880ed6d9-68cb-4a36-b63b-83c110c05def";

  useEffect(() => {
    loadUserAndDocs();
  }, []);

  useEffect(() => {
  if (companyId) {
    refreshDocs();
  }
}, [companyId]);

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
    await refreshDocs(); // ← THIS LOADS DOCUMENTS ON LOGIN
  };

  const refreshDocs = async () => {
    if (!companyId) return;
    setRefreshLoading(true);

    const { data: docs } = await supabase
      .from('documents')
      .select('id, file_name, status, auto_summary')
      .eq('company_id', companyId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    setDocuments(docs || []);
    if (docs?.length > 0) {
      setSelectedDocs(docs.map(d => d.id)); // Auto-select all
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
        <CircularProgress size={60} thickness="4" />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" bgcolor="#f8fafc">

      {/* TOGGLE BUTTON — MOVED TO TOP-LEFT, NO OVERLAP */}
      <IconButton
  onClick={() => setSidebarOpen(!sidebarOpen)}
  sx={{
    position: 'absolute',
    left: sidebarOpen ? 420 : 16,
    top: 100,   // ⬅️ moved down so it does NOT overlap header/logo
    zIndex: 1400,
    bgcolor: 'white',
    boxShadow: 6,
    width: 56,
    height: 56,
    border: '2px solid #e0e0e0',
    transition: 'all 0.3s ease',
    '&:hover': { bgcolor: '#f8f9fa', transform: 'scale(1.08)' },
  }}
>
  {sidebarOpen ? <FolderOpen /> : <Menu />}
</IconButton>


      {/* SIDEBAR */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 420 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 420,
            bgcolor: '#1e293b',
            color: 'white',
            borderRight: 'none',
            transition: 'width 0.3s ease',
          },
        }}
      >
        <Box p={4} height="100%" display="flex" flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb= {4}>
            <Typography variant="h5" fontWeight="bold">
              Documents
            </Typography>
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={refreshDocs} disabled={refreshLoading} color="inherit">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton onClick={logout} color="inherit">
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body2" color="gray.400" mb={3}>
            {selectedDocs.length} of {documents.length} selected
          </Typography>

          <Box flex={1} overflow="auto" pr={1}>
            {documents.length === 0 ? (
              <Typography textAlign="center" color="gray.500" mt={8}>
                No documents ready
              </Typography>
            ) : (
              <List>
                {documents.map((doc) => (
                  <ListItem
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      bgcolor: selectedDocs.includes(doc.id) ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedDocs.includes(doc.id)}
                        tabIndex={-1}
                        disableRipple
                        sx={{ color: 'white' }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.file_name}
                      secondary={doc.auto_summary?.substring(0, 60) + '...' || 'No summary'}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondaryTypographyProps={ { color: 'gray.400' } }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* MAIN CHAT */}
      <Box flex={1} display="flex" flexDirection="column">

        {/* HEADER */}
        <Box
          p={4}
          bgcolor="white"
          borderBottom={1}
          borderColor="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={3}>
            <SmartToy sx={{ fontSize: 40, color: '#6366f1' }} />
            <div>
              <Typography variant="h5" fontWeight="bold" className="text-gray-800">
                Company AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.user_metadata?.full_name || user?.email}
              </Typography>
            </div>
          </Box>

          <Chip
            label={`Company: ${companyId.substring(0, 8)}...`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* MESSAGES */}
        <Box flex={1} p={6} overflow="auto" bgcolor="#f8fafc">
          {messages.length === 0 ? (
            <Box textAlign="center" mt={16}>
              <SmartToy sx={{ fontSize: 100, color: '#e0e0e0', mb: 4 }} />
              <Typography variant="h5" className="text-gray-800" fontWeight="bold" gutterBottom>
                How can I help you today?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Click the menu button to open documents and start chatting!
              </Typography>
            </Box>
          ) : (
            messages.map((msg, i) => (
              <Box
                key={i}
                mb={6}
                display="flex"
                flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
                gap={3}
              >
                <Avatar sx={{ bgcolor: msg.role === 'user' ? '#6366f1' : '#10b981' }}>
                  {msg.role === 'user' ? 'U' : <SmartToy />}
                </Avatar>

                <Paper
                  elevation={3}
                  sx={{
                    maxWidth: '70%',
                    p: 4,
                    borderRadius: 3,
                    bgcolor: msg.role === 'user' ? '#6366f1' : 'white',
                    color: msg.role === 'user' ? 'white' : 'black',
                  }}
                >
                  {msg.content === null ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Typography whiteSpace="pre-wrap" variant="body1" fontSize="1.1rem" lineHeight={1.7}>
                      {msg.content}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* INPUT */}
        <Box p={4} bgcolor="white" borderTop={1} borderColor="gray.200">
          <Box display="flex" gap={3} alignItems="end">
            <TextField
              fullWidth
              multiline
              maxRows={6}
              variant="outlined"
              placeholder={selectedDocs.length === 0 ? "Select documents first..." : "Ask about your documents..."}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading || selectedDocs.length === 0}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f9fafb',
                  '& fieldset': { borderColor: '#e5e7eb' },
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSend}
              disabled={loading || selectedDocs.length === 0 || !question.trim()}
              sx={{
                px: 6,
                py: 3,
                borderRadius: 3,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}