import { ClerkLoaded, ClerkLoading } from '@clerk/astro/react';

export function Visibility() {
  return (
    <>
      <ClerkLoading>
        <div>Loading...</div>
      </ClerkLoading>
      <ClerkLoaded>
        <div>Clerk is loaded</div>
      </ClerkLoaded>
    </>
  );
}
