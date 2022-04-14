import {
  CreateMagicLinkFlowReturn,
  EmailAddressResource,
  SignInResource,
  SignInStartMagicLinkFlowParams,
  SignUpResource,
  StartMagicLinkFlowParams,
} from '@clerk/types';
import React from 'react';

type MagicLinkable = SignUpResource | EmailAddressResource | SignInResource;
type UseMagicLinkSignInReturn = CreateMagicLinkFlowReturn<SignInStartMagicLinkFlowParams, SignInResource>;
type UseMagicLinkSignUpReturn = CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, SignUpResource>;
type UseMagicLinkEmailAddressReturn = CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource>;

function useMagicLink(resource: SignInResource): UseMagicLinkSignInReturn;
function useMagicLink(resource: SignUpResource): UseMagicLinkSignUpReturn;
function useMagicLink(resource: EmailAddressResource): UseMagicLinkEmailAddressReturn;
function useMagicLink(
  resource: MagicLinkable,
): UseMagicLinkSignInReturn | UseMagicLinkSignUpReturn | UseMagicLinkEmailAddressReturn {
  const { startMagicLinkFlow, cancelMagicLinkFlow } = React.useMemo(() => resource.createMagicLinkFlow(), [resource]);

  React.useEffect(() => {
    return cancelMagicLinkFlow;
  }, []);

  return {
    startMagicLinkFlow,
    cancelMagicLinkFlow,
  } as UseMagicLinkSignInReturn | UseMagicLinkSignUpReturn | UseMagicLinkEmailAddressReturn;
}

export { useMagicLink };
