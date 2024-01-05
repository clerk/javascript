'use client';

import { SignedIn } from '@clerk/clerk-react';
import { useSignInFlow, useSignInFlowSelector } from '@clerk/elements';
import { SignOutButton } from '@clerk/nextjs';

export function Button(props: React.ComponentProps<'button'>) {
  return (
    <button
      className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'
      type='button'
      {...props}
    />
  );
}

function ActiveState() {
  const activeState = useSignInFlowSelector(state => state.value);

  return (
    <div className='flex gap-4 bottom-0 w-screen justify-center'>
      <pre suppressHydrationWarning>Active State: {activeState ? JSON.stringify({ ...activeState }) : ''}</pre>
    </div>
  );
}

function LogButtons() {
  const ref = useSignInFlow();

  return (
    <>
      <Button onClick={() => console.dir(ref.getSnapshot().context.form.getSnapshot().context.fields)}>
        Log Fields
      </Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context)}>Log Context</Button>
      <Button onClick={() => console.dir(ref.getSnapshot().context.clerk.__unstable__environment)}>
        Log Environment
      </Button>
    </>
  );
}

export function Debug() {
  return (
    <div className='absolute text-xs flex flex-col p-4 gap-4 bottom-0 w-screen justify-center bg-secondary border-tertiary border-t max-w-full overflow-clip'>
      <ActiveState />

      <div className='flex gap-4 bottom-0 w-screen justify-center'>
        <LogButtons />
        <SignedIn>
          <SignOutButton redirectUrl='/sign-in'>
            <Button>Sign Out</Button>
          </SignOutButton>
        </SignedIn>
      </div>
    </div>
  );
}
