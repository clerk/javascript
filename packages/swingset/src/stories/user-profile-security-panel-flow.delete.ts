import type { UserProfileDeleteAccountFlowState } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useRef, useState } from 'react';

import type { SecurityFlowConfig } from './user-profile-security-panel-flow.config';
import type { SecurityReverificationFlow } from './user-profile-security-panel-flow.reverification';

type DeleteFlowSliceConfig = Pick<SecurityFlowConfig, 'failurePoint' | 'latencyMs' | 'requireReverification'>;

const CONFIRMATION = 'Delete account';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDeleteFlowSlice({
  config,
  reverificationFlow,
  otherSessionsCount = 0,
  afterSignOutUrl = '/sign-in',
  afterMultiSessionSingleSignOutUrl = '/select-account',
  onSetActive,
}: {
  config: DeleteFlowSliceConfig;
  reverificationFlow: SecurityReverificationFlow;
  otherSessionsCount?: number;
  afterSignOutUrl?: string;
  afterMultiSessionSingleSignOutUrl?: string;
  onSetActive?: (result: { session: null; redirectUrl: string }) => void;
}) {
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const [deleteAccount, setDeleteAccount] = useState<UserProfileDeleteAccountFlowState | null>(null);
  const submissionPending = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const closeDeleteAccount = useCallback(() => {
    reverificationFlow.cancelReverification('delete-account');
    setDeleteAccount(null);
  }, [reverificationFlow]);

  const openDeleteAccount = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
    setDeleteAccount({ confirmation: '', isSubmitting: false, errors: {} });
  }, []);
  const updateDeleteConfirmation = useCallback((confirmation: string) => {
    setDeleteAccount(current => (current ? { ...current, confirmation, errors: {} } : current));
  }, []);
  const submitDeleteAccount = useCallback(() => {
    const current = deleteAccount;
    if (!current || current.isSubmitting || submissionPending.current || current.confirmation !== CONFIRMATION) {
      return;
    }
    submissionPending.current = true;
    setDeleteAccount(value => (value ? { ...value, isSubmitting: true, errors: {} } : value));
    void (async () => {
      try {
        await sleep(settingsRef.current.latencyMs);
        if (settingsRef.current.failurePoint === 'initial-request') {
          setDeleteAccount(value =>
            value
              ? { ...value, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
              : value,
          );
          return;
        }
        const verified = await reverificationFlow.requestReverification('delete-account');
        if (!verified) {
          setDeleteAccount(value => (value ? { ...value, isSubmitting: false } : value));
          return;
        }
        if (settingsRef.current.requireReverification) {
          await sleep(settingsRef.current.latencyMs);
          if (settingsRef.current.failurePoint === 'retried-mutation') {
            setDeleteAccount(value =>
              value
                ? { ...value, isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }
                : value,
            );
            return;
          }
        }
        const redirectUrl = otherSessionsCount === 0 ? afterSignOutUrl : afterMultiSessionSingleSignOutUrl;
        onSetActive?.({ session: null, redirectUrl });
        closeDeleteAccount();
      } finally {
        submissionPending.current = false;
      }
    })();
  }, [
    afterMultiSessionSingleSignOutUrl,
    afterSignOutUrl,
    closeDeleteAccount,
    deleteAccount,
    onSetActive,
    otherSessionsCount,
    reverificationFlow,
  ]);

  return {
    triggerRef,
    deleteAccount,
    openDeleteAccount,
    closeDeleteAccount: () => {
      if (!deleteAccount?.isSubmitting) {
        closeDeleteAccount();
      }
    },
    updateDeleteConfirmation,
    submitDeleteAccount,
  };
}
