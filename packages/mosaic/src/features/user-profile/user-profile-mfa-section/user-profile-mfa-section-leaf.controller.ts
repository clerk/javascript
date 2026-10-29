import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

export function useUserProfileMfaSectionLeafController({
  methods,
  pendingAction,
  onAdd,
  onRemove,
  onSetDefault,
  removeReverification,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const sectionRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: methods.map(method => method.id),
    onRemove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? sectionRef.current,
  });
  const localPendingAction = usePendingAction();
  const actions = pendingAction ?? localPendingAction;
  const remove = useConfirmController<UserProfileMfaMethod>({
    onConfirm: method => removalFocus.remove(method.id),
    reverification: removeReverification,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const setDefault = (id: string) => {
    const method = methods.find(method => method.id === id);
    if (!onSetDefault || method?.type !== 'sms' || !method.canSetDefault || method.isDefault) {
      return;
    }
    void actions.run(id, () => onSetDefault(id), { errorFallback: m.setDefaultError });
  };

  return {
    sectionRef,
    isDisabled: actions.isPending,
    pickerOpen,
    onPickerOpenChange: setPickerOpen,
    addMethod: onAdd
      ? (type: UserProfileMfaAddableMethod) => {
          onAdd(type);
          setPickerOpen(false);
        }
      : undefined,
    registerTrigger: removalFocus.registerTrigger,
    openRemoval: (method: UserProfileMfaMethod) => {
      actions.reset();
      remove.open(method);
    },
    remove: onRemove ? actions.guard(remove) : undefined,
    finalRemovalFocus: removalFocus.finalFocus,
    setDefaultFinalFocus: () => (actions.lastKey ? removalFocus.trigger(actions.lastKey) : null),
    defaultError: actions.error,
    setDefault: onSetDefault ? setDefault : undefined,
  };
}
