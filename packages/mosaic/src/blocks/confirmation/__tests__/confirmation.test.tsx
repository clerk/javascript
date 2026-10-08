import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../__tests__/clerk-errors';
import { Button } from '../../../components/button';
import type { MosaicLocalization } from '../../../localization';
import { MosaicProvider } from '../../../mosaic-provider';
import type { ConfirmationControlledProps, ConfirmationHandleProps } from '../confirmation';
import { Confirmation } from '../confirmation';

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

function renderWithHandle(
  onConfirm: ConfirmationHandleProps<Member>['onConfirm'] = () => Promise.resolve(),
  { errorFallback, localization }: { errorFallback?: string; localization?: MosaicLocalization } = {},
) {
  const handle = Confirmation.createHandle<Member>();
  render(
    <MosaicProvider localization={localization}>
      <Confirmation
        errorFallback={errorFallback}
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

afterEach(() => {
  vi.restoreAllMocks();
});

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
    const handle = renderWithHandle(() =>
      Promise.reject(clerkApiError('organization_minimum_permissions_needed', 'Preston Booth is the last admin.')),
    );
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Preston Booth is the last admin.'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(removeButton()).not.toHaveAttribute('aria-busy', 'true');
  });

  it('shows the localized copy for the code a refusal carries', async () => {
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(clerkApiError('action_blocked', 'Raw server sentence.')), {
      localization: { overrides: { 'errors.action_blocked': 'Acción bloqueada.' } },
    });
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Acción bloqueada.'));
  });

  it('shows the fallback rather than what an unexpected error says', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(new TypeError('Cannot read properties of undefined')), {
      errorFallback: 'Unable to remove this member.',
    });
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to remove this member.'));
  });

  it('shows the generic error when no fallback is given', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(new Error('internal')));
    act(() => {
      handle.open(preston);
    });

    await user.click(removeButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
  });

  it('starts the next open clean after a failure', async () => {
    const user = userEvent.setup();
    const handle = renderWithHandle(() => Promise.reject(clerkApiError('action_blocked', 'nope')));
    act(() => {
      handle.open(preston);
    });
    await user.click(removeButton());
    await waitFor(() => expect(screen.getByRole('alert')).not.toBeEmptyDOMElement());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    act(() => {
      handle.open(preston);
    });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('alert').textContent).toBe('');
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
