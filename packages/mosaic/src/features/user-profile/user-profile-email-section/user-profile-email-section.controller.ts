import { useRef } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import type { UserProfileEmail } from '../user-profile-contact.types';
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
  const rowRef = useRef<HTMLDivElement>(null);
  const verifyingId = useRef<string | undefined>(undefined);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: () => rowRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? rowRef.current,
  });
  const remove = useConfirmController<UserProfileEmail>({ onConfirm: email => removalFocus.remove(email.id) });

  return {
    emails,
    canAdd: Boolean(onCreateEmail),
    verification,
    error: setPrimary.error,
    rowRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: onRemoveEmail ? remove : undefined,
    finalFocus: removalFocus.finalFocus,
    verificationFinalFocus: () => {
      const id = verifyingId.current;
      verifyingId.current = undefined;
      return id ? removalFocus.trigger(id) : null;
    },
    onVerify: id => {
      verifyingId.current = id;
      const email = emails.find(email => email.id === id);
      if (email) {
        verification.onVerifyEmail(email.value, getEmailVerifier(id));
      }
    },
    onSetPrimary: id => void setPrimary.run(id, () => onSetPrimaryEmail(id)),
  };
}
