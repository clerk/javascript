import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationCompleteResult,
  ReverificationEmailCodeFactor,
  ReverificationPasskeyFactor,
  ReverificationPasswordFactor,
  ReverificationPreparationFactor,
} from './reverification-dialog.types';
import { ReverificationDialogView } from './reverification-dialog.view';

const passwordFactor: ReverificationPasswordFactor = {
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const passkeyFactor: ReverificationPasskeyFactor = {
  stage: 'first',
  strategy: 'passkey',
};

function renderView({
  initialChallenge = {
    status: 'needs_first_factor',
    factors: [passwordFactor, emailFactor],
    initialFactor: passwordFactor,
  } as ReverificationChallenge,
  prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockResolvedValue(undefined),
  attempt = vi
    .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
    .mockResolvedValue({ status: 'complete', sessionId: 'sess_1' }),
  onComplete = vi.fn<(result: ReverificationCompleteResult) => Promise<void>>().mockResolvedValue(undefined),
  onCancel = vi.fn(),
  supportEmail = 'support@clerk.dev',
} = {}) {
  render(
    <MosaicProvider>
      <ReverificationDialogView
        initialChallenge={initialChallenge}
        prepare={prepare}
        attempt={attempt}
        onComplete={onComplete}
        onCancel={onCancel}
        supportEmail={supportEmail}
      />
    </MosaicProvider>,
  );
  return { prepare, attempt, onComplete, onCancel, supportEmail };
}

/** The code field is a group of single-character slots, not one input. */
const codeSlots = () => within(screen.getByRole('group', { name: 'Verification code' })).getAllByRole('textbox');

describe('ReverificationDialogView', () => {
  it('opens on the starting method and carries its answer to the attempt', async () => {
    const { attempt, onComplete } = renderView();
    const user = userEvent.setup();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(attempt).toHaveBeenCalledWith({ factor: passwordFactor, password: 'secret' }));
    expect(onComplete).toHaveBeenCalledWith({ status: 'complete', sessionId: 'sess_1' });
  });

  it('sends the code behind the code step and submits six digits without a press', async () => {
    const { prepare, attempt } = renderView({
      initialChallenge: {
        status: 'needs_first_factor',
        factors: [passwordFactor, emailFactor],
        initialFactor: emailFactor,
      },
    });

    await waitFor(() => expect(prepare).toHaveBeenCalledWith(emailFactor));
    expect(await screen.findByText('Enter the code sent to your email to continue')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(codeSlots()[0]);
    // Typed as keystrokes rather than into one slot: the primitive walks focus along as it fills.
    await user.keyboard('123456');

    await waitFor(() => expect(attempt).toHaveBeenCalledWith({ factor: emailFactor, code: '123456' }));
  });

  it('holds the code field inert while the code is still being sent', async () => {
    let release = () => {};
    const prepare = vi.fn<(factor: ReverificationPreparationFactor) => Promise<void>>().mockReturnValue(
      new Promise<void>(resolve => {
        release = resolve;
      }),
    );
    renderView({
      initialChallenge: {
        status: 'needs_first_factor',
        factors: [passwordFactor, emailFactor],
        initialFactor: emailFactor,
      },
      prepare,
    });

    // The machine takes no keystroke until the code is out, so an editable-looking field would
    // swallow one.
    await waitFor(() => expect(codeSlots()[0]).toBeDisabled());

    release();
    await waitFor(() => expect(codeSlots()[0]).toBeEnabled());
  });

  it('lists the other methods by their localized labels, current one excluded', async () => {
    renderView();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Use another method' }));

    expect(screen.getByRole('button', { name: 'Email code to a••••@clerk.dev' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue with your password' })).not.toBeInTheDocument();
  });

  it('switches to the method the user picks', async () => {
    const { prepare } = renderView();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Use another method' }));
    await user.click(screen.getByRole('button', { name: 'Email code to a••••@clerk.dev' }));

    await waitFor(() => expect(prepare).toHaveBeenCalledWith(emailFactor));
  });

  it('keeps the code step when the code could not be sent, and resends from there', async () => {
    const prepare = vi
      .fn<(factor: ReverificationPreparationFactor) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not send the code.'))
      .mockResolvedValue(undefined);
    renderView({
      initialChallenge: {
        status: 'needs_first_factor',
        factors: [passwordFactor, emailFactor],
        initialFactor: emailFactor,
      },
      prepare,
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not send the code.');
    expect(codeSlots()).toHaveLength(6);

    await userEvent.setup().click(screen.getByRole('button', { name: /Resend/ }));

    await waitFor(() => expect(prepare).toHaveBeenCalledTimes(2));
  });

  it('counts the resend cooldown down in the label and holds the button inert', async () => {
    renderView({
      initialChallenge: {
        status: 'needs_first_factor',
        factors: [passwordFactor, emailFactor],
        initialFactor: emailFactor,
      },
    });

    const resend = await screen.findByRole('button', { name: 'Didn’t receive a code? Resend (30)' });
    expect(resend).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders a passkey as an action with nothing to type', async () => {
    renderView({
      initialChallenge: { status: 'needs_first_factor', factors: [passkeyFactor], initialFactor: passkeyFactor },
    });

    expect(await screen.findByRole('button', { name: 'Use your passkey' })).toBeEnabled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('offers help instead of alternatives when there is only one method', async () => {
    renderView({
      initialChallenge: { status: 'needs_first_factor', factors: [passwordFactor], initialFactor: passwordFactor },
    });
    const user = userEvent.setup();

    expect(screen.queryByRole('button', { name: 'Use another method' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Get help' }));

    expect(screen.getByText(/email us and we will work with you/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email support' })).toBeInTheDocument();
  });

  it('sends a stuck user to support, the only thing left that can help them', async () => {
    const location = { href: '' };
    Object.defineProperty(window, 'location', { value: location, writable: true });
    renderView({ initialChallenge: { status: 'needs_first_factor', factors: [] } });

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Email support' }));

    expect(location.href).toBe('mailto:support@clerk.dev');
  });

  it('leaves no way back from a dead end with no method to go back to', async () => {
    renderView({ initialChallenge: { status: 'needs_first_factor', factors: [] } });

    expect(await screen.findByRole('button', { name: 'Email support' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('holds the dialog open and pending while the caller completes', async () => {
    let finish = () => {};
    const onComplete = vi.fn<(result: ReverificationCompleteResult) => Promise<void>>().mockReturnValue(
      new Promise<void>(resolve => {
        finish = resolve;
      }),
    );
    const { onCancel } = renderView({ onComplete });
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    finish();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('retries only completion after verification has succeeded', async () => {
    const onComplete = vi
      .fn<(result: ReverificationCompleteResult) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not activate the session.'))
      .mockResolvedValue(undefined);
    const { attempt, onCancel } = renderView({ onComplete });
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Couldn’t complete verification')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not activate the session.');
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(attempt).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledTimes(2);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('says so when the account has no method to offer', async () => {
    renderView({ initialChallenge: { status: 'needs_first_factor', factors: [] } });

    expect(await screen.findByText('Cannot verify your account')).toBeInTheDocument();
  });

  it('reports the failure against the field and lets the user try again', async () => {
    const attempt = vi
      .fn<(attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>>()
      .mockRejectedValue({ scope: 'answer', message: 'Incorrect password.' });
    renderView({ attempt });
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Password'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Incorrect password.')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeEnabled();
  });

  it('closes and reports cancellation when the user backs out', async () => {
    const { onCancel } = renderView();

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
