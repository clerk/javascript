import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// Navigation goes through the generic wizard facade. The step owns a local
// `handleContinue` that calls the create mutation then `useWizard().goNext`.
// We assert on those nav calls.
const goNext = vi.fn();
const goPrev = vi.fn();

vi.mock('../../elements/Wizard', () => ({
  useWizard: () => ({ current: 'select-provider', goNext, goPrev, isFirstStep: true }),
}));

const createEnterpriseConnection = vi.fn();
const changeProvider = vi.fn();

// Provider is sourced from the connection entity
// (organizationEnterpriseConnection.provider) rather than a context-level
// setProvider. The step uses goNext (not goToStep) after a successful create.
const contextState = vi.hoisted(() => ({
  provider: undefined as 'saml_okta' | 'saml_custom' | 'saml_google' | undefined,
  hasConnection: false,
}));

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: contextState.hasConnection ? { id: 'ent_1' } : undefined,
    contentRef: { current: null },
    enterpriseConnectionMutations: {
      createConnection: createEnterpriseConnection,
      changeProvider,
    },
    organizationEnterpriseConnection: {
      provider: contextState.provider,
      hasConnection: contextState.hasConnection,
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
  goNext.mockReset();
  goPrev.mockReset();
  createEnterpriseConnection.mockReset();
  createEnterpriseConnection.mockResolvedValue(undefined);
  changeProvider.mockReset();
  changeProvider.mockResolvedValue(undefined);
  contextState.provider = undefined;
  contextState.hasConnection = false;
};

describe('SelectProviderStep', () => {
  it('mounts and renders the step header', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('heading', { name: 'Select your identity provider' })).toBeInTheDocument();
    expect(screen.getByText(/You.*ll configure the connection details in the next step/)).toBeInTheDocument();
  });

  it('renders all SAML provider radios with their labels', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('radio', { name: 'Okta Workforce' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Custom SAML Provider' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Google Workspace' })).toBeInTheDocument();
  });

  it('loads each tile icon from img.clerk.com', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { container } = renderStep(wrapper);

    // Emotion serializes sx into stylesheets, so we check both inline + the document's collected styles
    const iconSpans = Array.from(container.querySelectorAll('[role="radio"] span[aria-hidden]'));
    expect(iconSpans).toHaveLength(4);

    const collectedStyles = [
      ...Array.from(document.head.querySelectorAll('style')).map(s => s.textContent ?? ''),
      ...iconSpans.map(el => (el as HTMLElement).style.backgroundImage ?? ''),
    ].join('\n');

    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/okta\.svg/);
    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/saml\.svg/);
    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/google\.svg/);
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

  it('records the provider and jumps to configure when Continue is clicked', async () => {
    resetMocks();
    const callOrder: string[] = [];
    createEnterpriseConnection.mockImplementation(() => {
      callOrder.push('createEnterpriseConnection');
      return Promise.resolve(undefined);
    });
    goNext.mockImplementation(() => {
      callOrder.push('goNext');
    });

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goNext).toHaveBeenCalled();
    });

    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta');
    // The create then the goNext are the tail of the call order.
    expect(callOrder.slice(-2)).toEqual(['createEnterpriseConnection', 'goNext']);
  });

  it('forwards the Custom SAML backend provider id when selected', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Custom SAML Provider' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goNext).toHaveBeenCalled();
    });

    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_custom');
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
      expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta');
    });

    expect(goNext).not.toHaveBeenCalled();
  });

  it('disables Previous on the first step', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  describe('changing provider when a connection already exists', () => {
    it('advances without creating or changing when the connected provider is re-selected', async () => {
      resetMocks();
      contextState.provider = 'saml_okta';
      contextState.hasConnection = true;
      const { wrapper } = await createFixtures();
      const { userEvent } = renderStep(wrapper);

      // The connected provider is preselected, so Continue just walks forward.
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => {
        expect(goNext).toHaveBeenCalled();
      });
      expect(createEnterpriseConnection).not.toHaveBeenCalled();
      expect(changeProvider).not.toHaveBeenCalled();
    });

    it('opens the confirmation dialog when a different provider is selected', async () => {
      resetMocks();
      contextState.provider = 'saml_okta';
      contextState.hasConnection = true;
      const { wrapper } = await createFixtures();
      const { userEvent } = renderStep(wrapper);

      await userEvent.click(screen.getByRole('radio', { name: 'Google Workspace' }));
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      expect(await screen.findByRole('heading', { name: /change provider to google workspace/i })).toBeInTheDocument();
      // Nothing is mutated until the user confirms.
      expect(changeProvider).not.toHaveBeenCalled();
      expect(goNext).not.toHaveBeenCalled();
    });

    it('changes the provider and advances when the dialog is confirmed', async () => {
      resetMocks();
      contextState.provider = 'saml_okta';
      contextState.hasConnection = true;
      const { wrapper } = await createFixtures();
      const { userEvent } = renderStep(wrapper);

      await userEvent.click(screen.getByRole('radio', { name: 'Google Workspace' }));
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await userEvent.click(await screen.findByRole('button', { name: 'Change provider' }));

      await waitFor(() => {
        expect(changeProvider).toHaveBeenCalledWith('saml_google');
      });
      await waitFor(() => {
        expect(goNext).toHaveBeenCalled();
      });
    });

    it('keeps the connection and stays put when the dialog is cancelled', async () => {
      resetMocks();
      contextState.provider = 'saml_okta';
      contextState.hasConnection = true;
      const { wrapper } = await createFixtures();
      const { userEvent } = renderStep(wrapper);

      await userEvent.click(screen.getByRole('radio', { name: 'Google Workspace' }));
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /change provider to/i })).not.toBeInTheDocument();
      });
      expect(changeProvider).not.toHaveBeenCalled();
      expect(goNext).not.toHaveBeenCalled();
    });
  });
});
