import { Route } from '../internals/router-react';

export function SignInFactorTwo({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-two'>
      <h1>Factor Two</h1>
      {children}
    </Route>
  );
}
