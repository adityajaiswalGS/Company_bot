// src/app/layout.js
import './globals.css';
import { AuthContextProvider } from '@/components/AuthContextProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}