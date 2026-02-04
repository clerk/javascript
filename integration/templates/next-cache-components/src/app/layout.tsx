import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from 'react';

export const metadata = {
  title: 'Next.js Cache Components Test',
  description: 'Integration tests for Next.js cache components with Clerk',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ClerkProvider>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
