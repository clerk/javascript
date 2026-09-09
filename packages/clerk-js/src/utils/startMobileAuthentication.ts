import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { MobileAuthenticationResult, MobileIdentifierParams } from '@clerk/shared/mobile';
import type { Clerk } from '../core/clerk';

/** The prebuilt identifier screen shares the same sign-in-or-up fallback on every mobile host. */
export async function startMobileAuthentication(
  clerk: Clerk,
  params: MobileIdentifierParams,
): Promise<MobileAuthenticationResult> {
  const { signIn, signUp } = clerk.__internal_getMobileResources();
  if (params.mode !== 'signUp') {
    const { error } = await signIn.create({ identifier: params.identifier });
    if (!error) return { kind: 'signIn', signIn };
    if (
      params.mode !== 'signInOrUp' ||
      !isClerkAPIResponseError(error) ||
      !error.errors.some(({ code }) => ['form_identifier_not_found', 'invitation_account_not_exists'].includes(code))
    )
      throw error;
  }
  const { error } = await signUp.create({
    [params.identifierType]: params.identifier,
    unsafeMetadata: params.unsafeMetadata,
  });
  if (error) throw error;
  return { kind: 'signUp', signUp };
}
