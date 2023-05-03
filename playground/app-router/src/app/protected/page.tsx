import { auth, ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import React from 'react';
import { ClientSideWrapper } from '@/app/protected/ClientSideWrapper';

export default function Page() {
  console.log(auth());
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
