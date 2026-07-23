import { describe, expect, it, vi } from 'vitest';

import { Flow } from '@/customizables';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import type { EnterpriseConnectionProviderType } from '../../../types';

// The dispatch reads `organizationEnterpriseConnection.provider`. The nested
// sub-flows also read `enterpriseConnection` (via `Step.Footer.Reset`), which is
// left undefined so that footer self-hides in this isolated render.
const contextState = vi.hoisted(() => ({ provider: undefined as string | undefined }));

vi.mock('../../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: undefined,
    contentRef: { current: null },
    enterpriseConnectionMutations: {},
    organizationEnterpriseConnection: {
      provider: contextState.provider,
      hasConnection: true,
    },
  }),
}));

import { ConfigureProviderStep, resolveConfigureSteps } from '../index';
import { OidcCustomConfigureSteps } from '../oidc';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from '../saml';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('resolveConfigureSteps', () => {
  it('dispatches a derived OIDC provider key to the OIDC sub-flow by prefix (not the oidc_custom literal)', () => {
    // The regression: the backend returns `oidc_<slug>` derived from the connection
    // name (e.g. `clerk.dev` → `oidc_clerk_dev`), never the `oidc_custom` input alias.
    expect(resolveConfigureSteps('oidc_clerk_dev')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_ghe_acme')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_gitlab_ent_acme')).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_custom')).toBe(OidcCustomConfigureSteps);
  });

  it('dispatches SAML providers by exact literal', () => {
    expect(resolveConfigureSteps('saml_okta')).toBe(SamlOktaConfigureSteps);
    expect(resolveConfigureSteps('saml_custom')).toBe(SamlCustomConfigureSteps);
    expect(resolveConfigureSteps('saml_google')).toBe(SamlGoogleConfigureSteps);
    expect(resolveConfigureSteps('saml_microsoft')).toBe(SamlMicrosoftConfigureSteps);
  });

  it('returns undefined for an unrecognized provider so the caller can degrade', () => {
    expect(resolveConfigureSteps('ldap_enterprise' as EnterpriseConnectionProviderType)).toBeUndefined();
  });
});

describe('ConfigureProviderStep', () => {
  const renderStep = (wrapper: React.ComponentType<{ children?: React.ReactNode }>) =>
    render(
      <Flow.Root flow='configureSSO'>
        <CardStateProvider>
          <ConfigureProviderStep />
        </CardStateProvider>
      </Flow.Root>,
      { wrapper },
    );

  it('renders the OIDC configure steps for a derived provider key without throwing', async () => {
    contextState.provider = 'oidc_clerk_dev';
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    // The OIDC sub-flow mounts on its first step. Before the fix this threw
    // `No steps found for provider: oidc_clerk_dev` and white-screened the wizard.
    expect(await screen.findByText(/create a new oidc application/i)).toBeInTheDocument();
  });

  it('degrades to the unsupported-provider state for a provider the SDK does not recognize', async () => {
    contextState.provider = 'ldap_enterprise';
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    expect(await screen.findByText(/unsupported provider/i)).toBeInTheDocument();
  });
});
