import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { MobileAuthenticationResult, MobileSSOParams } from '@clerk/shared/mobile';

import type { Clerk } from '../core/clerk';
import { SignIn, SignUp } from '../core/resources/internal';
import { getNativeAppleIdentity } from './nativeAppleIdentity';

export async function authenticateWithMobileSSO(
  clerk: Clerk,
  params: MobileSSOParams,
): Promise<MobileAuthenticationResult> {
  if (!(clerk.client?.signIn instanceof SignIn) || !(clerk.client.signUp instanceof SignUp))
    throw new ClerkRuntimeError('Clerk is not loaded.', { code: 'clerk_not_loaded' });
  const signInResource: SignIn = clerk.client.signIn;
  const signUpResource: SignUp = clerk.client.signUp;
  const signIn = signInResource.__internal_future;
  const signUp = signUpResource.__internal_future;
  const { start, transferable, ...ssoParams } = params;
  const apple = params.strategy === 'oauth_token_apple';
  const identity = apple ? await getNativeAppleIdentity(clerk) : undefined;
  const routes = { redirectUrl: '', redirectCallbackUrl: '' };
  const signInResult = (): MobileAuthenticationResult => {
    if (signIn.firstFactorVerification.error) throw signIn.firstFactorVerification.error;
    return { kind: 'signIn', signIn };
  };
  const finishSignIn = async (): Promise<MobileAuthenticationResult> => {
    if (transferable && signIn.isTransferable) {
      const { error } = await signUp.create({
        transfer: true,
        unsafeMetadata: params.unsafeMetadata,
        legalAccepted: params.legalAccepted,
        locale: params.locale,
        firstName: params.firstName ?? identity?.firstName,
        lastName: params.lastName ?? identity?.lastName,
      });
      if (error) throw error;
      return { kind: 'signUp', signUp };
    }
    return signInResult();
  };
  if (start === 'signUp' || (start === 'auto' && apple && transferable)) {
    const { error } = await signUp.sso({ ...ssoParams, ...routes, emailAddress: params.identifier }, identity);
    if (error) {
      const restricted =
        isClerkAPIResponseError(error) &&
        error.errors.some(({ code }) => ['sign_up_mode_restricted', 'sign_up_restricted_waitlist'].includes(code));
      if (!(start === 'auto' && apple && restricted)) throw error;
      const fallback = await signIn.sso({ ...ssoParams, ...routes }, identity);
      if (fallback.error) throw fallback.error;
      if (signIn.isTransferable) throw error;
      return signInResult();
    }
    if (signUp.isTransferable) {
      const { error } = await signIn.create({ transfer: true });
      if (error) throw error;
      return signInResult();
    }
    return { kind: 'signUp', signUp };
  }
  const { error } = await signIn.sso({ ...ssoParams, ...routes }, identity);
  if (error) throw error;
  return finishSignIn();
}
