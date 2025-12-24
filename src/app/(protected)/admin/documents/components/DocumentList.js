'use client';

import { Box, Button, Typography, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DocumentCard from './DocumentCard';

export default function DocumentList({
  documents,
  hasMore,
  loading,
  refreshLoading,
  onLoadMore,
  onDelete,
}) {
  return (
    <Box className="rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
      <Box className="mb-6 flex items-center justify-between">
        <Typography variant="h5" className="font-bold text-gray-800">
          Your Documents ({documents.length})
        </Typography>

        <Button
          variant="outlined"
          startIcon={
            refreshLoading ? <CircularProgress size={20} /> : <RefreshIcon />
          }
          onClick={onLoadMore}
          disabled={loading || refreshLoading}
        >
          Refresh
        </Button>
      </Box>

      {documents.length === 0 ? (
        <Typography className="text-center text-gray-500 py-12">
          No documents uploaded yet
        </Typography>
      ) : (
        <>
          <Box className="grid gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={onDelete}
                loading={loading}
              />
            ))}
          </Box>

          {hasMore && (
            <Box className="text-center mt-6">
              <Button
                variant="outlined"
                onClick={onLoadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Loading...' : 'Load More Documents'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
