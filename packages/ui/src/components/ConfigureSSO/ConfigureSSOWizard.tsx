import type { ComponentProps } from 'react';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOSteps } from './ConfigureSSOSteps';

/**
 * The wizard's data surface — exactly `ConfigureSSOProvider`'s props, derived
 * from the provider so the two can never drift.
 */
export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'>;

/**
 * The pure, data-injected ConfigureSSO flow: the provider seeded with
 * host-supplied data plus the step graph. It performs no fetching and never
 * observes a loading state — hosts own data fetching, the loading skeleton, and
 * permission gating, and inject the resolved data here. Today's hosts are the
 * Security page in `OrganizationProfile` and the standalone `ConfigureSSO`
 * component backing the internal mount.
 */
export const ConfigureSSOWizard = (props: ConfigureSSOWizardProps): JSX.Element => (
  <ConfigureSSOProvider {...props}>
    <ConfigureSSOSteps />
  </ConfigureSSOProvider>
);
