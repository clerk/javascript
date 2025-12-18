import { ClerkLoaded, Show, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import { ClientSideWrapper } from '@/app/protected/ClientSideWrapper';
import { header } from 'ezheaders';

export default async function Page() {
  const { userId } = await auth();
  const xClerkDebug = await header('x-clerk-debug');

  console.log('Auth run in /protected', userId, xClerkDebug);
  return (
    <div>
      <h1>Protected page</h1>
      <pre></pre>
      <Show when='signedIn'>
        <h2>Signed in</h2>
      </Show>
      <Show when='signedOut'>
        <h2>Signed out</h2>
      </Show>
      <ClerkLoaded>
        <h2>Clerk loaded</h2>
      </ClerkLoaded>
      <UserButton />

      <ClientSideWrapper>
        server content
        <Show when='signedIn'>
          <div>SignedIn</div>
        </Show>
        <ClerkLoaded>
          <div>ClerkLoaded</div>
        </ClerkLoaded>
      </ClientSideWrapper>
    </div>
  );
}
