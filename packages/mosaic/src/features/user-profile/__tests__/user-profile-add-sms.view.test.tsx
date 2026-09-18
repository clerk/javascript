import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { UserProfileMfaSetupViewProps } from '../user-profile-mfa-setup.view';
import { MfaSetupDialog } from './mfa-test-utils';

type ViewProps = UserProfileMfaSetupViewProps['sms'];

function renderView(overrides: Partial<ViewProps> = {}) {
  const props: ViewProps = {
    step: 'select',
    phoneNumbers: [
      { id: 'personal', phoneNumber: '+18015550100' },
      { id: 'work', phoneNumber: '+18015550200' },
    ],
    selectedPhoneId: 'personal',
    onSelectedPhoneIdChange: vi.fn(),
    onAddPhone: vi.fn(),
    onBack: vi.fn(),
    phoneNumber: '+18015550100',
    onPhoneNumberChange: vi.fn(),
    code: '',
    onCodeChange: vi.fn(),
    onSubmit: vi.fn(),
    onResend: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MfaSetupDialog
        step='sms'
        sms={props}
      />,
    ),
  };
}

describe('UserProfileAddSmsView', () => {
  it('adds and verifies a new number in the same dialog, preserving the number on Back', async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn();
    function Example() {
      const [step, setStep] = useState<ViewProps['step']>('select');
      const [phoneNumber, setPhoneNumber] = useState('+18015550300');
      const [code, setCode] = useState('');
      return (
        <MfaSetupDialog
          step='sms'
          sms={{
            step,
            phoneNumbers: [],
            selectedPhoneId: '',
            onSelectedPhoneIdChange: vi.fn(),
            onAddPhone: () => setStep('phone'),
            onBack: () => setStep(step === 'verify' ? 'phone' : 'select'),
            phoneNumber,
            onPhoneNumberChange: setPhoneNumber,
            code,
            onCodeChange: setCode,
            onSubmit: value => (step === 'phone' ? setStep('verify') : onVerify(value)),
            onResend: vi.fn(),
          }}
        />
      );
    }
    render(<Example />);
    const dialog = screen.getByRole('dialog');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Add a new phone number' }));
    expect(screen.getByRole('dialog', { name: 'Add phone number' })).toBe(dialog);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(screen.getByRole('dialog', { name: 'Verify your phone number' })).toBe(dialog);
    expect(screen.getByText('Enter the code sent to +1 (801) 555-0300')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveFocus());

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('(801) 555-0300');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await user.type(screen.getByRole('textbox', { name: 'Verification code' }), '123456');
    expect(onVerify).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it.each([
    { step: 'select', action: 'Continue', role: 'combobox', name: 'Phone number +1 (801) 555-0100' },
    { step: 'phone', action: 'Send code', role: 'textbox', name: 'Phone' },
    { step: 'verify', action: 'Verify', role: 'textbox', name: 'Verification code' },
  ] as const)(
    'blocks repeat submissions and supports retry on the $step step',
    async ({ step, action, role, name }) => {
      const user = userEvent.setup();
      const { props, rerender } = renderView({ step, code: '123456', isPending: true });
      const field = screen.getByRole(role, { name });
      expect(field).toBeDisabled();
      const submit = screen.getByRole('button', { name: action, exact: true });
      expect(submit).toHaveAttribute('aria-busy', 'true');
      await user.click(submit);
      const form = field.closest('form');
      if (!form) {
        throw new Error('Step form missing');
      }
      form.requestSubmit();
      expect(props.onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

      rerender(
        <MfaSetupDialog
          step='sms'
          sms={{ ...props, isPending: false, errorMessage: 'Please try again.' }}
        />,
      );
      expect(screen.getByRole(role, { name })).toHaveAttribute('aria-invalid', 'true');
      const describedControl =
        step === 'verify' ? screen.getByRole('group', { name }) : screen.getByRole(role, { name });
      expect(describedControl).toHaveAccessibleDescription('Please try again.');
      await user.click(screen.getByRole('button', { name: action, exact: true }));
      expect(props.onSubmit).toHaveBeenCalledOnce();
    },
  );

  it('waits for resend to finish before allowing verification or Back', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ step: 'verify', code: '123456', isResending: true });
    const code = screen.getByRole('textbox', { name: 'Verification code' });
    expect(code).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Verify', exact: true })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sending a new code…' })).toBeDisabled();

    rerender(
      <MfaSetupDialog
        step='sms'
        sms={{ ...props, isResending: false, resendSeconds: 12 }}
      />,
    );
    expect(code).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Didn’t receive a code? Resend (12)' })).toBeDisabled();
    rerender(
      <MfaSetupDialog
        step='sms'
        sms={{ ...props, isResending: false, resendSeconds: 0 }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Didn’t receive a code? Resend' }));
    expect(props.onResend).toHaveBeenCalledOnce();
  });
});
