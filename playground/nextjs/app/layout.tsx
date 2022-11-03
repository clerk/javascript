import React from 'react';
import { ClerkProvider } from '@clerk/nextjs/app-beta';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <title>App dir playground</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
