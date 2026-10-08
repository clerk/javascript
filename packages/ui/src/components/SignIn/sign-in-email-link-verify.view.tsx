import { SignInEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import type { useSignInEmailLinkVerifyController } from './sign-in-email-link-verify.controller';

export const SignInEmailLinkVerifyView = (props: ReturnType<typeof useSignInEmailLinkVerifyController>) => (
  <SignInEmailLinkFlowComplete {...props} />
);
