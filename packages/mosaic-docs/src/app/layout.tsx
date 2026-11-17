import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='bg-white font-sans text-neutral-950 antialiased'>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
