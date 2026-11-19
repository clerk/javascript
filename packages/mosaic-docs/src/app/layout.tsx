import './globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { SiteBanner } from '@/components/site-banner';
import { SiteHeader } from '@/components/site-header';
import { navigation } from '@/lib/navigation';
import { site } from '@/lib/site';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  weight: '100 900',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className='bg-background text-foreground flex min-h-dvh flex-col font-sans antialiased'>
        <a
          href='#content'
          className='bg-accent text-accent-foreground -inset-s-249.75 z-100 focus:inset-s-0 absolute top-0 px-4 py-2'
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute='data-theme'
          disableTransitionOnChange
        >
          <SiteBanner />
          <SiteHeader navigation={navigation} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
