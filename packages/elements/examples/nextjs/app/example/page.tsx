'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function ExamplePage() {
  return (
    <SignIn.Root exampleMode>
      <SignIn.Step name='start'>
        <h1>Sign in</h1>
        <Clerk.Field name='identifier'>
          <Clerk.Label>Email</Clerk.Label>
          <Clerk.Input />
        </Clerk.Field>

        <SignIn.Action submit>Sign in</SignIn.Action>
      </SignIn.Step>
    </SignIn.Root>
  );
}
