import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// Navigation is now the pure state machine: the step renders
// `Step.Footer.Submit`, whose runner dispatches against the machine instead of
// calling the legacy `useWizard().goToStep`. We assert on the dispatched events.
const dispatch = vi.fn();

vi.mock('../../elements/WizardMachineContext', () => ({
  useWizardMachine: () => ({ current: 'select-provider', direction: 0, dispatch }),
}));

const createEnterpriseConnection = vi.fn();

// `provider` is owned by context now and pushed there on radio change. The
// central `submitSelectProvider` (run by the footer) reads it off context, so
// the mock tracks it through `setProvider` to mirror the real provider.
const contextState = vi.hoisted(() => ({
  provider: undefined as 'saml_okta' | 'saml_custom' | undefined,
  primaryEmailAddress: { emailAddress: 'test@clerk.com' } as { emailAddress: string } | undefined,
  isPrimaryEmailVerified: true,
}));

const setProvider = vi.fn((next: 'saml_okta' | 'saml_custom') => {
  contextState.provider = next;
});

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: undefined,
    provider: contextState.provider,
    setProvider,
    // The step (and the central submit runner) read the reverification-wrapped
    // create mutation off the bundled `mutations` object.
    mutations: {
      createConnection: createEnterpriseConnection,
    },
    primaryEmailAddress: contextState.primaryEmailAddress,
    facts: {
      isPrimaryEmailVerified: contextState.isPrimaryEmailVerified,
    },
  }),
}));

import { SelectProviderStep } from '../SelectProviderStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderStep = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  ui: ReactElement = <SelectProviderStep />,
) => {
  return render(<CardStateProvider>{ui}</CardStateProvider>, { wrapper });
};

const resetMocks = () => {
  dispatch.mockReset();
  setProvider.mockClear();
  createEnterpriseConnection.mockReset();
  createEnterpriseConnection.mockResolvedValue(undefined);
  contextState.provider = undefined;
  contextState.primaryEmailAddress = { emailAddress: 'test@clerk.com' };
  contextState.isPrimaryEmailVerified = true;
};

describe('SelectProviderStep', () => {
  it('mounts and renders the step header', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('heading', { name: 'Select your identity provider' })).toBeInTheDocument();
    expect(screen.getByText(/We.*ll guide you through the detailed setup process next\./)).toBeInTheDocument();
  });

  it('renders both SAML provider radios with their labels', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('radio', { name: 'Okta Workforce' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Custom SAML Provider' })).toBeInTheDocument();
  });

  it('loads each tile icon from img.clerk.com', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { container } = renderStep(wrapper);

    // Emotion serializes sx into stylesheets, so we check both inline + the document's collected styles
    const iconSpans = Array.from(container.querySelectorAll('label span[aria-hidden]'));
    expect(iconSpans).toHaveLength(2);

    const collectedStyles = [
      ...Array.from(document.head.querySelectorAll('style')).map(s => s.textContent ?? ''),
      ...iconSpans.map(el => (el as HTMLElement).style.backgroundImage ?? ''),
    ].join('\n');

    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/okta\.svg/);
    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/saml\.svg/);
  });

  it('disables Continue when no provider is selected', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('radio', { name: 'Okta Workforce' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Custom SAML Provider' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('marks the clicked radio as checked and enables Continue', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    const oktaRadio = screen.getByRole('radio', { name: 'Okta Workforce' });
    expect(oktaRadio).not.toBeChecked();

    await userEvent.click(oktaRadio);

    expect(oktaRadio).toBeChecked();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  it('flips selection when a different radio is clicked', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    const oktaRadio = screen.getByRole('radio', { name: 'Okta Workforce' });
    const customSamlRadio = screen.getByRole('radio', { name: 'Custom SAML Provider' });

    await userEvent.click(oktaRadio);
    expect(oktaRadio).toBeChecked();
    expect(customSamlRadio).not.toBeChecked();

    await userEvent.click(customSamlRadio);
    expect(oktaRadio).not.toBeChecked();
    expect(customSamlRadio).toBeChecked();
  });

  it('records the provider and dispatches GOTO configure when Continue is clicked', async () => {
    resetMocks();
    const callOrder: string[] = [];
    setProvider.mockImplementation((next: 'saml_okta' | 'saml_custom') => {
      contextState.provider = next;
      callOrder.push('setProvider');
    });
    createEnterpriseConnection.mockImplementation(() => {
      callOrder.push('createEnterpriseConnection');
      return Promise.resolve(undefined);
    });
    dispatch.mockImplementation((event: { type: string }) => {
      callOrder.push(`dispatch:${event.type}`);
    });

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'GOTO', step: 'configure' });
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta', contextState.primaryEmailAddress);
    // setProvider fires on radio change and again inside the submit handler; the
    // create then the GOTO are the tail of the order.
    expect(callOrder.slice(-2)).toEqual(['createEnterpriseConnection', 'dispatch:GOTO']);
  });

  it('forwards the Custom SAML backend provider id when selected', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Custom SAML Provider' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'GOTO', step: 'configure' });
    });

    expect(setProvider).toHaveBeenCalledWith('saml_custom');
    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_custom', contextState.primaryEmailAddress);
  });

  it('does not advance when failing to create enterprise connection', async () => {
    resetMocks();
    createEnterpriseConnection.mockRejectedValue(
      new ClerkRuntimeError('failed to create enterprise connection', {
        code: 'enterprise_connection_creation_failed',
      }),
    );

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta', contextState.primaryEmailAddress);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('disables Previous on the first step', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  it('always creates and jumps to configure (verify-domain ran first, so no branch back)', async () => {
    // Under the new step order the user reaches select-provider only after
    // verify-domain, so the create is unconditional even if the verified fact is
    // somehow false — there is no longer a branch back to verify-domain.
    resetMocks();
    contextState.isPrimaryEmailVerified = false;

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'GOTO', step: 'configure' });
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta', contextState.primaryEmailAddress);
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'GOTO', step: 'verify-domain' });
  });
});
