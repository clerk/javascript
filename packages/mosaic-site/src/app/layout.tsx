import './globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import type React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
const sans = localFont({
  src: './fonts/TimelessSansVF.woff2',
  weight: '300 800',
  variable: '--font-sans',
});
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
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans antialiased', sans.variable, mono.variable)}
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
