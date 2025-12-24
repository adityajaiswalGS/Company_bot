'use client';
// src/app/admin/documents/components/UploadForm.js

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Button, Box, Typography } from '@mui/material';

const uploadSchema = z.object({
  file: z.any().refine((file) => file && file.size > 0, 'Please select a file'),
  context: z.string().max(500, 'Max 500 characters').optional(),
  important: z.string().max(500, 'Max 500 characters').optional(),
  instructions: z.string().max(500, 'Max 500 characters').optional(),
});

export default function UploadForm({ onSubmit, uploadStatus, fileInputRef }) {
  return (
    <Box className="mb-12 rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
      <Typography variant="h5" className="mb-6 font-bold text-gray-800">
        Upload New Document
      </Typography>

      <Formik
        initialValues={{ file: null, context: '', important: '', instructions: '' }}
        validationSchema={toFormikValidationSchema(uploadSchema)}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Document File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFieldValue('file', e.target.files?.[0] || null)}
                className="w-full text-gray-800 cursor-pointer rounded-lg border-2 border-gray-300 bg-gray-50 p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-6 file:py-2 file:text-white hover:file:bg-indigo-700"
              />
              <ErrorMessage name="file" component="p" className="mt-1 text-sm text-red-600" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional Context (optional, max 500 chars)
                </label>
                <Field
                  as="textarea"
                  name="context"
                  rows={3}
                  maxLength={500}
                  placeholder="Any background info..."
                  className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
                />
                <ErrorMessage name="context" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Important Points (optional, max 500 chars)
                </label>
                <Field
                  as="textarea"
                  name="important"
                  rows={3}
                  maxLength={500}
                  placeholder="Key highlights..."
                  className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
                />
                <ErrorMessage name="important" component="p" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Custom Instructions (optional, max 500 chars)
              </label>
              <Field
                as="textarea"
                name="instructions"
                rows={3}
                maxLength={500}
                placeholder="e.g., Summarize in bullet points..."
                className="w-full p-3 text-gray-800 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none"
              />
              <ErrorMessage name="instructions" component="p" className="mt-1 text-sm text-red-600" />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
              }}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </Button>
          </Form>
        )}
      </Formik>

      {uploadStatus.text && (
        <Box
          mt={4}
          p={3}
          borderRadius={2}
          textAlign="center"
          className={uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          <Typography variant="body1" fontWeight="medium">
            {uploadStatus.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
}