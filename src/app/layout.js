// src/app/layout.js
import './globals.css';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'Company Bot',
  description: 'Multi-company AI document assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Provider store={store}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}