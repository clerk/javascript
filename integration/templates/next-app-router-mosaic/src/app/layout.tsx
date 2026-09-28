import '@clerk/mosaic/styles.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Mosaic Test App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
