import type { Metadata } from 'next';
import type React from 'react';
import { Geist } from 'next/font/google';

import { ThemeProvider } from '@/components/ThemeProvider';
import { ClientRoot } from '@/components/ClientRoot';
import { cn } from '@/lib/utils';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Swingset — Mosaic Component Explorer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}
    >
      <body className='antialiased'>
        <ThemeProvider>
          <ClientRoot>{children}</ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
