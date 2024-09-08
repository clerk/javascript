import './globals.css';
import '../../dist/styles.css';

import type { Metadata, Viewport } from 'next';

import { ThemeBuilder } from './theme-builder';

export const metadata: Metadata = {
  title: 'Theme Builder | Clerk.com',
  icons: {
    icon: `/assets/${['favicon', process.env.NODE_ENV === 'development' ? 'dev' : null].filter(Boolean).join('-')}.png`,
  },
  robots: 'noindex',
};

export const viewport: Viewport = {
  themeColor: '#f5f5f5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className='h-full'
    >
      <body className='flex min-h-full flex-col bg-neutral-100'>
        <ThemeBuilder>{children}</ThemeBuilder>
      </body>
    </html>
  );
}
