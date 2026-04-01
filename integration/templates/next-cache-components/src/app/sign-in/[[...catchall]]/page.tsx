import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <main>
      <h1>Sign In</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SignIn />
      </Suspense>
    </main>
  );
}
