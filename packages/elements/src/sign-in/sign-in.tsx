'use client';

import { useClerk } from '@clerk/clerk-react';

import { SignInFlowProvider } from '../internals/machines/sign-in.context';
import type { LoadedClerkWithEnv } from '../internals/machines/sign-in.types';
import { useNextRouter } from '../internals/router';
import { Router } from '../internals/router-react';

export function SignIn({ children }: { children: React.ReactNode }): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  // TODO: Do something about `__unstable__environment` typing
  const router = useNextRouter();
  const clerk = useClerk() as unknown as LoadedClerkWithEnv;

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <SignInFlowProvider
        options={{
          input: {
            clerk,
            router,
          },
        }}
      >
        {children}
      </SignInFlowProvider>
    </Router>
  );
}
