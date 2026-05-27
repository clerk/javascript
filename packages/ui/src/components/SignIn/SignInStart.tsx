import { useClerk } from '@clerk/shared/react';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useSignInContext } from '../../contexts';
import { SignInStartView } from './SignInStartView';
import { useSignInStartFlow } from './useSignInStartFlow';

function SignInStartInternal(): JSX.Element {
  const clerk = useClerk();
  const ctx = useSignInContext();
  const {
    state,
    dispatch,
    handleSignInCreate,
    viewConfig,
    identifierField,
    phoneIdentifierField,
    instantPasswordField,
    authenticateWithPasskey,
  } = useSignInStartFlow();

  return (
    <SignInStartView
      state={state}
      dispatch={dispatch}
      onSubmit={handleSignInCreate}
      config={viewConfig}
      identifierField={identifierField}
      phoneIdentifierField={phoneIdentifierField}
      instantPasswordField={instantPasswordField}
      authenticateWithPasskey={authenticateWithPasskey}
      signUpUrlWithAuth={clerk.buildUrlWithAuth(ctx.signUpUrl)}
      waitlistUrlWithAuth={clerk.buildUrlWithAuth(ctx.waitlistUrl)}
    />
  );
}

export const SignInStart = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInStartInternal)),
);
