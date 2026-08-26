import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type {
  ReverificationDialogChooseProps,
  ReverificationDialogMessageProps,
  ReverificationDialogVerifyProps,
} from './reverification-dialog';
import { ReverificationDialog } from './reverification-dialog';

const base = {
  open: true as const,
  onOpenChange: vi.fn(),
  dismissible: true,
  closeLabel: 'Close',
};

function renderBlock(props: Parameters<typeof ReverificationDialog>[0]) {
  return render(
    <MosaicProvider>
      <ReverificationDialog {...props} />
    </MosaicProvider>,
  );
}

const chooseProps = (overrides: Partial<ReverificationDialogChooseProps> = {}): ReverificationDialogChooseProps => ({
  ...base,
  step: 'choose',
  title: 'Use another method',
  description: 'Facing issues? You can use any of these methods for verification.',
  methods: [
    { id: 'password', label: 'Continue with your password' },
    { id: 'email_1', label: 'Email code to a••••@clerk.dev' },
  ],
  onSelectMethod: vi.fn(),
  cancelLabel: 'Cancel',
  help: { label: 'Get help', onClick: vi.fn() },
  ...overrides,
});

const verifyProps = (overrides: Partial<ReverificationDialogVerifyProps> = {}): ReverificationDialogVerifyProps => ({
  ...base,
  step: 'verify',
  title: 'Verification required',
  description: 'Enter your current password to continue',
  field: { label: 'Password', kind: 'password', value: '', disabled: false, onChange: vi.fn() },
  submitLabel: 'Continue',
  pendingLabel: 'Verifying',
  canSubmit: false,
  isPending: false,
  onSubmit: vi.fn(),
  cancelLabel: 'Cancel',
  ...overrides,
});

const messageProps = (overrides: Partial<ReverificationDialogMessageProps> = {}): ReverificationDialogMessageProps => ({
  ...base,
  step: 'message',
  title: 'Get help',
  description: 'Email us and we will work with you to restore access.',
  action: { label: 'Email support', onClick: vi.fn() },
  ...overrides,
});

describe('ReverificationDialog', () => {
  it('renders nothing until the caller opens it', () => {
    renderBlock(verifyProps({ open: false }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes every close request while the caller says it is not dismissible', async () => {
    const onOpenChange = vi.fn();
    renderBlock(verifyProps({ dismissible: false, onOpenChange }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    await userEvent.setup().keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('hands back the id of the chosen method', async () => {
    const onSelectMethod = vi.fn();
    renderBlock(chooseProps({ onSelectMethod }));

    await userEvent.setup().click(screen.getByRole('button', { name: 'Email code to a••••@clerk.dev' }));

    expect(onSelectMethod).toHaveBeenCalledWith('email_1');
  });

  it('offers back in place of cancel only when the caller supplies it', () => {
    const { rerender } = renderBlock(chooseProps());
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    rerender(
      <MosaicProvider>
        <ReverificationDialog {...chooseProps({ back: { label: 'Back', onClick: vi.fn() } })} />
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('submits the field with Enter, since the action sits outside the form', async () => {
    const onSubmit = vi.fn();
    renderBlock(verifyProps({ canSubmit: true, onSubmit }));

    await userEvent.setup().type(screen.getByLabelText('Password'), '{Enter}');

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('holds the action while the caller says it cannot submit', async () => {
    const onSubmit = vi.fn();
    renderBlock(verifyProps({ canSubmit: false, onSubmit }));

    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders a code as per-character slots that take digits only', async () => {
    const onChange = vi.fn();
    renderBlock(
      verifyProps({
        field: { label: 'Verification code', kind: 'code', value: '', disabled: false, onChange },
      }),
    );
    const user = userEvent.setup();

    const slots = within(screen.getByRole('group', { name: 'Verification code' })).getAllByRole('textbox');
    expect(slots).toHaveLength(6);

    await user.type(slots[0], '1');
    expect(onChange).toHaveBeenCalledWith('1');

    onChange.mockClear();
    await user.type(slots[0], 'a');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('points the code label at the first slot, so clicking it starts the caret there', async () => {
    renderBlock(
      verifyProps({
        field: { label: 'Verification code', kind: 'code', value: '', disabled: false, onChange: vi.fn() },
      }),
    );

    await userEvent.setup().click(screen.getByText('Verification code'));

    expect(screen.getByRole('textbox', { name: 'Character 1 of 6' })).toHaveFocus();
  });

  it('renders a method with nothing to type as a bare action', () => {
    renderBlock(verifyProps({ field: undefined, submitLabel: 'Use your passkey', canSubmit: true }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use your passkey' })).toBeEnabled();
  });

  it('announces the pending action and blocks a second submit', async () => {
    const onSubmit = vi.fn();
    renderBlock(verifyProps({ canSubmit: true, isPending: true, onSubmit }));

    const submit = screen.getByRole('button', { name: 'Continue' });
    expect(submit).toHaveAttribute('aria-busy', 'true');

    await userEvent.setup().click(submit);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a field error against the field and a step error as an alert', () => {
    renderBlock(
      verifyProps({
        error: 'Too many attempts. Try again later.',
        field: {
          label: 'Password',
          kind: 'password',
          value: 'wrong',
          disabled: false,
          error: 'Incorrect password.',
          onChange: vi.fn(),
        },
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts. Try again later.');
    expect(screen.getByText('Incorrect password.')).toBeInTheDocument();
  });

  it('renders the resend label the caller composed, inert while it says so', async () => {
    const onResend = vi.fn();
    renderBlock(verifyProps({ resend: { label: 'Didn’t receive a code? Resend (29)', disabled: true, onResend } }));

    const resend = screen.getByRole('button', { name: 'Didn’t receive a code? Resend (29)' });
    expect(resend).toHaveAttribute('aria-disabled', 'true');

    await userEvent.setup().click(resend);
    expect(onResend).not.toHaveBeenCalled();
  });

  it('leads a dead end with the way forward, not the way back', async () => {
    const onClick = vi.fn();
    renderBlock(messageProps({ action: { label: 'Email support', onClick } }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Email support' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('offers a way back from a dead end only when the caller supplies one', async () => {
    const onClick = vi.fn();
    const { rerender } = renderBlock(messageProps());
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    rerender(
      <MosaicProvider>
        <ReverificationDialog {...messageProps({ secondary: { label: 'Back', onClick } })} />
      </MosaicProvider>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
