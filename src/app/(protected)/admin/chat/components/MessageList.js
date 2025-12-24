'use client';
// src/app/chat/components/MessageList.js

import { Box, Paper, Typography, Avatar, CircularProgress } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

export default function MessageList({ messages }) {
  return (
    <Box flex={1} p={6} overflow="auto" bgcolor="#f8fafc">
      {messages.length === 0 ? (
        <Box textAlign="center" mt={16}>
          <SmartToy sx={{ fontSize: 100, color: '#e0e0e0', mb: 4 }} />
          <Typography variant="h5" color="black" fontWeight="bold" gutterBottom>
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
    </Box>
  );
}