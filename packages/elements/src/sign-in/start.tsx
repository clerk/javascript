import { useEffect } from 'react';

import { useSignInFlow } from '../internals/machines/sign-in.context';
import { Route } from '../internals/router-react';

export function SignInStartInner({ children }: { children: React.ReactNode }) {
  const ref = useSignInFlow();

  useEffect(() => ref.send({ type: 'START' }), [ref]);

  return children;
}

export function SignInStart({ children }: { children: React.ReactNode }) {
  return (
    <Route index>
      <SignInStartInner>{children}</SignInStartInner>
    </Route>
  );
}
