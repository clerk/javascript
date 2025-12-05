import { ClerkProvider } from '@clerk/nextjs';
import { SSR } from './client';

export default function Page() {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        layout: {
          showOptionalFields: true,
        },
      }}
    >
      <SSR />
    </ClerkProvider>
  );
}
