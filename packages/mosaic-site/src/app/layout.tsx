import './globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import type React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
const mono = localFont({
  src: './fonts/PaperMono-VF.woff2',
  weight: '100 800',
  variable: '--font-mono',
});
export const metadata: Metadata = {
  metadataBase: new URL('https://mosaic.clerk.com'),
  title: 'Clerk UI',
  description:
    'Sign-in, profiles, consent, and agent experiences. Composable components you can rearrange, restyle, and replace.',
  ...(process.env.MOSAIC_BRAND === '1' && { robots: { index: false, follow: false } }),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans antialiased', mono.variable)}
    >
      <head>
        <link
          rel='preload'
          href='/fonts/timeless-sans.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        {process.env.NODE_ENV === 'development' && (
          <Script
            src='https://unpkg.com/react-grab@0.2.0/dist/index.global.js'
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
