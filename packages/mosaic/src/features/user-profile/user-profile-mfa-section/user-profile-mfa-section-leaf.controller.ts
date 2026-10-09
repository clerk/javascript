import { useRef, useState } from 'react';

import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { UserProfileMfaMethod } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

export function useUserProfileMfaSectionLeafController({
  methods,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const sectionRef = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: methods.map(method => method.id),
    onRemove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? sectionRef.current,
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
    closePicker: () => setPickerOpen(false),
    registerTrigger: removalFocus.registerTrigger,
    openRemoval: (open: () => void) => {
      if (defaultAction.isPending) {
        return;
      }
      defaultAction.reset();
      open();
    },
    confirmRemoval: (method: UserProfileMfaMethod) => removalFocus.remove(method.id),
    finalRemovalFocus: removalFocus.finalFocus,
    isSettingDefault: defaultAction.isPending,
    defaultError: defaultAction.error,
    setDefault,
  };
}
