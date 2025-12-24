'use client';

import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh, Logout, FolderOpen, Menu } from '@mui/icons-material';

const ADMIN_SIDEBAR_WIDTH = 280;
const CHAT_SIDEBAR_WIDTH = 420;

export default function ChatSidebar({
  open,
  onToggle,
  documents,
  selectedDocs,
  onToggleDoc,
  refreshLoading,
  onRefresh,
  onLogout,
}) {
  return (
    <>
      {/* TOGGLE BUTTON — POSITIONED RIGHT AFTER ADMIN SIDEBAR */}
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          left: open ? ADMIN_SIDEBAR_WIDTH + CHAT_SIDEBAR_WIDTH - 48 : ADMIN_SIDEBAR_WIDTH,  // Aligns to edge of chat sidebar
          top: 100,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 6,
          width: 56,
          height: 56,
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 3,
          transition: 'left 0.3s ease, transform 0.2s ease',
          '&:hover': {
            bgcolor: 'grey.100',
            transform: 'scale(1.05)',
          },
        }}
      >
        {open ? <FolderOpen /> : <Menu />}
      </IconButton>

      {/* CHAT SIDEBAR — SLIDES IN FROM LEFT, BUT STARTS AFTER ADMIN SIDEBAR */}
      <Drawer
        variant="persistent"
        open={open}
        anchor="left"
        sx={{
          width: open ? CHAT_SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: CHAT_SIDEBAR_WIDTH,
            left: ADMIN_SIDEBAR_WIDTH,  // ← Starts right after admin sidebar
            height: '100vh',
            bgcolor: '#1e293b',
            color: 'white',
            borderRight: 'none',
            boxShadow: open ? 8 : 0,
            transition: 'width 0.3s ease, box-shadow 0.3s ease',
          },
        }}
      >
        <Box p={4} height="100%" display="flex" flexDirection="column">
          {/* HEADER */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h5" fontWeight="bold">
              Your Documents
            </Typography>

            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={refreshLoading} color="inherit">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton onClick={onLogout} color="inherit">
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body2" color="gray.400" mb={3}>
            {selectedDocs.length} of {documents.length} selected
          </Typography>

          {/* DOCUMENT LIST */}
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
                    onClick={() => onToggleDoc(doc.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      bgcolor: selectedDocs.includes(doc.id)
                        ? 'rgba(99, 102, 241, 0.3)'
                        : 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                      },
                      transition: 'all 0.2s',
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
                      secondary={
                        doc.auto_summary
                          ? doc.auto_summary.substring(0, 80) + '...'
                          : 'No summary'
                      }
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondaryTypographyProps={{ color: 'gray.400', fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}