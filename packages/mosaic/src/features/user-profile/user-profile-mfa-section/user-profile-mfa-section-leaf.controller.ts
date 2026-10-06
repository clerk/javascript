import { useRef, useState } from 'react';

import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { useErrorText, useMessages } from '../../../localization';
import { toLocalizableError } from '../../../utils/errors';
import { MfaCancelledError, type UserProfileMfaMethod } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

type LeafState =
  | { kind: 'idle'; defaultError?: string }
  | { kind: 'settingDefault' }
  | { kind: 'confirmingRemoval'; method: UserProfileMfaMethod; error?: string }
  | { kind: 'removing'; method: UserProfileMfaMethod };

export function useUserProfileMfaSectionLeafController({
  methods,
  onRemove,
  onSetDefault,
}: UserProfileMfaSectionViewProps) {
  const m = useMessages('userProfileMfa');
  const errors = useMessages('errors');
  const errorText = useErrorText();
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
  const [state, setState] = useState<LeafState>({ kind: 'idle' });
  const operation = useRef<'idle' | 'default' | 'remove'>('idle');

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
    setState({ kind: 'settingDefault' });
    try {
      await onSetDefault(id);
      setState({ kind: 'idle' });
    } catch (error) {
      setState({ kind: 'idle', defaultError: errorText(toLocalizableError(error), m.setDefaultError) });
    } finally {
      operation.current = 'idle';
    }
  };

  const confirmRemoval = async () => {
    if (state.kind !== 'confirmingRemoval' || operation.current !== 'idle') {
      return;
    }
    const method = state.method;
    operation.current = 'remove';
    setState({ kind: 'removing', method });
    try {
      await removalFocus.remove(method.id);
      setState({ kind: 'idle' });
    } catch (error) {
      if (error instanceof MfaCancelledError) {
        setState({ kind: 'idle' });
      } else {
        setState({ kind: 'confirmingRemoval', method, error: errorText(toLocalizableError(error), errors.generic) });
      }
    } finally {
      operation.current = 'idle';
    }
  };

  const removal =
    state.kind === 'confirmingRemoval' || state.kind === 'removing'
      ? ({
          method: state.method,
          status: state.kind === 'removing' ? 'pending' : 'confirming',
          error: state.kind === 'confirmingRemoval' ? state.error : undefined,
        } as const)
      : undefined;

  return {
    sectionRef,
    pickerOpen,
    onPickerOpenChange: setPickerOpen,
    closePicker: () => setPickerOpen(false),
    removal,
    onRemovalOpenChange: (open: boolean) => {
      if (!open && operation.current === 'idle') {
        setState({ kind: 'idle' });
      }
    },
    openRemoval: (method: UserProfileMfaMethod) => {
      if (operation.current === 'idle') {
        lastRemovalId.current = method.id;
        setState({ kind: 'confirmingRemoval', method });
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
    isSettingDefault: state.kind === 'settingDefault',
    defaultError: state.kind === 'idle' ? state.defaultError : undefined,
    setDefault,
  };
}
