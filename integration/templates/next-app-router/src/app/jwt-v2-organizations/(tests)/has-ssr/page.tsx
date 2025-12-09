import { ClerkProvider } from '@clerk/nextjs';
import { SSR } from './client';

export default function Page() {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        options: {
          showOptionalFields: true,
        },
      }}
    >
      <SSR />
    </ClerkProvider>
  );
}
