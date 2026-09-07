'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='mx-auto flex w-full max-w-3xl justify-center p-3 sm:p-8'>
      <SignIn
        path='/sign-in'
        signUpUrl='/sign-up'
        fallbackRedirectUrl='/live/reverification'
      />
    </div>
  );
}
