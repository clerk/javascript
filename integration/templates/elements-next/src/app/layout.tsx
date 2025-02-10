import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clerk Elements - Next.js E2E',
  description: 'Clerk Elements - Next.js E2E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <ClerkProvider clerkJSVariant='headless'>
        <body>{children}</body>
      </ClerkProvider>
    </html>
  );
}
