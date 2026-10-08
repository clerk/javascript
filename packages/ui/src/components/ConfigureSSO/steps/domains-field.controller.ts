import type React from 'react';
import { useReducer } from 'react';

import { localizationKeys } from '@/customizables';
import { useFormControl } from '@/ui/utils/useFormControl';

import { isValidDomain } from './domains-field.model';

type SubmissionState = 'idle' | 'submitting';
type SubmissionEvent = 'submit' | 'settle';
const reduceSubmission = (_state: SubmissionState, event: SubmissionEvent): SubmissionState =>
  event === 'submit' ? 'submitting' : 'idle';

export const useDomainsFieldController = (
  onSubmit: (domain: string) => Promise<void>,
  domainNames: readonly string[],
) => {
  const [state, dispatch] = useReducer(reduceSubmission, 'idle');
  const domainField = useFormControl('domain', '', {
    type: 'text',
    label: localizationKeys('configureSSO.organizationDomainsStep.formFieldLabel__domain'),
    placeholder: localizationKeys('configureSSO.organizationDomainsStep.formFieldInputPlaceholder__domain'),
  });
  const domain = domainField.value.trim().toLowerCase();
  const isSubmitting = state === 'submitting';
  const canSubmit = isValidDomain(domain) && !domainNames.includes(domain) && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    dispatch('submit');
    void onSubmit(domain)
      .then(() => domainField.setValue(''))
      .finally(() => dispatch('settle'));
  };

  return { domainField, canSubmit, isSubmitting, handleSubmit };
};
