'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function SignInPage() {
  return (
    <SignIn.Root>
      <div>
        <div>
          <h1>Sign In</h1>
        </div>
        <SignIn.Step name='start'>
          <Clerk.GlobalError />
          TODO
        </SignIn.Step>
      </div>
    </SignIn.Root>
  );
}
