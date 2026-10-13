import { useContactList } from '../use-contact-list';
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
  const list = useContactList({ items: emails, onSetPrimary: onSetPrimaryEmail });

  return {
    emails: list.items,
    canAdd: Boolean(onCreateEmail),
    verification,
    error: list.error,
    pendingId: list.pendingId,
    shownPendingId: list.shownPendingId,
    onVerify: id => {
      const email = emails.find(email => email.id === id);
      if (email) {
        verification.onVerifyEmail(email.value, getEmailVerifier(id));
      }
    },
    onSetPrimary: list.setPrimary,
    onRemove: onRemoveEmail,
  };
}
