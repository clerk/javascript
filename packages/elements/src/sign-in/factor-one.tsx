import { Route } from '../internals/router-react';

export function SignInFactorOne({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-one'>
      <h1>Factor One</h1>
      {children}
    </Route>
  );
}
