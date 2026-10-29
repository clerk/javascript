import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { applyOrder } from '../../../utils/apply-order';
import type { UserProfileEmail } from '../user-profile-contact.types';
import { useUserProfileAddEmailController } from './user-profile-add-email.controller';
import type { ReadyEmailSectionModel, UserProfileEmailSectionViewProps } from './user-profile-email-section.types';

export function useUserProfileEmailSectionController({
  emails: modelEmails,
  username,
  onCreateEmail,
  getEmailVerifier,
  onSetPrimaryEmail,
  onRemoveEmail,
  removeReverification,
  setPrimaryReverification,
  createReverification,
}: Omit<ReadyEmailSectionModel, 'status' | 'userId'>): UserProfileEmailSectionViewProps {
  const [order] = useState(() => modelEmails.map(email => email.id));
  const emails = applyOrder(order, modelEmails, email => email.id);
  const verification = useUserProfileAddEmailController({
    username,
    onCreate: onCreateEmail,
    reverification: createReverification,
  });
  const actions = usePendingAction();
  const rowRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: emails.map(email => email.id),
    onRemove: onRemoveEmail,
    fallback: () => rowRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? rowRef.current,
  });
  const remove = useConfirmController<UserProfileEmail>({
    onConfirm: email => removalFocus.remove(email.id),
    reverification: removeReverification,
  });

  return {
    emails: emails.map(email => ({
      ...email,
      isVerifyPending: verification.pendingVerifyId === email.id,
      isPrimaryPending: actions.pendingKey === email.id && !setPrimaryReverification.visible,
    })),
    canAdd: Boolean(onCreateEmail),
    verification,
    error: actions.error,
    isDisabled: actions.isPending,
    rowRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: onRemoveEmail ? actions.guard(remove) : undefined,
    finalFocus: removalFocus.finalFocus,
    verificationFinalFocus: () => (verification.verifyingId ? removalFocus.trigger(verification.verifyingId) : null),
    setPrimaryReverification,
    setPrimaryFinalFocus: () => (actions.lastKey ? removalFocus.trigger(actions.lastKey) : null),
    onVerify: id => {
      const email = emails.find(email => email.id === id);
      if (email) {
        verification.onVerifyEmail(email, getEmailVerifier(id));
      }
    },
    onSetPrimary: id => void actions.run(id, () => onSetPrimaryEmail(id)),
  };
}
