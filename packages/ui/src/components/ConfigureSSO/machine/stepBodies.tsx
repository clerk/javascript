import type React from 'react';

import { ConfigureStep, ConfirmationStep, SelectProviderStep, TestConfigurationStep, VerifyDomainStep } from '../steps';
import type { WizardStepId } from '../types';

/**
 * The single state→view edge for the ConfigureSSO wizard: maps each
 * {@link WizardStepId} to the body component that renders it.
 *
 * The machine (`transitions.ts` + `reducer.ts`) stays pure and never imports
 * a view; the wiring sub-item is the only thing that reads this map to mount
 * the body for `state.current`.
 */
export const STEP_BODIES: Record<WizardStepId, React.ComponentType> = {
  'verify-domain': VerifyDomainStep,
  'select-provider': SelectProviderStep,
  configure: ConfigureStep,
  test: TestConfigurationStep,
  confirmation: ConfirmationStep,
};
