import { ClerkProvider } from '@clerk/nextjs/app-beta';
export default function Layout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <title>App dir playground</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
