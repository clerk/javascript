import { useRef, useState } from 'react';

import { useConfirmationController } from '../../../blocks/confirmation/confirmation.controller';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import { MfaCancelledError, type UserProfileMfaMethod } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

export function useUserProfileMfaSectionLeafController({
  methods,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const lastRemovalId = useRef<string>();
  const removalFocus = useListRemovalFocus({
    ids: methods.map(method => method.id),
    onRemove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? sectionRef.current,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<UserProfileMfaMethod>();
  const operation = useRef<'idle' | 'default' | 'remove'>('idle');
  const defaultAction = usePendingAction<'default'>({ errorFallback: m.setDefaultError });
  const confirmation = useConfirmationController();

  const setDefault = async (id: string) => {
    const method = methods.find(method => method.id === id);
    if (
      !onSetDefault ||
      method?.type !== 'sms' ||
      !method.canSetDefault ||
      method.isDefault ||
      operation.current !== 'idle'
    ) {
      return;
    }
    operation.current = 'default';
    try {
      await defaultAction.run('default', () => onSetDefault(id));
    } finally {
      operation.current = 'idle';
    }
  };

  const confirmRemoval = () => {
    if (!selectedMethod || !confirmation.isOpen || operation.current !== 'idle') {
      return;
    }
    const method = selectedMethod;
    operation.current = 'remove';
    confirmation.onConfirm(async () => {
      try {
        await removalFocus.remove(method.id);
      } catch (error) {
        if (!(error instanceof MfaCancelledError)) {
          throw error;
        }
      } finally {
        operation.current = 'idle';
      }
    });
  };

  return {
    sectionRef,
    pickerOpen,
    onPickerOpenChange: setPickerOpen,
    closePicker: () => setPickerOpen(false),
    selectedMethod,
    confirmation,
    onRemovalOpenChange: confirmation.onOpenChange,
    openRemoval: (method: UserProfileMfaMethod) => {
      if (operation.current === 'idle') {
        defaultAction.reset();
        lastRemovalId.current = method.id;
        setSelectedMethod(method);
        confirmation.onOpenChange(true);
      }
    },
    confirmRemoval,
    finalRemovalFocus: () =>
      removalFocus.finalFocus() ??
      (lastRemovalId.current ? triggers.current.get(lastRemovalId.current) : undefined) ??
      sectionRef.current,
    registerTrigger: (id: string) => {
      const registerRemovalTrigger = removalFocus.registerTrigger(id);
      return (element: HTMLButtonElement | null) => {
        registerRemovalTrigger(element);
        if (element) {
          triggers.current.set(id, element);
        } else {
          triggers.current.delete(id);
        }
      };
    },
    isSettingDefault: defaultAction.isPending,
    defaultError: defaultAction.error,
    setDefault,
  };
}
