import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

const setConnectionActive = vi.fn();
const onExit = vi.fn();

// The step reads the connection (id + domains), the organizationEnterpriseConnection
// domain object (isActive), the activate mutation, and the host `onExit` from
// context. Fields are mutated per-test.
const contextState = vi.hoisted(() => ({
  domains: ['clerk.com'] as string[],
  isActive: false,
}));

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: { id: 'ent_1', domains: contextState.domains },
    organizationEnterpriseConnection: { isActive: contextState.isActive },
    enterpriseConnectionMutations: { setConnectionActive },
    onExit,
  }),
}));

import { ActivateStep } from '../ActivateStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderStep = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  ui: ReactElement = <ActivateStep />,
) => {
  return render(<CardStateProvider>{ui}</CardStateProvider>, { wrapper });
};

const resetMocks = () => {
  setConnectionActive.mockReset();
  setConnectionActive.mockResolvedValue(undefined);
  onExit.mockReset();
  contextState.domains = ['clerk.com'];
  contextState.isActive = false;
};

describe('ActivateStep', () => {
  it('renders the shield icon, heading, subtext, and both buttons', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { container } = renderStep(wrapper);

    expect(screen.getByRole('heading', { name: 'SSO connection configured' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate SSO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    // The shield-check icon renders (asserted via its element descriptor — the
    // SVG itself is stubbed to a <span> in the test transform).
    expect(container.querySelector('.cl-configureSSOActivateIcon')).toBeInTheDocument();
  });

  it('interpolates a single domain into the subtitle copy', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(screen.getByText(/anyone signing in with clerk\.com must use your identity provider/i)).toBeInTheDocument();
  });

  it('joins multiple domains in the subtitle copy', async () => {
    resetMocks();
    contextState.domains = ['clerk.com', 'clerk.dev'];
    const { wrapper } = await createFixtures();
    renderStep(wrapper);

    expect(
      screen.getByText(/anyone signing in with clerk\.com, clerk\.dev must use your identity provider/i),
    ).toBeInTheDocument();
  });

  it('activates the connection then exits when "Activate SSO" is clicked', async () => {
    resetMocks();
    setConnectionActive.mockResolvedValue({ id: 'ent_1', active: true } as any);
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Activate SSO' }));

    await waitFor(() => expect(setConnectionActive).toHaveBeenCalledWith('ent_1', true));
    await waitFor(() => expect(onExit).toHaveBeenCalledTimes(1));
  });

  it('surfaces the error and does not exit when activation fails', async () => {
    resetMocks();
    setConnectionActive.mockRejectedValue(new ClerkRuntimeError('Activation failed', { code: 'activation_failed' }));
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: 'Activate SSO' }));

    await waitFor(() => expect(setConnectionActive).toHaveBeenCalledWith('ent_1', true));
    await screen.findByText(/activation failed/i);
    expect(onExit).not.toHaveBeenCalled();
  });

  it('exits without mutating when "Skip for now" is clicked', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(setConnectionActive).not.toHaveBeenCalled();
  });

  describe('already-active variant', () => {
    it('renders the active heading and domain-interpolated subtitle', async () => {
      resetMocks();
      contextState.isActive = true;
      const { wrapper } = await createFixtures();
      renderStep(wrapper);

      expect(screen.getByRole('heading', { name: 'SSO connection is active' })).toBeInTheDocument();
      expect(
        screen.getByText(/anyone signing in with clerk\.com must use your identity provider/i),
      ).toBeInTheDocument();
    });

    it('shows only the Done button — no Activate SSO, no Skip for now', async () => {
      resetMocks();
      contextState.isActive = true;
      const { wrapper } = await createFixtures();
      renderStep(wrapper);

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Activate SSO' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /skip for now/i })).not.toBeInTheDocument();
    });

    it('calls onExit when Done is clicked', async () => {
      resetMocks();
      contextState.isActive = true;
      const { wrapper } = await createFixtures();
      const { userEvent } = renderStep(wrapper);

      await userEvent.click(screen.getByRole('button', { name: 'Done' }));

      expect(onExit).toHaveBeenCalledTimes(1);
      expect(setConnectionActive).not.toHaveBeenCalled();
    });
  });
});
