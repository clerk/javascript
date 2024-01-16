'use client';

import { SignedIn } from '@clerk/clerk-react';
import { useSignUpFlow, useSignUpFlowSelector } from '@clerk/elements';
import { SignOutButton } from '@clerk/nextjs';

import { Button } from './design';

function SignUpActiveState() {
  const activeState = useSignUpFlowSelector(state => state.value);
  const state = activeState ? (typeof activeState === 'string' ? activeState : JSON.stringify({ ...activeState })) : '';

  return (
    <div className='flex gap-4 bottom-0 w-screen justify-center'>
      <pre suppressHydrationWarning>Active State: {state}</pre>
    </div>
  );
}

export function SignUpLogButtons() {
  const ref = useSignUpFlow();

  return (
    <>
      <Button onClick={() => console.dir(ref.getSnapshot().context.formRef.getSnapshot().context.fields)}>
        Log Fields
      </Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context)}>Log Context</Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context.currentFactor)}>Log Current Factor</Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context.clerk.__unstable__environment)}>
        Log Environment
      </Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context.resource)}>Log Resource</Button>
    </>
  );
}

export function SignUpDebug() {
  return (
    <div className='absolute text-xs flex flex-col p-4 gap-4 bottom-0 justify-center bg-secondary border-tertiary border-t  w-full overflow-hidden'>
      <SignUpActiveState />

      <div className='flex gap-4 bottom-0 w-screen justify-center'>
        <SignUpLogButtons />
        <SignedIn>
          <SignOutButton redirectUrl='/sign-up'>
            <Button>Sign Out</Button>
          </SignOutButton>
        </SignedIn>
      </div>
    </div>
  );
}
