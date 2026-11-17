import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';
import { navigation } from '@/lib/navigation';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='bg-background text-foreground flex min-h-dvh flex-col font-sans antialiased'>
        <a
          href='#content'
          className='bg-accent text-accent-foreground absolute -start-[999px] top-0 z-[100] px-4 py-2 focus:start-0'
        >
          Skip to content
        </a>
        <SiteHeader navigation={navigation} />
        {children}
      </body>
    </html>
  );
}
