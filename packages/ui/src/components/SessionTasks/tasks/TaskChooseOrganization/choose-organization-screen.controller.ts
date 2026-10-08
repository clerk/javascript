import { useEffect, useRef, useState } from 'react';

import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type {
  ChooseOrganizationRowActionController,
  InvitationPreviewController,
  InvitationRowData,
  MembershipPreviewController,
  MembershipRowData,
} from './choose-organization-screen.types';

export const useChooseOrganizationRowAction = <T>(
  action: () => Promise<T>,
  onComplete?: (result: T) => void,
): ChooseOrganizationRowActionController => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const releaseRequest = useRef<() => void>();
  const latest = useRef({ card, action, onComplete });
  latest.current = { card, action, onComplete };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = undefined;
      releaseRequest.current?.();
      releaseRequest.current = undefined;
    };
  }, []);

  const run = () => {
    if (!mounted.current) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return Promise.resolve();
    }
    releaseRequest.current = release;
    latest.current.card.setError(undefined);
    const ownsRequest = () => mounted.current && pending.current === request;
    const request = (async () => latest.current.action())()
      .then(result => {
        if (ownsRequest()) {
          latest.current.onComplete?.(result);
        }
      })
      .catch(error => {
        if (ownsRequest()) {
          handleError(error, [], latest.current.card.setError);
        }
      })
      .finally(() => {
        if (ownsRequest()) {
          pending.current = undefined;
          releaseRequest.current = undefined;
          release();
        }
      });
    pending.current = request;
    return request;
  };

  return { run, isLoading: card.isLoading };
};

export const useMembershipPreviewController = (
  row: MembershipRowData,
  createOrganizationEnabled: boolean,
): MembershipPreviewController => {
  const card = useCardState();
  const { t } = useLocalizations();
  const { run } = useChooseOrganizationRowAction(row.activate, result => {
    if (result === 'success' || result === 'inactive') {
      return;
    }
    if (result === 'unauthorized') {
      card.setError(
        t(
          createOrganizationEnabled
            ? localizationKeys('unstable__errors.organization_not_found_or_unauthorized')
            : localizationKeys(
                'unstable__errors.organization_not_found_or_unauthorized_with_create_organization_disabled',
              ),
        ),
      );
      return;
    }
    handleError(result.error as Error, [], card.setError);
  });

  return { onClick: run };
};

export const useInvitationPreviewController = (row: InvitationRowData): InvitationPreviewController => {
  const [acceptedOrganization, setAcceptedOrganization] = useState<MembershipRowData | null>(null);
  const { run, isLoading } = useChooseOrganizationRowAction(row.accept, membership => {
    if (membership !== undefined) {
      setAcceptedOrganization(membership);
    }
  });

  return { acceptedOrganization, onAccept: run, isLoading };
};
