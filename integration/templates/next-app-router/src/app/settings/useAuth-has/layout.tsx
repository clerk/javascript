import { ClerkProvider } from '@clerk/nextjs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        layout: {
          showOptionalFields: true,
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
