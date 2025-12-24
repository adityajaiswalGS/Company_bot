'use client';
// src/app/admin/dashboard/components/CreateUserForm.js

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { Box, Button, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const UserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be 6+ chars').required('Password is required'),
  fullName: Yup.string()
    .min(2, 'Too short')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces') 
    .required('Full name is required'),
});

export default function CreateUserForm({ onSubmit, isSubmitting }) {
  return (
    <Box
      component="section"
      bgcolor="white"
      borderRadius={4}
      boxShadow={6}
      p={6}
      mb={10}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={6}>
        <PersonAddIcon sx={{ fontSize: 32, color: '#6366f1' }} />
        <Typography variant="h5" fontWeight="bold" color="black">
          Add New User
        </Typography>
      </Box>

      {/* Form */}
      <Formik
        initialValues={{
          email: '',
          password: '',
          fullName: '',
        }}
        validationSchema={UserSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Email */}
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                />
                <ErrorMessage name="email">
                  {(msg) => (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {msg}
                    </p>
                  )}
                </ErrorMessage>
              </div>

              {/* Password */}
              <div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Password (min 6 chars)"
                  className="w-full rounded-xl text-gray-800 border-2 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                />
                <ErrorMessage name="password">
                  {(msg) => (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {msg}
                    </p>
                  )}
                </ErrorMessage>
              </div>

              {/* Full Name */}
              <div>
                <Field
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                />
                <ErrorMessage name="fullName">
                  {(msg) => (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {msg}
                    </p>
                  )}
                </ErrorMessage>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              size="large"
              sx={{
                px: 8,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                '&:disabled': { bgcolor: '#9ca3af' },
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
