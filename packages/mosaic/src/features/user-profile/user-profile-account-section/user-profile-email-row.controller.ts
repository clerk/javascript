import { usePendingAction } from '../../../hooks/use-pending-action';
import type { UserProfileEmail, UserProfileEmailVerifier } from './user-profile-account-section.types';
import type { UserProfileAddEmailController } from './user-profile-add-email.controller';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';

export interface UserProfileEmailRowControllerOptions {
  emails: UserProfileEmail[];
  username?: string;
  onCreateEmail?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
  getEmailVerifier?: (id: string) => UserProfileEmailVerifier;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void | Promise<void>;
}

export interface UserProfileEmailRowController {
  verification: UserProfileAddEmailController | undefined;
  error: string | undefined;
  onVerify: ((id: string) => void) | undefined;
  onSetPrimary: ((id: string) => void) | undefined;
}

export function useUserProfileEmailRowController({
  emails,
  username,
  onCreateEmail,
  getEmailVerifier,
  onVerifyEmail,
  onSetPrimaryEmail,
}: UserProfileEmailRowControllerOptions): UserProfileEmailRowController {
  const verification = useUserProfileAddEmailController({ username, onCreate: onCreateEmail });
  const setPrimary = usePendingAction();

  const verifyInDialog = (id: string) => {
    const email = emails.find(email => email.id === id);
    const verifier = getEmailVerifier?.(id);
    if (email && verifier) {
      verification.onVerifyEmail(email.value, verifier);
    }
  };

  return {
    verification: getEmailVerifier ? verification : undefined,
    error: setPrimary.error,
    onVerify: getEmailVerifier ? verifyInDialog : onVerifyEmail,
    onSetPrimary: onSetPrimaryEmail ? id => void setPrimary.run(id, () => onSetPrimaryEmail(id)) : undefined,
  };
}
