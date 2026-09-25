import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { ReverificationController } from '../../reverification';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';

function challenge(overrides: Partial<Extract<ReverificationController, { status: 'ready' }>> = {}) {
  return {
    status: 'ready',
    phase: 'active',
    step: 'password',
    value: '',
    onValueChange: vi.fn(),
    isPending: false,
    onSubmit: vi.fn(),
    onShowMethods: vi.fn(),
    onShowHelp: vi.fn(),
    onBack: vi.fn(),
    onEmailSupport: vi.fn(),
    onResend: vi.fn(),
    canResend: true,
    methods: [],
    onSelectMethod: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  } as ReverificationController;
}

function renderView(reverification: ReverificationController, pendingId?: string) {
  return render(
    <MosaicProvider>
      <UserProfileConnectedAccountsSectionView
        accounts={[]}
        availableProviders={[{ id: 'oauth_github', provider: 'GitHub' }]}
        pendingId={pendingId}
        connectReverification={reverification}
        onConnect={() => {}}
      />
    </MosaicProvider>,
  );
}

describe('connected accounts reverification dialog', () => {
  it('stays closed while no challenge is needed or it is still loading', () => {
    const { rerender } = renderView({ status: 'idle', phase: 'inactive' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <MosaicProvider>
        <UserProfileConnectedAccountsSectionView
          accounts={[]}
          availableProviders={[{ id: 'oauth_github', provider: 'GitHub' }]}
          connectReverification={{ status: 'loading', phase: 'active', onCancel: vi.fn() }}
          onConnect={() => {}}
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens for a challenge and for an unavailable challenge', () => {
    const { unmount } = renderView(challenge());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    unmount();

    renderView({ status: 'unavailable', phase: 'active', onCancel: vi.fn() });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancels from the footer and from Escape', async () => {
    const user = userEvent.setup();
    const reverification = challenge();
    renderView(reverification);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(reverification.status !== 'idle' && reverification.onCancel).toHaveBeenCalledOnce();

    await user.keyboard('{Escape}');
    expect(reverification.status !== 'idle' && reverification.onCancel).toHaveBeenCalledTimes(2);
  });

  it('disables cancel while the action retries', () => {
    renderView(challenge({ phase: 'retrying' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('returns focus to the Connect button that started the challenge', async () => {
    const user = userEvent.setup();
    function Example({ reverification }: { reverification: ReverificationController }) {
      return (
        <MosaicProvider>
          <UserProfileConnectedAccountsSectionView
            accounts={[]}
            availableProviders={[{ id: 'oauth_github', provider: 'GitHub' }]}
            connectReverification={reverification}
            onConnect={() => {}}
          />
        </MosaicProvider>
      );
    }
    const { rerender } = render(<Example reverification={{ status: 'idle', phase: 'inactive' }} />);
    const connect = screen.getByRole('button', { name: 'Connect GitHub' });
    await user.click(connect);

    rerender(<Example reverification={challenge()} />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    rerender(<Example reverification={{ status: 'idle', phase: 'inactive' }} />);
    await waitFor(() => expect(connect).toHaveFocus());
  });
});
