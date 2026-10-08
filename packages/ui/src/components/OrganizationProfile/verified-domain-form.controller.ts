import type { OrganizationEnrollmentMode } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { VerifiedDomainFormData, VerifiedDomainFormModel } from './verified-domain-form.types';

const buildEnrollmentOptions = (modes: OrganizationEnrollmentMode[]) => {
  const options: Array<{ value: OrganizationEnrollmentMode; label: LocalizationKey; description: LocalizationKey }> =
    [];
  if (modes.includes('manual_invitation')) {
    options.push({
      value: 'manual_invitation',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__description',
      ),
    });
  }
  if (modes.includes('automatic_invitation')) {
    options.push({
      value: 'automatic_invitation',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__description',
      ),
    });
  }
  if (modes.includes('automatic_suggestion')) {
    options.push({
      value: 'automatic_suggestion',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__description',
      ),
    });
  }
  return options;
};

export const useVerifiedDomainFormController = (
  model: VerifiedDomainFormModel,
  onSuccess: () => void,
  mode: 'select' | 'edit',
): VerifiedDomainFormData => {
  const card = useCardState();
  const current = useRef({ scope: model.scope, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.scope !== model.scope) {
    current.current = { scope: model.scope, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ model, onSuccess, card });
  latest.current = { model, onSuccess, card };
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => isMounted.current && current.current === owner && latest.current.model.canRun();
  const enrollmentMode = useFormControl('enrollmentMode', '', {
    type: 'radio',
    radioOptions: buildEnrollmentOptions(model.enrollmentModes),
    isRequired: true,
  });
  const deletePending = useFormControl('deleteExistingInvitationsSuggestions', '', {
    label: localizationKeys('formFieldLabel__organizationDomainDeletePending'),
    type: 'checkbox',
  });

  const initializedDomain = useRef<string>();
  const domainId = model.domain?.id;
  const persistedMode = model.domain?.enrollmentMode;
  const setEnrollmentMode = enrollmentMode.setValue;
  useEffect(() => {
    if (domainId && persistedMode && initializedDomain.current !== domainId) {
      initializedDomain.current = domainId;
      setEnrollmentMode(persistedMode);
    }
  }, [domainId, persistedMode, setEnrollmentMode]);

  const totalInvitations = model.domain?.totalPendingInvitations || 0;
  const totalSuggestions = model.domain?.totalPendingSuggestions || 0;
  const calloutLabels =
    totalInvitations + totalSuggestions === 0
      ? []
      : [
          localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.calloutInfoLabel'),
          localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.calloutInvitationCountLabel', {
            count: totalInvitations,
          }),
          localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.calloutSuggestionCountLabel', {
            count: totalSuggestions,
          }),
        ];

  const updateEnrollmentMode = (): Promise<void> => {
    if (!canRun() || model.isLoading || model.errorMessage || !model.domain) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const generation = owner.generation;
    const isCurrent = () => canRun() && owner.generation === generation;
    const selectedMode = enrollmentMode.value as OrganizationEnrollmentMode;
    const shouldDeletePending = deletePending.checked;
    card.setError(undefined);
    enrollmentMode.clearFeedback();
    const pending = Promise.resolve()
      .then(() => {
        return isCurrent()
          ? latest.current.model.updateEnrollmentMode(selectedMode, shouldDeletePending, isCurrent)
          : false;
      })
      .then(updated => {
        if (updated && isCurrent()) {
          latest.current.onSuccess();
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [enrollmentMode], latest.current.card.setError);
        }
      })
      .finally(() => {
        if (owner.pending === pending) {
          owner.pending = undefined;
        }
      });
    owner.pending = pending;
    return pending;
  };

  return {
    enrollmentMode,
    deletePending,
    calloutLabels,
    allowsEdit: mode === 'edit',
    isLoading: model.isLoading,
    errorMessage: model.errorMessage,
    retry: () => {
      if (canRun()) {
        latest.current.model.retry();
      }
    },
    domainName: model.domain?.name || '',
    updateEnrollmentMode,
  };
};
