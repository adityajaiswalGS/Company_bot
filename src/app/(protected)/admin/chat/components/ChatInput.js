'use client';
// src/app/chat/components/ChatInput.js

import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';

export default function ChatInput({ question, setQuestion, onSend, loading, disabled }) {
  return (
    <Box p={4} bgcolor="white" borderTop={1} borderColor="gray.200">
      <Box display="flex" gap={3} alignItems="end">
        <TextField
          fullWidth
          multiline
          maxRows={6}
          variant="outlined"
          placeholder={disabled ? "Select documents first..." : "Ask about your documents..."}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          disabled={loading || disabled}
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
          onClick={onSend}
          disabled={loading || disabled || !question.trim()}
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
  );
}