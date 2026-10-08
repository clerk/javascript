import { useEffect } from 'react';

import { useWizard } from '@/common';

import type { useTaskSetupMfaModel } from './task-setup-mfa.model';

const WIZARD_STEPS = { start: 0, phoneCode: 1, totp: 2 } as const;

export const useTaskSetupMfaController = (model: ReturnType<typeof useTaskSetupMfaModel>) => {
  const defaultStep = model.availableMethods.indexOf('phone_code') > -1 ? WIZARD_STEPS.phoneCode : WIZARD_STEPS.totp;
  const wizard = useWizard({ defaultStep: model.availableMethods.length > 1 ? WIZARD_STEPS.start : defaultStep });
  const { suppressAutomaticRedirect } = model;

  useEffect(() => {
    suppressAutomaticRedirect();
  }, [suppressAutomaticRedirect]);

  return {
    wizardProps: wizard.props,
    availableMethods: model.availableMethods,
    goToStep: wizard.goToStep,
    goToStartStep: () => wizard.goToStep(0),
    onSuccess: model.complete,
  };
};
