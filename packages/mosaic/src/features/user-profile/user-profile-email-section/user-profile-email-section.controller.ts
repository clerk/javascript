import { useRef } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useActionLock } from '../../../hooks/use-action-lock';
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
  removeReverification,
  setPrimaryReverification,
  createReverification,
}: Omit<ReadyEmailSectionModel, 'status' | 'userId'>): UserProfileEmailSectionViewProps {
  const verification = useUserProfileAddEmailController({
    username,
    onCreate: onCreateEmail,
    reverification: createReverification,
  });
  const actionLock = useActionLock();
  const setPrimary = usePendingAction({ actionLock });
  const rowRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: () => rowRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? rowRef.current,
  });
  const remove = useConfirmController<UserProfileEmail>({
    actionLock,
    onConfirm: email => removalFocus.remove(email.id),
    reverification: removeReverification,
  });

  return {
    emails,
    canAdd: Boolean(onCreateEmail),
    verification,
    error: setPrimary.error,
    isDisabled: actionLock.isPending,
    pendingPrimaryId: setPrimary.pendingKey,
    rowRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: onRemoveEmail ? remove : undefined,
    finalFocus: removalFocus.finalFocus,
    verificationFinalFocus: () => (verification.verifyingId ? removalFocus.trigger(verification.verifyingId) : null),
    setPrimaryReverification,
    setPrimaryFinalFocus: () => (setPrimary.lastKey ? removalFocus.trigger(setPrimary.lastKey) : null),
    onVerify: id => {
      const email = emails.find(email => email.id === id);
      if (email) {
        verification.onVerifyEmail(email, getEmailVerifier(id));
      }
    },
    onSetPrimary: id => void setPrimary.run(id, () => onSetPrimaryEmail(id)),
  };
}
