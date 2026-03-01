'use client';

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export function AuthDisplay() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div>
        <UserButton />
      </div>
    );
  }

  return (
    <div>
      <SignInButton />
    </div>
  );
}
