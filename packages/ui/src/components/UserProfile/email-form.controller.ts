import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { useWizard } from '@/ui/common';
import { localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { EmailFormData, EmailFormProps } from './email-form.types';

export const useEmailFormController = (model: EmailFormData, props: EmailFormProps) => {
  const card = useCardState();
  const pending = useRef<Promise<void>>();
  const mounted = useRef(true);
  const generation = useRef({});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current = {};
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const canRun = () => mounted.current && model.canRun();
  const wizard = useWizard({
    defaultStep: model.hasExistingEmail ? 1 : 0,
    onNextStep: () => card.setError(undefined),
  });
  const emailField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    isRequired: true,
  });

  const addEmail = (event: FormEvent) => {
    event.preventDefault();
    if (!canRun()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const origin = generation.current;
    const isCurrent = () => canRun() && generation.current === origin;
    const request = model
      .createEmail(emailField.value, isCurrent)
      .then(completed => {
        if (completed && isCurrent()) {
          wizard.nextStep();
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [emailField], card.setError);
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
    wizardProps: wizard.props,
    strategy: model.strategy,
    identifier: model.identifier,
    emailField: { id: emailField.id, props: emailField.props },
    canSubmit: emailField.value.length > 1 && model.username !== emailField.value,
    addEmail,
    title: props.title,
    subtitle: props.subtitle,
    disableAutoFocus: props.disableAutoFocus ?? false,
    onSuccess: () => {
      if (canRun()) {
        props.onSuccess();
      }
    },
    onReset: () => {
      if (canRun()) {
        generation.current = {};
        pending.current = undefined;
        props.onReset();
      }
    },
  };
};
