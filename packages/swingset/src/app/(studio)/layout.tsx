import '@/studio/studio.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const paperMono = localFont({
  src: '../../studio/fonts/PaperMonoVF.woff2',
  weight: '100 800',
  variable: '--font-paper-mono',
  display: 'block',
});

export const metadata: Metadata = {
  title: 'Swingset Studio',
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={`${geist.variable} ${paperMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
