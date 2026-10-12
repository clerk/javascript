import { useRef } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { UserProfilePasskeysSectionViewProps } from '../user-profile-passkeys-section.view';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';
import type { UserProfilePasskey } from './user-profile-passkeys-section.types';

type PasskeysControllerInput = Pick<
  Extract<UserProfilePasskeysModel, { status: 'ready' }>,
  'passkeys' | 'onAdd' | 'onRename' | 'validateName' | 'onRemove'
>;

export function useUserProfilePasskeysSectionController({
  passkeys,
  onAdd,
  onRename,
  validateName,
  onRemove,
}: PasskeysControllerInput): UserProfilePasskeysSectionViewProps {
  const messages = useMessages('userProfilePasskeys');
  const add = usePendingAction<'add'>({ errorFallback: messages.saveError });
  const sectionRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: passkeys.map(passkey => passkey.id),
    onRemove,
    fallback: () => addButtonRef.current ?? sectionRef.current,
  });
  const remove = useConfirmController<UserProfilePasskey>({ onConfirm: passkey => removalFocus.remove(passkey.id) });

  return {
    passkeys,
    sectionRef,
    addButtonRef,
    isAdding: add.isPending,
    addError: add.error,
    onAdd: onAdd ? () => void add.run('add', onAdd) : undefined,
    onRename,
    validateName,
    registerTrigger: removalFocus.registerTrigger,
    remove,
    finalFocus: removalFocus.finalFocus,
  };
}
