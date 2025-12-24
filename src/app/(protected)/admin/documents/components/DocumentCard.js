'use client';
// src/app/admin/documents/components/DocumentCard.js

import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Delete, Download, Description } from '@mui/icons-material';

export default function DocumentCard({ doc, onDelete, loading }) {
  const handleDeleteClick = () => {
    onDelete(doc.id, doc.file_url);
  };

  return (
    <Box
      className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition"
    >
      <Box className="flex items-center gap-4">
        <Description className="text-indigo-600 text-3xl" />
        <Box>
          <Typography className="font-semibold text-gray-800">
            {doc.file_name}
          </Typography>
          <Typography variant="body2" className="text-sm text-gray-500">
            {new Date(doc.created_at).toLocaleDateString()} • {doc.status}
          </Typography>
        </Box>
      </Box>

      <Box className="flex items-center gap-2">
        <Tooltip title="Download">
          <IconButton
            component="a"
            href={doc.file_url}
            target="_blank"
            color="primary"
          >
            <Download />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={handleDeleteClick}
            disabled={loading}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}