import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ui } from '@clerk/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bundled UI Test App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      ui={ui}
      appearance={{
        options: {
          showOptionalFields: true,
          socialButtonsVariant: 'blockButton',
        },
      }}
    >
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
