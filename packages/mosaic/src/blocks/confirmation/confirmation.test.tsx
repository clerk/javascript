import { ClerkRuntimeError } from '@clerk/shared/error';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import type { ReverificationController } from '../../features/reverification';
import { MosaicProvider } from '../../MosaicProvider';
import type { ConfirmationControlledProps, ConfirmationHandleProps } from './confirmation';
import { Confirmation } from './confirmation';

function renderBlock(overrides: Partial<ConfirmationControlledProps> = {}) {
  return render(
    <MosaicProvider>
      <Confirmation
        open
        onOpenChange={vi.fn()}
        title='Remove connected account'
        description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
        actionLabel='Remove'
        onConfirm={vi.fn()}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

const confirmButton = () => screen.getByRole('button', { name: 'Remove' });

describe('Confirmation', () => {
  it('renders nothing until the caller opens it', () => {
    renderBlock({ open: false });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ open: false, onOpenChange, trigger: <Button>Remove</Button> });

    await user.click(confirmButton());

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('confirms from the action', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onConfirm });

    await user.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders markup in the description', () => {
    renderBlock({
      description: (
        <>
          <strong>preston@clerk.dev</strong> will be removed from this account.
        </>
      ),
    });

    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(
      'preston@clerk.dev will be removed from this account.',
    );
    expect(screen.getByText('preston@clerk.dev').tagName).toBe('STRONG');
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('explains a failed attempt', () => {
    renderBlock({ errorMessage: 'Google is your only way to sign in.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Google is your only way to sign in.');
  });

  it('stays inert while the caller is confirming', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderBlock({ isConfirming: true, onConfirm });

    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(confirmButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

interface Member {
  id: string;
  name: string;
}

const preston: Member = { id: 'mem_1', name: 'Preston Booth' };

function renderWithHandle(onConfirm: ConfirmationHandleProps<Member>['onConfirm'] = () => Promise.resolve()) {
  const handle = Confirmation.createHandle<Member>();
  render(
    <MosaicProvider>
      <Confirmation
        handle={handle}
        title='Remove member'
        description={member => (
          <>
            <strong>{member.name}</strong> will be removed from the organization.
          </>
        )}
        actionLabel={member => `Remove ${member.name}`}
        onConfirm={onConfirm}
      />
    </MosaicProvider>,
  );
  return handle;
}

const removeButton = () => screen.getByRole('button', { name: 'Remove Preston Booth' });

describe('Confirmation with a handle', () => {
  it('renders nothing until opened through the handle', () => {
    renderWithHandle();

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('opens with a payload and renders the copy from it', () => {
    const handle = renderWithHandle();

    act(() => {
      handle.open(preston);
    });

    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Remove member');
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(
      'Preston Booth will be removed from the organization.',
    );
    expect(screen.getByText('Preston Booth').tagName).toBe('STRONG');
    expect(removeButton()).toBeInTheDocument();
  });

  it('confirms with the payload and closes once the action lands', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    const handle = renderWithHandle(onConfirm);
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    expect(onConfirm).toHaveBeenCalledWith(preston);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('stays inert and open while the action is pending', async () => {
    const user = userEvent.setup();
    const handle = renderWithHandle(() => new Promise(() => {}));
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    expect(removeButton()).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('keeps the dialog open and explains a failed attempt', async () => {
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(new Error('Preston Booth is the last admin.')));
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Preston Booth is the last admin.'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(removeButton()).not.toHaveAttribute('aria-busy', 'true');
  });

  it('starts the next open clean after a failure', async () => {
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(new Error('nope')));
    act(() => {
      handle.open(preston);
    });
    await user.click(removeButton());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    act(() => {
      handle.open(preston);
    });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('closes through the handle', async () => {
    const handle = renderWithHandle();
    act(() => {
      handle.open(preston);
    });
    expect(handle.isOpen).toBe(true);

    act(() => {
      handle.close();
    });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(handle.isOpen).toBe(false);
  });
});

describe('Confirmation with reverification', () => {
  function challenge(onCancel = vi.fn()): ReverificationController {
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
      onCancel,
    };
  }

  function Example({
    handle,
    reverification,
    onConfirm,
  }: {
    handle: ReturnType<typeof Confirmation.createHandle<Member>>;
    reverification: ReverificationController;
    onConfirm: ConfirmationHandleProps<Member>['onConfirm'];
  }) {
    return (
      <MosaicProvider>
        <Confirmation
          handle={handle}
          title='Remove member'
          description={member => `${member.name} will be removed from the organization.`}
          actionLabel={member => `Remove ${member.name}`}
          onConfirm={onConfirm}
          reverification={reverification}
        />
      </MosaicProvider>
    );
  }

  it('cancels the challenge when the controlled dialog closes', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    renderBlock({ onOpenChange, reverification: challenge(onCancel) });

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('shows the challenge in place of the confirmation', () => {
    const handle = Confirmation.createHandle<Member>();
    const { rerender } = render(
      <Example
        handle={handle}
        reverification={{ status: 'idle', phase: 'inactive' }}
        onConfirm={() => new Promise(() => {})}
      />,
    );
    act(() => {
      handle.open(preston);
    });
    expect(screen.getByText('Preston Booth will be removed from the organization.')).toBeInTheDocument();

    rerender(
      <Example
        handle={handle}
        reverification={challenge()}
        onConfirm={() => new Promise(() => {})}
      />,
    );

    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('closes without an error when the challenge is cancelled', async () => {
    const user = userEvent.setup();
    const handle = Confirmation.createHandle<Member>();
    let rejectCancelled: (error: unknown) => void = () => {};
    const onCancel = vi.fn(() =>
      rejectCancelled(new ClerkRuntimeError('cancelled', { code: 'reverification_cancelled' })),
    );
    const onConfirm = () =>
      new Promise<void>((_, reject) => {
        rejectCancelled = reject;
      });
    const { rerender } = render(
      <Example
        handle={handle}
        reverification={{ status: 'idle', phase: 'inactive' }}
        onConfirm={onConfirm}
      />,
    );
    act(() => {
      handle.open(preston);
    });
    await user.click(removeButton());
    rerender(
      <Example
        handle={handle}
        reverification={challenge(onCancel)}
        onConfirm={onConfirm}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
