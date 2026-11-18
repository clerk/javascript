import type { Ref } from 'react';
import { useRef, useState } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import { useConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { SelectItem } from '../../../components/select';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import type { SSOBypassModel } from './sso-bypass.model';
import type { SSOBypassAddMode, SSOBypassAddResult, SSOBypassEntry } from './sso-bypass.types';

export interface SSOBypassAddValues {
  mode: SSOBypassAddMode;
  emailAddress: string;
  role: string | null;
}

const EMPTY_ADD: SSOBypassAddValues = { mode: 'email', emailAddress: '', role: null };

export type SSOBypassRow = SSOBypassEntry;

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

export const SSO_BYPASS_PAGE_SIZE = 5;

export interface SSOBypassSectionController {
  rows: SSOBypassRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  isDisabled: boolean;
  remove: ConfirmController<SSOBypassRow>;
  removeFinalFocus: () => HTMLElement | null;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  sectionRef: Ref<HTMLDivElement>;
  addButtonRef: Ref<HTMLButtonElement>;
  onAdd: () => void;
  addDialog: SSOBypassAddDialogController;
}

export function useSSOBypassSectionController(model: SSOBypassModel): SSOBypassSectionController {
  const m = useMessages('organizationProfile').security;
  const roleNames = useMessages('roles');
  const [requestedPage, setRequestedPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SSOBypassAddResult | undefined>(undefined);
  const addTrigger = useRef<HTMLButtonElement | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const totalCount = model.entries.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / SSO_BYPASS_PAGE_SIZE));
  if (requestedPage > pageCount) {
    setRequestedPage(pageCount);
  }
  const page = Math.min(requestedPage, pageCount);
  const visible = model.entries.slice((page - 1) * SSO_BYPASS_PAGE_SIZE, page * SSO_BYPASS_PAGE_SIZE);
  const removalFocus = useListRemovalFocus({
    ids: visible.map(entry => entry.userId),
    onRemove: model.remove,
    fallback: () => addTrigger.current ?? sectionRef.current,
  });
  const remove = useConfirmController<SSOBypassRow>({
    onConfirm: row => removalFocus.remove(row.userId),
    errorFallback: m.errorFallback,
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
    rows: visible,
    page,
    pageSize: SSO_BYPASS_PAGE_SIZE,
    totalCount,
    onPageChange: setRequestedPage,
    isLoading: model.isLoading,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: model.retry,
    isDisabled: remove.isPending,
    remove,
    removeFinalFocus: removalFocus.finalFocus,
    registerTrigger: removalFocus.registerTrigger,
    sectionRef,
    addButtonRef: addTrigger,
    onAdd: () => onOpenChange(true),
    addDialog: {
      open,
      onOpenChange,
      finalFocus: addTrigger,
      step: result ? 'result' : 'form',
      form,
      onModeChange: mode => {
        if (!form.isSubmitting) {
          form.reset({ ...form.values, mode });
        }
      },
      roles: model.roles.roles.map(role => {
        const label = roleNames[role.key] ?? role.name;
        return {
          value: role.key,
          label:
            role.memberCount === undefined
              ? label
              : fill(m.ssoBypass.addDialog.roleOption, { role: label, count: role.memberCount }),
        };
      }),
      isRolesLoading: model.roles.isLoading,
      isRolesError: model.roles.isError,
      result,
    },
  };
}
