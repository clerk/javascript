import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AlertDialog } from '../../components/alert-dialog';
import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import { RemoveContactDialogView, SetPrimaryContactDialogView } from '../dialogs/confirm-contact-dialog.view';
import type { ConfirmContactActionState } from '../dialogs/flow.types';
import { ReverificationDialogView } from '../dialogs/reverification-dialog.view';

const IDLE: ConfirmContactActionState = { identifier: 'item2@clerk.dev', isSubmitting: false, errors: {} };

function renderAlert(children: React.ReactNode) {
  render(
    <MosaicProvider>
      <AlertDialog defaultOpen>{children}</AlertDialog>
    </MosaicProvider>,
  );
}

describe('RemoveContactDialogView', () => {
  it('warns about losing sign-in only for a verified contact', () => {
    renderAlert(
      <RemoveContactDialogView
        isVerified
        kind='email'
        state={IDLE}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/no longer be able to sign in/)).toBeInTheDocument();
  });

  it('omits the sign-in warning for an unverified contact', () => {
    renderAlert(
      <RemoveContactDialogView
        isVerified={false}
        kind='email'
        state={IDLE}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText(/no longer be able to sign in/)).not.toBeInTheDocument();
    expect(screen.getByText(/will be removed from this account/)).toBeInTheDocument();
  });

  it('confirms, then locks both actions while the removal is in flight', async () => {
    const onConfirm = vi.fn();
    renderAlert(
      <RemoveContactDialogView
        isVerified
        kind='phone'
        state={IDLE}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('reports a failure that has no field to land in', () => {
    renderAlert(
      <RemoveContactDialogView
        isVerified
        kind='email'
        state={{ ...IDLE, errors: { form: 'Something went wrong.' } }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });
});

describe('SetPrimaryContactDialogView', () => {
  it('gives the promotion a surface of its own, with a pending state', () => {
    renderAlert(
      <SetPrimaryContactDialogView
        kind='email'
        state={{ ...IDLE, isSubmitting: true }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Set as primary email address' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set as primary' })).toHaveAttribute('aria-busy', 'true');
  });
});

describe('ReverificationDialogView', () => {
  function renderChallenge(state: React.ComponentProps<typeof ReverificationDialogView>['state']) {
    const handlers = {
      onValueChange: vi.fn(),
      onSubmit: vi.fn(),
      onResend: vi.fn(),
      onCancel: vi.fn(),
    };
    render(
      <MosaicProvider>
        <Dialog defaultOpen>
          <ReverificationDialogView
            state={state}
            {...handlers}
          />
        </Dialog>
      </MosaicProvider>,
    );
    return handlers;
  }

  const resend = { isResending: false, secondsRemaining: 0 };

  it('asks for a password, with no resend affordance', () => {
    renderChallenge({ strategy: 'password', value: '', status: 'idle', errors: {}, resend });

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.queryByRole('button', { name: 'Resend' })).not.toBeInTheDocument();
  });

  it('asks for a code, and offers a resend', async () => {
    const handlers = renderChallenge({
      strategy: 'email_code',
      identifier: 'i••••@clerk.dev',
      value: '',
      status: 'idle',
      errors: {},
      resend,
    });

    expect(screen.getByRole('textbox', { name: 'Verification code' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resend' }));
    expect(handlers.onResend).toHaveBeenCalledOnce();
  });

  it('reports a wrong answer', () => {
    renderChallenge({
      strategy: 'password',
      value: '',
      status: 'error',
      errors: { field: 'Incorrect password.' },
      resend,
    });

    expect(screen.getByText('Incorrect password.')).toBeInTheDocument();
  });

  it('cancels the challenge, which is what declines the mutation underneath', async () => {
    const handlers = renderChallenge({ strategy: 'password', value: 'x', status: 'idle', errors: {}, resend });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handlers.onCancel).toHaveBeenCalledOnce();
  });
});
