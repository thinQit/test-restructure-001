import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';
import Toaster from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A simple task manager for creating, viewing, and updating tasks.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            <Toaster />
            <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

export default RootLayout;
