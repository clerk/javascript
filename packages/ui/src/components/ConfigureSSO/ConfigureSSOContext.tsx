import { useUser } from '@clerk/shared/react/index';
import React from 'react';

/**
 * Shared form state for the ConfigureSSO wizard. Lives outside the
 * Wizard's own context so that:
 *  - it persists across step navigations (each step is its own
 *    `<Route>`, mounted/unmounted on navigation)
 *  - `shouldSkip` predicates on `WizardStep` can read it as plain data
 *    via `<Wizard.Root data={ssoCtx} />`.
 */
export interface ConfigureSSOData {
  email: string;
  /**
   * Domain id returned by the API after the email is submitted.
   * Empty until the first step succeeds.
   */
  domainId: string;
  /**
   * `true` if the domain returned by the API is already verified at the
   * time the user submits their email — the "Verify domain" step is
   * skipped in that case.
   */
  domainAlreadyVerified: boolean;
}

export interface ConfigureSSOContextValue extends ConfigureSSOData {
  setEmail: (email: string) => void;
  setDomainId: (id: string) => void;
}

const ConfigureSSOFlowContext = React.createContext<ConfigureSSOContextValue | null>(null);
ConfigureSSOFlowContext.displayName = 'ConfigureSSOFlowContext';

export const ConfigureSSOFlowProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [domainId, setDomainId] = React.useState('');

  const { user } = useUser();

  // user is guaranteed to be defined because we're using the withCoreUserGuard HOC
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [email, setEmail] = React.useState(user!.primaryEmailAddress?.emailAddress ?? '');
  const domainAlreadyVerified = user?.primaryEmailAddress?.verification.status === 'verified';

  const value = React.useMemo<ConfigureSSOContextValue>(
    () => ({
      email,
      domainId,
      domainAlreadyVerified,
      setEmail,
      setDomainId,
    }),
    [email, domainId, domainAlreadyVerified],
  );

  return <ConfigureSSOFlowContext.Provider value={value}>{children}</ConfigureSSOFlowContext.Provider>;
};

export const useConfigureSSOFlow = (): ConfigureSSOContextValue => {
  const ctx = React.useContext(ConfigureSSOFlowContext);
  if (!ctx) {
    throw new Error('useConfigureSSOFlow called outside <ConfigureSSOFlowProvider>.');
  }
  return ctx;
};
