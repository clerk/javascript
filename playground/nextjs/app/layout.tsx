import type { Metadata } from 'next';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Next.js 13 with Clerk',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* @ts-ignore */}
      <ClerkProvider dynamic>
        <html lang='en'>
          <body>{children}</body>
        </html>
      </ClerkProvider>
    </>
  );
}
