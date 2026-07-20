import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// The Google sub-flow's first step (create-app) reads only `useWizard()`, so the
// flow can mount without the full ConfigureSSO context. The context is mocked
// thin to satisfy any incidental reads — including the footer `Step.Footer.Reset`
// affordance, which reads `organizationEnterpriseConnection.hasConnection` and
// self-hides here since there is no connection in this isolated render.
vi.mock('../../../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: undefined,
    organizationEnterpriseConnection: { hasConnection: false },
    provider: 'saml_google',
    enterpriseConnectionMutations: {},
  }),
}));

import { SamlGoogleConfigureSteps } from '../SamlGoogleConfigureSteps';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('SAML provider sub-flow — synchronous step derivation', () => {
  it('hosts its own nested <Wizard> and renders the first inner step', async () => {
    // Regression net for the generic engine: each SAML provider passes its
    // statically-declared steps config array to its own <Wizard>, so the step
    // graph is known synchronously at that boundary (no effect-timed
    // registration, no empty first frame).
    const { wrapper } = await createFixtures();

    render(
      <CardStateProvider>
        <SamlGoogleConfigureSteps />
      </CardStateProvider>,
      { wrapper },
    );

    // The create-app step body renders immediately — the inner machine mounts on
    // the first derived step rather than a null first frame. Asserting on the
    // step-body instruction heading proves the body (not just the shared header)
    // is mounted.
    expect(await screen.findByText(/in google workspace, create a new saml application/i)).toBeInTheDocument();
  });
});
