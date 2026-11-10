import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';
import type React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
const heading = Geist({ subsets: ['latin'], variable: '--font-heading' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const metadata: Metadata = {
  title: 'Mosaic Components',
  description:
    'Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and replaced.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans antialiased', heading.variable, sans.variable, mono.variable)}
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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
