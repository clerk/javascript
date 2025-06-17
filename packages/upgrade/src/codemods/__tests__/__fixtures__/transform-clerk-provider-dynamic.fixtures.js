export const fixtures = [
  {
    name: 'Basic await transform',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
    output: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider dynamic>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
  },
  {
    name: 'Does not transform if ClerkProvider is already dynamic',
    source: `
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider dynamic>
      <html>
        <body>{children}</body>
      </html>  
    </ClerkProvider>
  )
}
        `,
    output: '',
  },
];
