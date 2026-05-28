import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

const goNext = vi.fn();
const goPrev = vi.fn();
const goToStep = vi.fn();

vi.mock('../../elements/Wizard', () => ({
  useWizard: () => ({
    activeSteps: [],
    currentStep: undefined,
    currentIndex: -1,
    totalSteps: 0,
    isFirstStep: true,
    isLastStep: false,
    isNested: false,
    goNext,
    goPrev,
    goToStep,
    registerStep: vi.fn(),
    unregisterStep: vi.fn(),
  }),
}));

const setProvider = vi.fn();
const createEnterpriseConnection = vi.fn();

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: undefined,
    provider: undefined,
    setProvider,
    createEnterpriseConnection,
    initialStepId: 'select-provider',
  }),
}));

const userMockState = vi.hoisted(() => ({
  current: {
    primaryEmailAddress: {
      emailAddress: 'test@clerk.com',
      verification: { status: 'verified' as 'verified' | 'unverified' },
    },
  } as {
    primaryEmailAddress?: {
      emailAddress: string;
      verification: { status: 'verified' | 'unverified' };
    };
  } | null,
}));

vi.mock('@clerk/shared/react/index', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react/index')>();
  return {
    ...actual,
    useUser: () => ({
      user: userMockState.current,
      isLoaded: true,
      isSignedIn: true,
    }),
  };
});

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
  goToStep.mockReset();
  setProvider.mockReset();
  createEnterpriseConnection.mockReset();
  createEnterpriseConnection.mockResolvedValue(undefined);
  userMockState.current = {
    primaryEmailAddress: {
      emailAddress: 'test@clerk.com',
      verification: { status: 'verified' },
    },
  };
};

describe('SelectProviderStep', () => {
  it('mounts and renders the step header', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('heading', { name: 'Select your identity provider' })).toBeInTheDocument();
    expect(screen.getByText(/We.*ll guide you through the detailed setup process next\./)).toBeInTheDocument();
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
    const iconSpans = Array.from(container.querySelectorAll('label span[aria-hidden]'));
    expect(iconSpans).toHaveLength(3);

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

  it('records the provider and advances when Continue is clicked', async () => {
    resetMocks();
    const callOrder: string[] = [];
    setProvider.mockImplementation(() => {
      callOrder.push('setProvider');
    });
    createEnterpriseConnection.mockImplementation(async () => {
      callOrder.push('createEnterpriseConnection');
    });
    goToStep.mockImplementation(() => {
      callOrder.push('goToStep');
    });

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goToStep).toHaveBeenCalledWith('configure');
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta', userMockState.current?.primaryEmailAddress);
    expect(callOrder).toEqual(['setProvider', 'createEnterpriseConnection', 'goToStep']);
  });

  it('forwards the Custom SAML backend provider id when selected', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Custom SAML Provider' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goToStep).toHaveBeenCalledWith('configure');
    });

    expect(setProvider).toHaveBeenCalledWith('saml_custom');
    expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_custom', userMockState.current?.primaryEmailAddress);
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
      expect(createEnterpriseConnection).toHaveBeenCalledWith('saml_okta', userMockState.current?.primaryEmailAddress);
    });

    expect(goToStep).not.toHaveBeenCalled();
  });

  it('disables Previous on the first step', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  it('routes to verify-domain when the user has no primary email address', async () => {
    resetMocks();
    userMockState.current = {};

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goToStep).toHaveBeenCalledWith('verify-domain');
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createEnterpriseConnection).not.toHaveBeenCalled();
  });

  it('routes to verify-domain when the user has an unverified primary email address', async () => {
    resetMocks();
    userMockState.current = {
      primaryEmailAddress: {
        emailAddress: 'test@clerk.com',
        verification: { status: 'unverified' },
      },
    };

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goToStep).toHaveBeenCalledWith('verify-domain');
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createEnterpriseConnection).not.toHaveBeenCalled();
  });
});
