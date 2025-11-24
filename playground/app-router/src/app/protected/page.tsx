import { ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
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
      <SignedIn>
        <h2>Signed in</h2>
      </SignedIn>
      <SignedOut>
        <h2>Signed out</h2>
      </SignedOut>
      <ClerkLoaded>
        <h2>Clerk loaded</h2>
      </ClerkLoaded>
      <UserButton />

      <ClientSideWrapper>
        server content
        <SignedIn>
          <div>SignedIn</div>
        </SignedIn>
        <ClerkLoaded>
          <div>ClerkLoaded</div>
        </ClerkLoaded>
      </ClientSideWrapper>
    </div>
  );
}
