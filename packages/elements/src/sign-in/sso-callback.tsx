import { useSSOCallbackHandler } from '../internals/machines/sign-in.context';
import { Route } from '../internals/router-react';

export function SignInSSOCallbackInner() {
  useSSOCallbackHandler();
  return null;
}

export function SignInSSOCallback() {
  return (
    <Route path='sso-callback'>
      <SignInSSOCallbackInner />
      Loading...
    </Route>
  );
}
