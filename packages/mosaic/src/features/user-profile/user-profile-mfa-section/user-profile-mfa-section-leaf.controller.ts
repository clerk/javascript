import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { UserProfileMfaAddableMethod, UserProfileMfaMethod } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

export function useUserProfileMfaSectionLeafController({
  methods,
  onAdd,
  onRemove,
  onSetDefault,
  reverification,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const sectionRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: methods.map(method => method.id),
    onRemove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? sectionRef.current,
  });
  const remove = useConfirmController<UserProfileMfaMethod>({
    onConfirm: method => removalFocus.remove(method.id),
    reverification,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const defaultAction = usePendingAction<'default'>({ errorFallback: m.setDefaultError });

  const setDefault = (id: string) => {
    const method = methods.find(method => method.id === id);
    if (!onSetDefault || method?.type !== 'sms' || !method.canSetDefault || method.isDefault) {
      return;
    }
    void defaultAction.run('default', () => onSetDefault(id));
  };

  return {
    sectionRef,
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
      if (defaultAction.isPending) {
        return;
      }
      defaultAction.reset();
      remove.open(method);
    },
    remove,
    finalRemovalFocus: removalFocus.finalFocus,
    defaultError: defaultAction.error,
    setDefault: onSetDefault && !defaultAction.isPending ? setDefault : undefined,
  };
}
