import type {
  CreateMagicLinkFlowReturn,
  EmailAddressResource,
  SignInResource,
  SignInStartMagicLinkFlowParams,
  SignUpResource,
  StartMagicLinkFlowParams,
} from '@clerk/types';
import { onUnmounted } from 'vue';

type MagicLinkable = SignUpResource | EmailAddressResource | SignInResource;
type UseMagicLinkSignInReturn = CreateMagicLinkFlowReturn<SignInStartMagicLinkFlowParams, SignInResource>;
type UseMagicLinkSignUpReturn = CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, SignUpResource>;
type UseMagicLinkEmailAddressReturn = CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource>;

type UseMagicLinkReturn = UseMagicLinkSignInReturn | UseMagicLinkSignUpReturn | UseMagicLinkEmailAddressReturn;

function useMagicLink(resource: SignInResource): UseMagicLinkSignInReturn;
function useMagicLink(resource: SignUpResource): UseMagicLinkSignUpReturn;
function useMagicLink(resource: EmailAddressResource): UseMagicLinkEmailAddressReturn;
function useMagicLink(resource: MagicLinkable): UseMagicLinkReturn {
  const { startMagicLinkFlow, cancelMagicLinkFlow } = resource.createMagicLinkFlow();

  onUnmounted(() => {
    cancelMagicLinkFlow();
  });

  return {
    startMagicLinkFlow,
    cancelMagicLinkFlow,
  } as UseMagicLinkReturn;
}

export { useMagicLink };
