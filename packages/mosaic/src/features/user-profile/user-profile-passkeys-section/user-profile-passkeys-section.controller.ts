import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';

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
}: PasskeysControllerInput) {
  const messages = useMessages('userProfilePasskeys');
  const add = usePendingAction<'add'>({ errorFallback: messages.saveError });
  return {
    passkeys,
    isAdding: add.isPending,
    addError: add.error,
    onAdd: onAdd ? () => void add.run('add', onAdd) : undefined,
    onRename,
    validateName,
    onRemove,
  };
}
