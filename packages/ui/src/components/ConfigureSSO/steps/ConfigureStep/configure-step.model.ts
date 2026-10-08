import { useMemo } from 'react';

import { useConfigureSSO } from '../../ConfigureSSOContext';
import { isOidcProvider } from '../../domain/organizationEnterpriseConnection';
import type { WizardStepConfig } from '../../elements/Wizard';
import type { EnterpriseConnectionProviderType, SamlProviderType } from '../../types';
import { OidcCustomConfigureSteps } from './oidc';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from './saml';

type ConfigureStepsComponent = () => JSX.Element;

const STEPS_BY_SAML_PROVIDER: Record<SamlProviderType, ConfigureStepsComponent> = {
  saml_custom: SamlCustomConfigureSteps,
  saml_okta: SamlOktaConfigureSteps,
  saml_google: SamlGoogleConfigureSteps,
  saml_microsoft: SamlMicrosoftConfigureSteps,
};

export const resolveConfigureSteps = (
  provider: EnterpriseConnectionProviderType,
): ConfigureStepsComponent | undefined =>
  isOidcProvider(provider) ? OidcCustomConfigureSteps : STEPS_BY_SAML_PROVIDER[provider];

export const useConfigureStepModel = () => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();
  const steps = useMemo<WizardStepConfig[]>(
    () => [{ id: 'select-provider' }, { id: 'configure-provider', isReachable: () => c.hasConnection }],
    [c],
  );
  return { steps };
};

export const useConfigureProviderStepModel = () => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();
  return { provider: c.provider, ConfigureSteps: c.provider ? resolveConfigureSteps(c.provider) : undefined };
};
