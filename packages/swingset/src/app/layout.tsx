import './globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import type React from 'react';

import { ClientRoot } from '@/components/ClientRoot';
import { ThemeProvider } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

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
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src='//unpkg.com/react-grab/dist/index.global.js'
            crossOrigin='anonymous'
            strategy='beforeInteractive'
          />
        )}
      </head>
      <body className='antialiased'>
        <ThemeProvider>
          <ClientRoot>{children}</ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
