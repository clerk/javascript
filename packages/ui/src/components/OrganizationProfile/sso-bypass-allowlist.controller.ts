import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { LocalizationKey } from '../../customizables';
import { localizationKeys } from '../../customizables';
import type { useSSOBypassAddMemberFormModel, useSSOBypassAllowlistModel } from './sso-bypass-allowlist.model';
import type {
  AddMemberProps,
  AddMode,
  AllowlistEntry,
  BulkResult,
  FormMessage,
  RoleOption,
} from './sso-bypass-allowlist.types';

const DOMAIN_NOT_SERVED = 'sso_bypass_domain_not_served';
const NOT_A_MEMBER = 'resource_not_found';

const sharedCode = (codes: string[]): string | null =>
  codes.length > 0 && codes.every(code => code === codes[0]) ? codes[0] : null;

const skippedText = (skipped: number, code: string | null): LocalizationKey => {
  const reason = code === DOMAIN_NOT_SERVED ? 'domainNotServed' : code === NOT_A_MEMBER ? 'notMember' : 'unknown';
  return skipped === 1
    ? localizationKeys(`organizationProfile.securityPage.ssoBypassPage.bulkResult.${reason}__one` as const)
    : localizationKeys(`organizationProfile.securityPage.ssoBypassPage.bulkResult.${reason}` as const, {
        count: String(skipped),
      });
};

const addedText = (result: BulkResult | null): LocalizationKey => {
  if (result?.mode === 'email') {
    return localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.addedMember');
  }
  return result?.added === 1
    ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added__one')
    : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added', {
        count: String(result?.added ?? 0),
      });
};

const matchesSearch = (entry: AllowlistEntry, term: string): boolean => {
  return entry.searchText.includes(term);
};

export const useSSOBypassAllowlistController = (model: ReturnType<typeof useSSOBypassAllowlistModel>) => {
  const card = useCardState();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const entries = useMemo(
    () => (term ? (model.data ?? []).filter(entry => matchesSearch(entry, term)) : (model.data ?? [])),
    [model.data, term],
  );
  const allowlistedUserIds = useMemo(() => new Set((model.data ?? []).map(entry => entry.userId)), [model.data]);
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const releaseRequest = useRef<() => void>();
  const latest = useRef({ model, card });
  latest.current = { model, card };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      releaseRequest.current?.();
      releaseRequest.current = undefined;
    };
  }, []);
  const handleRemove = (userId: string) => {
    const isCurrent = () => mounted.current && latest.current.model.scopeKey === model.scopeKey && model.canRun();
    if (!isCurrent() || pending.current) {
      return;
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return;
    }
    releaseRequest.current = release;
    latest.current.card.setError(undefined);
    const request = Promise.resolve()
      .then(async () => {
        if (isCurrent()) {
          await model.removeUser(userId, isCurrent);
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [], latest.current.card.setError);
        }
      })
      .finally(() => {
        release();
        if (pending.current === request) {
          pending.current = undefined;
          releaseRequest.current = undefined;
        }
      });
    pending.current = request;
  };

  return {
    scopeKey: model.scopeKey,
    canRun: model.canRun,
    search,
    searchLabel: model.searchLabel,
    onSearchChange: setSearch,
    onSearchClear: () => setSearch(''),
    term,
    entries: entries.map(entry => ({
      entry,
      isCurrentUser: model.currentUserId === entry.userId,
      isLoading: card.isLoading,
      onRemove: () => void handleRemove(entry.userId),
    })),
    allowlistedUserIds,
    addUser: model.addUser,
    addUsers: model.addUsers,
    isLoading: model.isLoading,
    errorMessage: model.errorMessage,
    cardError: card.error,
  };
};

export const useSSOBypassAddMemberScreenController = (model: AddMemberProps) => {
  const { close } = useActionContext();
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const mounted = useRef(true);
  const latest = useRef({ model, close });
  latest.current = { model, close };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () => mounted.current && latest.current.model.scopeKey === model.scopeKey && model.canRun();

  return {
    props: model,
    bulkResult,
    addedLabel: addedText(bulkResult),
    skippedLabel: bulkResult ? skippedText(bulkResult.skipped, bulkResult.skippedCode) : undefined,
    onReset: () => {
      if (canRun()) {
        latest.current.close();
      }
    },
    onResult: (result: BulkResult) => {
      if (canRun()) {
        setBulkResult(result);
      }
    },
  };
};

type FormState = { mode: AddMode; role: string; failure: FormMessage | null };
type FormEvent =
  | { type: 'mode'; mode: AddMode }
  | { type: 'role'; role: string }
  | { type: 'failure'; failure: FormMessage | null };

const formReducer = (state: FormState, event: FormEvent): FormState => {
  switch (event.type) {
    case 'mode':
      return { ...state, mode: event.mode, failure: null };
    case 'role':
      return { ...state, role: event.role };
    case 'failure':
      return { ...state, failure: event.failure };
  }
};

export const useSSOBypassAddMemberFormController = (model: ReturnType<typeof useSSOBypassAddMemberFormModel>) => {
  const card = useCardState();
  const [{ mode, role, failure }, dispatch] = useReducer(formReducer, { mode: 'email', role: '', failure: null });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const canRun = () => mounted.current && latest.current.model.scopeKey === model.scopeKey && model.canRun();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const rolesKey = JSON.stringify(model.roles?.map(item => item.value));
  useEffect(() => {
    if (mode !== 'role') {
      return;
    }
    let active = true;
    const isCurrent = () => active && mounted.current && latest.current.model.canRun();
    void latest.current.model
      .getRoleCounts(isCurrent)
      .then(counts => {
        if (counts && isCurrent()) {
          setRoleCounts(counts);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mode, rolesKey, model.scopeKey]);
  const { t } = model;
  const emailField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.emailPlaceholder'),
    isRequired: true,
  });
  const formatRoleLabel = useCallback(
    (label: string, option: RoleOption) => {
      const count = roleCounts[option.value];
      return count === undefined
        ? label
        : t(
            localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.roleOption', {
              role: label,
              count: String(count),
            }),
          );
    },
    [roleCounts, t],
  );
  const email = emailField.value.trim();
  const valid = mode === 'email' ? email !== '' : !!model.roles?.some(option => option.value === role);
  const canSubmit = !card.isLoading && valid;

  const setFailure = (message: FormMessage | null) => dispatch({ type: 'failure', failure: message });
  const addByEmail = async (isCurrent: () => boolean): Promise<BulkResult | undefined> => {
    const member = await model.findMemberByEmail(email, isCurrent);
    if (!isCurrent()) {
      return;
    }
    if (!member) {
      if (member === null) {
        return;
      }
      setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__memberNotFound'));
      return;
    }
    const userId = member.userId;
    if (!userId) {
      setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__memberNotFound'));
      return;
    }
    if (model.allowlistedUserIds.has(userId)) {
      setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__alreadyAdded'));
      return;
    }
    const added = await model.addUser({ userId }, isCurrent);
    if (!added || !isCurrent()) {
      return;
    }
    return { mode: 'email', added: 1, skipped: 0, skippedCode: null };
  };
  const addByRole = async (isCurrent: () => boolean): Promise<BulkResult | undefined> => {
    const collectedUserIds = await model.collectUserIdsByRole(role, isCurrent);
    if (!collectedUserIds || !isCurrent()) {
      return;
    }
    const userIds = collectedUserIds.filter(userId => !model.allowlistedUserIds.has(userId));
    if (userIds.length === 0) {
      setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__allAlreadyAdded'));
      return;
    }
    const result = await model.addUsers({ userIds }, isCurrent);
    if (!result || !isCurrent()) {
      return;
    }
    const added = result.added;
    const skipped = result?.errors ?? [];
    const skippedCode = sharedCode(skipped.map(error => error.code));
    if (added === 0) {
      setFailure(skippedText(skipped.length, skippedCode));
      return;
    }
    return { mode: 'role', added, skipped: skipped.length, skippedCode };
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRun() || !valid) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const isCurrent = () => canRun() && pending.current === request;
    setFailure(null);
    const request = Promise.resolve()
      .then(() => {
        if (isCurrent()) {
          return mode === 'email' ? addByEmail(isCurrent) : addByRole(isCurrent);
        }
        return;
      })
      .then(result => {
        if (result && isCurrent()) {
          latest.current.model.onResult(result);
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [emailField], error => setFailure(latest.current.model.translateError(error)));
        }
      })
      .finally(() => {
        if (pending.current === request) {
          pending.current = undefined;
        }
      });
    pending.current = request;
    return request;
  };

  return {
    mode,
    role,
    failure,
    roles: model.roles,
    emailField,
    formatRoleLabel,
    canSubmit,
    isLoading: card.isLoading,
    modeLabel: model.t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.modeLabel')),
    onChangeMode: (next: AddMode) => {
      if (canRun() && !pending.current) {
        dispatch({ type: 'mode', mode: next });
      }
    },
    onChangeRole: (next: string) => {
      if (canRun() && !pending.current) {
        dispatch({ type: 'role', role: next });
      }
    },
    onSubmit,
    onReset: () => {
      if (canRun() && !pending.current) {
        latest.current.model.onReset();
      }
    },
  };
};
