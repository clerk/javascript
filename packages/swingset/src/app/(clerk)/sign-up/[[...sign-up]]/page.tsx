'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className='mx-auto flex w-full max-w-3xl justify-center p-3 sm:p-8'>
      <SignUp
        path='/sign-up'
        signInUrl='/sign-in'
        fallbackRedirectUrl='/live/reverification'
      />
    </div>
  );
}
