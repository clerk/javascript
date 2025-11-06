import type {
  CreateEmailLinkFlowReturn,
  EmailAddressResource,
  SignInResource,
  SignInStartEmailLinkFlowParams,
  SignUpResource,
  StartEmailLinkFlowParams,
} from '@clerk/shared/types';
import React from 'react';

type EmailLinkable = SignUpResource | EmailAddressResource | SignInResource;
type UseEmailLinkSignInReturn = CreateEmailLinkFlowReturn<SignInStartEmailLinkFlowParams, SignInResource>;
type UseEmailLinkSignUpReturn = CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, SignUpResource>;
type UseEmailLinkEmailAddressReturn = CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource>;

function useEmailLink(resource: SignInResource): UseEmailLinkSignInReturn;
function useEmailLink(resource: SignUpResource): UseEmailLinkSignUpReturn;
function useEmailLink(resource: EmailAddressResource): UseEmailLinkEmailAddressReturn;
function useEmailLink(
  resource: EmailLinkable,
): UseEmailLinkSignInReturn | UseEmailLinkSignUpReturn | UseEmailLinkEmailAddressReturn {
  const { startEmailLinkFlow, cancelEmailLinkFlow } = React.useMemo(() => resource.createEmailLinkFlow(), [resource]);

  React.useEffect(() => {
    return cancelEmailLinkFlow;
  }, []);

  return {
    startEmailLinkFlow,
    cancelEmailLinkFlow,
  } as UseEmailLinkSignInReturn | UseEmailLinkSignUpReturn | UseEmailLinkEmailAddressReturn;
}

export { useEmailLink };
