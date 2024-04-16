import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <head>
          <title>Next.js 13 with Clerk</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
