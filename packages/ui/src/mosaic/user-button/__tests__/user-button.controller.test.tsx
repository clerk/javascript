import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../machines/__tests__/test-utils';
import type { UserButtonControllerOptions, UserButtonReadyModel } from '../user-button.controller';
import { useUserButtonController } from '../user-button.controller';
import type { UserButtonModel } from '../user-button.model';

function ready(overrides: Partial<UserButtonReadyModel> = {}): UserButtonReadyModel {
  return {
    status: 'ready',
    organizationsEnabled: true,
    renderBranding: true,
    activeSession: { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' },
    activeOrganization: null,
    hasOrganizations: false,
    hidePersonal: false,
    organizationsLoading: false,
    memberships: [],
    suggestions: [],
    invitations: [],
    additionalSessions: [],
    ...overrides,
  };
}

function Harness({ model, ...options }: { model: UserButtonModel } & UserButtonControllerOptions) {
  const c = useUserButtonController(model, options);
  if (c.status !== 'ready') {
    return <output data-testid='status'>{c.status}</output>;
  }
  return (
    <div>
      <output data-testid='status'>{c.status}</output>
      <output data-testid='mode'>{c.mode ?? 'combined'}</output>
      <output data-testid='open'>{String(c.open)}</output>
      <output data-testid='pending'>{c.pendingKey ?? ''}</output>
      <output data-testid='active-org'>{c.activeOrganization?.organizationId ?? ''}</output>
      <button
        type='button'
        onClick={() => c.onOpenChange?.(true)}
      >
        open
      </button>
      <button
        type='button'
        onClick={() => c.onOpenChange?.(false)}
      >
        close
      </button>
      <button
        type='button'
        onClick={() => c.onSelectOrganization?.('org_1')}
      >
        select-org
      </button>
      <button
        type='button'
        onClick={() => c.onSwitchSession?.('sess_2')}
      >
        switch
      </button>
      <button
        type='button'
        onClick={() => c.onManageAccount?.()}
      >
        manage-account
      </button>
      {c.customMenuItems?.map(item =>
        item.href === undefined ? (
          <button
            key={item.id}
            type='button'
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ) : (
          <a
            key={item.id}
            href={item.href}
          >
            {item.label}
          </a>
        ),
      )}
    </div>
  );
}

describe('useUserButtonController', () => {
  it('passes loading and hidden through until the model is ready', () => {
    const { rerender } = render(<Harness model={{ status: 'loading' }} />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');

    rerender(<Harness model={{ status: 'hidden' }} />);
    expect(screen.getByTestId('status')).toHaveTextContent('hidden');

    rerender(<Harness model={ready()} />);
    expect(screen.getByTestId('status')).toHaveTextContent('ready');
  });

  it('forces user mode when organizations are disabled, whatever mode was asked for', () => {
    const { rerender } = render(
      <Harness
        model={ready({ organizationsEnabled: false })}
        mode='organization'
      />,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('user');

    rerender(
      <Harness
        model={ready({ organizationsEnabled: true })}
        mode='organization'
      />,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('organization');
  });

  it('runs a model action through the machine and keys the affordance', async () => {
    const onSelectOrganization = vi.fn(() => Promise.resolve());
    render(<Harness model={ready({ onSelectOrganization })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('select-org'));

    expect(onSelectOrganization).toHaveBeenCalledWith('org_1');
    await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('select-org:org_1'));

    await act(async () => {
      await tick();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('pending')).toHaveTextContent('');
  });

  it('closes immediately on a hand-off and leaves the model action to run', () => {
    const onManageAccount = vi.fn();
    render(<Harness model={ready({ onManageAccount })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('manage-account'));

    expect(onManageAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('closes the popover before a custom menu action runs', () => {
    const onClick = vi.fn();
    render(
      <Harness
        model={ready()}
        customMenuItems={[{ id: 'docs', label: 'Documentation', onClick }]}
      />,
    );

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('Documentation'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('starts closed and opens and closes', () => {
    render(<Harness model={ready()} />);
    expect(screen.getByTestId('open')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('close'));
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('holds the popup open when an action fails, even one that would have closed it', async () => {
    const onSelectOrganization = vi.fn(() => Promise.reject(new Error('cannot switch')));
    render(<Harness model={ready({ onSelectOrganization })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('select-org'));

    await act(async () => {
      await tick();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('pending')).toHaveTextContent('');
  });

  it('lets the row be clicked again after a failure', async () => {
    const onSelectOrganization = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined);
    render(<Harness model={ready({ onSelectOrganization })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('select-org'));
    await act(async () => {
      await tick();
    });

    fireEvent.click(screen.getByText('select-org'));
    expect(onSelectOrganization).toHaveBeenCalledTimes(2);

    await act(async () => {
      await tick();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('refuses a second action while one is in flight', async () => {
    const pending = deferred<unknown>();
    const onSelectOrganization = vi.fn(() => pending.promise);
    const onSwitchSession = vi.fn(() => Promise.resolve());
    render(<Harness model={ready({ onSelectOrganization, onSwitchSession })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('select-org'));
    await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('select-org:org_1'));

    fireEvent.click(screen.getByText('switch'));
    expect(onSwitchSession).not.toHaveBeenCalled();

    await act(async () => {
      pending.resolve(undefined);
      await tick();
    });
  });

  it('refuses an action while the popup is closed', () => {
    const onSelectOrganization = vi.fn(() => Promise.resolve());
    render(<Harness model={ready({ onSelectOrganization })} />);

    fireEvent.click(screen.getByText('select-org'));

    expect(onSelectOrganization).not.toHaveBeenCalled();
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('abandons an action dismissed mid-flight rather than reopening on its result', async () => {
    const pending = deferred<unknown>();
    const onSwitchSession = vi.fn(() => pending.promise);
    render(<Harness model={ready({ onSwitchSession })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('switch'));
    await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('switch:sess_2'));

    fireEvent.click(screen.getByText('close'));
    expect(screen.getByTestId('open')).toHaveTextContent('false');

    await act(async () => {
      pending.resolve(undefined);
      await tick();
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('holds the surface on the model the action started from until it settles', async () => {
    const pending = deferred<unknown>();
    const onSwitchSession = vi.fn(() => pending.promise);
    const { rerender } = render(<Harness model={ready({ onSwitchSession })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('switch'));

    rerender(
      <Harness
        model={ready({
          onSwitchSession,
          activeOrganization: { kind: 'membership', organizationId: 'org_1', name: 'Other' },
        })}
      />,
    );

    expect(screen.getByTestId('active-org')).toHaveTextContent('');
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    await act(async () => {
      pending.resolve(undefined);
      await tick();
    });

    expect(screen.getByTestId('active-org')).toHaveTextContent('org_1');
    expect(screen.getByTestId('open')).toHaveTextContent('true');
  });

  // `setActive` emits a transitive state while it routes, which takes the live model back to
  // `loading`. Answering that mid-action would drop the surface for the fallback and put it back.
  it('holds the surface through a model that goes back to loading mid-action', async () => {
    const pending = deferred<unknown>();
    const onSwitchSession = vi.fn(() => pending.promise);
    const { rerender } = render(<Harness model={ready({ onSwitchSession })} />);

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('switch'));

    rerender(<Harness model={{ status: 'loading' }} />);
    expect(screen.getByTestId('status')).toHaveTextContent('ready');
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    // Once the action settles there is nothing left to hold, so the live model answers again.
    await act(async () => {
      pending.resolve(undefined);
      await tick();
    });
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });
});
