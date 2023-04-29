import type {
  CreateMagicLinkFlowReturn,
  EmailAddressResource,
  SignInResource,
  SignInStartMagicLinkFlowParams,
  SignUpResource,
  StartMagicLinkFlowParams,
} from '@clerk/types';
import { onCleanup } from 'solid-js';

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
  const resourceActions = () => resource.createMagicLinkFlow();

  const startMagicLinkFlow = async (...args: Parameters<ReturnType<typeof resourceActions>['startMagicLinkFlow']>) => {
    const { startMagicLinkFlow } = resourceActions();
    // @ts-expect-error its fine
    return await startMagicLinkFlow(...args);
  };

  const cancelMagicLinkFlow = () => {
    const { cancelMagicLinkFlow } = resourceActions();
    return cancelMagicLinkFlow();
  };

  onCleanup(cancelMagicLinkFlow);

  return {
    startMagicLinkFlow,
    cancelMagicLinkFlow,
  } as UseMagicLinkSignInReturn | UseMagicLinkSignUpReturn | UseMagicLinkEmailAddressReturn;
}

export { useMagicLink };
