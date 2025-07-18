'use client';

import { useAuth } from '@clerk/nextjs';

export function ClientJWT() {
  const { sessionClaims } = useAuth();
  return (
    <>
      <h1>Client JWT</h1>
      <pre
        data-testid='client-jwt'
        style={{
          maxWidth: '32rem', // equivalent to max-w-lg
          textWrap: 'wrap',
          wordBreak: 'break-word',
        }}
      >
        {JSON.stringify(sessionClaims, null, 4)}
      </pre>
    </>
  );
}
