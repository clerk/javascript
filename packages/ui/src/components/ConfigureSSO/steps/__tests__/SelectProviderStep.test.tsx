import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

const goNext = vi.fn();
const goPrev = vi.fn();

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
    goToStep: vi.fn(),
    registerStep: vi.fn(),
    unregisterStep: vi.fn(),
  }),
}));

const setProvider = vi.fn();
const clearProvider = vi.fn();
const createConnection = vi.fn();

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSOFlow: () => ({
    enterpriseConnection: undefined,
    isLoading: false,
    provider: undefined,
    setProvider,
    clearProvider,
    createConnection,
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
  setProvider.mockReset();
  clearProvider.mockReset();
  createConnection.mockReset();
  createConnection.mockResolvedValue(undefined);
};

describe('SelectProviderStep', () => {
  it('mounts and renders the step header', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('heading', { name: 'Select provider' })).toBeInTheDocument();
    expect(screen.getByText('Select your identity provider')).toBeInTheDocument();
  });

  it('renders both SAML provider tiles with their labels', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('button', { name: 'Okta Workforce' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom SAML Provider' })).toBeInTheDocument();
  });

  it('loads each tile icon from img.clerk.com', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { container } = renderStep(wrapper);

    // Emotion serializes sx into stylesheets, so we check both inline + the document's collected styles
    const iconSpans = Array.from(container.querySelectorAll('button span[aria-hidden]'));
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

    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('marks the clicked tile as pressed and enables Continue', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    const oktaTile = screen.getByRole('button', { name: 'Okta Workforce' });
    expect(oktaTile).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(oktaTile);

    expect(oktaTile).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  it('flips selection when a different tile is clicked', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    const oktaTile = screen.getByRole('button', { name: 'Okta Workforce' });
    const customSamlTile = screen.getByRole('button', { name: 'Custom SAML Provider' });

    await userEvent.click(oktaTile);
    expect(oktaTile).toHaveAttribute('aria-pressed', 'true');
    expect(customSamlTile).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(customSamlTile);
    expect(oktaTile).toHaveAttribute('aria-pressed', 'false');
    expect(customSamlTile).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls setProvider, createConnection, then goNext when Continue is clicked', async () => {
    resetMocks();
    const callOrder: string[] = [];
    setProvider.mockImplementation(() => {
      callOrder.push('setProvider');
    });
    createConnection.mockImplementation(() => {
      callOrder.push('createConnection');
      return Promise.resolve();
    });
    goNext.mockImplementation(() => {
      callOrder.push('goNext');
    });

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goNext).toHaveBeenCalledTimes(1);
    });

    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    expect(createConnection).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['setProvider', 'createConnection', 'goNext']);
  });

  it('forwards the Custom SAML backend provider id when selected', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Custom SAML Provider' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(goNext).toHaveBeenCalledTimes(1);
    });

    expect(setProvider).toHaveBeenCalledWith('saml_custom');
    expect(createConnection).toHaveBeenCalledTimes(1);
  });

  it('shows loading state while createConnection is pending', async () => {
    resetMocks();
    let resolveCreate: () => void = () => undefined;
    createConnection.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveCreate = resolve;
        }),
    );

    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Okta Workforce' }));
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    await userEvent.click(continueButton);

    // While create is pending, Continue stays disabled and goNext hasn't fired.
    // The button's accessible name flips to the spinner's "Loading" label while pending.
    await waitFor(() => {
      expect(createConnection).toHaveBeenCalledTimes(1);
    });
    expect(continueButton).toBeDisabled();
    expect(goNext).not.toHaveBeenCalled();

    resolveCreate();

    await waitFor(() => {
      expect(goNext).toHaveBeenCalledTimes(1);
    });
  });

  it('does not advance and surfaces the error when createConnection rejects', async () => {
    resetMocks();
    createConnection.mockRejectedValue(new ClerkRuntimeError('Backend unavailable', { code: 'create_failed' }));

    const { wrapper } = await createFixtures();
    const { userEvent, container } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(createConnection).toHaveBeenCalledTimes(1);
    });

    expect(goNext).not.toHaveBeenCalled();
    expect(setProvider).toHaveBeenCalledWith('saml_okta');
    // Allow microtasks to flush so the rejection -> handleError -> setError chain settles
    await waitFor(() => {
      const text = container.textContent ?? '';
      expect(text).toContain('Backend unavailable');
    });
  });

  it('disables Previous on the first step', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });
});
