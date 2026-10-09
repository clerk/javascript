import { usePendingAction } from '../../../hooks/use-pending-action';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import type { ReadyEmailSectionModel, UserProfileEmailSectionViewProps } from './user-profile-email-section.types';

export function useUserProfileEmailSectionController({
  emails,
  username,
  onCreateEmail,
  getEmailVerifier,
  onSetPrimaryEmail,
  onRemoveEmail,
}: Omit<ReadyEmailSectionModel, 'status' | 'userId'>): UserProfileEmailSectionViewProps {
  const verification = useUserProfileAddEmailController({ username, onCreate: onCreateEmail });
  const setPrimary = usePendingAction();

  return {
    emails,
    canAdd: Boolean(onCreateEmail),
    verification,
    error: setPrimary.error,
    onVerify: id => {
      const email = emails.find(email => email.id === id);
      if (email) {
        verification.onVerifyEmail(email.value, getEmailVerifier(id));
      }
    },
    onSetPrimary: id => void setPrimary.run(id, () => onSetPrimaryEmail(id)),
    onRemove: onRemoveEmail,
  };
}
