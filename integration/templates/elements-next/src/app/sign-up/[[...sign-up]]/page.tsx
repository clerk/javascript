'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

export default function SignUpPage() {
  return (
    <SignUp.Root>
      <div>
        <div>
          <h1>Sign In</h1>
        </div>
        <SignUp.Step name='start'>
          <Clerk.GlobalError />
          TODO
        </SignUp.Step>
      </div>
    </SignUp.Root>
  );
}
