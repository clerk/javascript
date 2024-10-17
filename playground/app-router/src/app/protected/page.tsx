import { useAuth, ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import React from 'react';
import { ClientSideWrapper } from '@/app/protected/ClientSideWrapper';
import { headers } from 'next/headers';

export default async function Page() {
  const { userId } = useAuth();
  const resolvedHeaders = await headers().get('x-clerk-debug');

  console.log('Auth run in /protected', userId, resolvedHeaders.get('x-clerk-debug'), resolvedHeaders.keys());
  // console.log(auth());
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
      <UserButton afterSignOutUrl='/' />

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
