'use client';

import { SignedIn } from '@clerk/clerk-react';
import { useSignInFlow, useSignInFlowSelector } from '@clerk/elements/sign-in';
import { SignOutButton } from '@clerk/nextjs';

import { Button } from './design';

function SignInActiveState() {
  const activeState = useSignInFlowSelector(state => state.value);
  const state = activeState ? (typeof activeState === 'string' ? activeState : JSON.stringify({ ...activeState })) : '';

  return (
    <div className='flex gap-4 bottom-0 w-screen justify-center'>
      <pre suppressHydrationWarning>Active State: {state}</pre>
    </div>
  );
}

export function SignInLogButtons() {
  const ref = useSignInFlow();

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

export function SignInDebug() {
  return (
    <div className='absolute text-xs flex flex-col p-4 gap-4 bottom-0 justify-center bg-secondary border-tertiary border-t w-full overflow-hidden'>
      <SignInActiveState />

      <div className='flex gap-4 bottom-0 w-screen justify-center'>
        <SignInLogButtons />
        <SignedIn>
          <SignOutButton redirectUrl='/sign-in'>
            <Button>Sign Out</Button>
          </SignOutButton>
        </SignedIn>
      </div>
    </div>
  );
}
