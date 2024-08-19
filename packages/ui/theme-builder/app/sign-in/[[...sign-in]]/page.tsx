'use client';
import { SignIn } from '@clerk/ui/sign-in';

export default function Page() {
  return (
    <SignIn
      appearance={{
        layout: {
          logoImageUrl: '/clerk-logo-dark-accent.svg',
        },
      }}
    />
  );
}
