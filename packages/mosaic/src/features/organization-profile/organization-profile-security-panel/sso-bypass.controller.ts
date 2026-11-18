import type { Ref } from 'react';
import { useRef, useState } from 'react';

import type { DialogFocusTarget } from '../../../components/dialog';
import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { SelectItem } from '../../../components/select';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { fill, useMessages } from '../../../localization';
import type { SSOBypassModel } from './sso-bypass.model';
import type { SSOBypassAddMode, SSOBypassAddResult, SSOBypassEntry } from './sso-bypass.types';
import { filterEntries } from './sso-bypass.utils';

export interface SSOBypassAddValues {
  mode: SSOBypassAddMode;
  emailAddress: string;
  role: string | null;
}

const EMPTY_ADD: SSOBypassAddValues = { mode: 'email', emailAddress: '', role: null };

export interface SSOBypassRow extends SSOBypassEntry {
  isPending: boolean;
}

export interface SSOBypassAddDialogController {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus: DialogFocusTarget;
  step: 'form' | 'result';
  form: UseFormResult<SSOBypassAddValues>;
  onModeChange: (mode: SSOBypassAddMode) => void;
  roles: SelectItem[];
  isRolesLoading: boolean;
  isRolesError: boolean;
  result: SSOBypassAddResult | undefined;
}

export interface SSOBypassPageController {
  rows: SSOBypassRow[];
  search: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isDisabled: boolean;
  removeError: string | undefined;
  onRemove: (userId: string) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  tableRef: Ref<HTMLDivElement>;
  addButtonRef: Ref<HTMLButtonElement>;
  onAdd: () => void;
  addDialog: SSOBypassAddDialogController;
}

export function useSSOBypassPageController(model: SSOBypassModel): SSOBypassPageController {
  const m = useMessages('organizationProfile').security;
  const roleNames = useMessages('roles');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SSOBypassAddResult | undefined>(undefined);
  const addTrigger = useRef<HTMLButtonElement | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const actions = usePendingAction({ errorFallback: m.errorFallback });
  const visible = filterEntries(model.entries, search);
  const removalFocus = useListRemovalFocus({
    ids: visible.map(entry => entry.userId),
    onRemove: model.remove,
    fallback: () => addTrigger.current ?? tableRef.current,
  });

  const form = useForm<SSOBypassAddValues, SSOBypassAddResult>({
    initialValues: EMPTY_ADD,
    errorFallback: m.errorFallback,
    canSubmit: values => (values.mode === 'email' ? values.emailAddress.trim() !== '' : values.role !== null),
    onSubmit: values =>
      values.mode === 'email' ? model.addByEmail(values.emailAddress) : model.addByRole(values.role ?? ''),
    onSuccess: added => setResult(added),
  });

  const onOpenChange = (next: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    if (next) {
      form.reset();
      setResult(undefined);
    }
    setOpen(next);
  };

  return {
    rows: visible.map(entry => ({
      ...entry,
      isPending: actions.pendingKey === entry.userId,
    })),
    search,
    onSearchChange: setSearch,
    isLoading: model.isLoading,
    isError: model.isError,
    onRetry: model.retry,
    isDisabled: actions.isPending,
    removeError: actions.error,
    onRemove: userId =>
      void actions
        .run(userId, () => removalFocus.remove(userId))
        .then(removed => {
          if (removed) {
            removalFocus.finalFocus()?.focus();
          }
        }),
    registerTrigger: removalFocus.registerTrigger,
    tableRef,
    addButtonRef: addTrigger,
    onAdd: () => onOpenChange(true),
    addDialog: {
      open,
      onOpenChange,
      finalFocus: addTrigger,
      step: result ? 'result' : 'form',
      form,
      onModeChange: mode => form.reset({ ...form.values, mode }),
      roles: model.roles.roles.map(role => {
        const label = roleNames[role.key] ?? role.name;
        return {
          value: role.key,
          label:
            role.memberCount === undefined
              ? label
              : fill(m.ssoBypassPage.addDialog.roleOption, { role: label, count: role.memberCount }),
        };
      }),
      isRolesLoading: model.roles.isLoading,
      isRolesError: model.roles.isError,
      result,
    },
  };
}
