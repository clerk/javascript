import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useForm } from '../../../components/form';
import type { SignInProvider, SignInStep, SignInValues } from '../sign-in.types';
import { SignInView } from '../sign-in.view';

afterEach(() => cleanup());

const PROVIDERS: SignInProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' },
];

const VALUES: SignInValues = {
  identifier: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

const noop = () => undefined;

function Step({
  step,
  identifier = '',
  onSelectFactor = noop,
  onChangeAddress,
  onCancel,
}: {
  step: SignInStep;
  identifier?: string;
  onSelectFactor?: (id: string) => void;
  onChangeAddress?: () => void;
  onCancel?: () => void;
}) {
  const form = useForm<SignInValues>({ initialValues: { ...VALUES, identifier }, onSubmit: () => Promise.resolve() });
  return (
    <SignInView
      step={step}
      applicationName='Acme'
      combined={false}
      socialProviders={PROVIDERS}
      onSelectProvider={noop}
      onPasskey={noop}
      form={form}
      onSubmit={noop}
      onCodeComplete={noop}
      isPending={false}
      isDisabled={false}
      onEditIdentifier={noop}
      onShowHelp={noop}
      onBack={noop}
      onEmailSupport={noop}
      onSelectFactor={onSelectFactor}
      onChangeAddress={onChangeAddress}
      onCancel={onCancel}
      canResend
    />
  );
}

describe('Sign-in steps', () => {
  it('gives password managers the account the password belongs to', () => {
    render(<Step step={{ kind: 'credential', credential: 'password', identifier: 'ada@acme.com' }} />);

    const username = document.querySelector<HTMLInputElement>('input[autocomplete="username"]');
    expect(username?.value).toBe('ada@acme.com');
    expect(username?.form).toBe(document.querySelector('input[autocomplete="current-password"]')?.closest('form'));
  });

  it('offers one button for every other way to sign in on the password step', () => {
    render(
      <Step
        step={{
          kind: 'credential',
          credential: 'password',
          identifier: 'ada@acme.com',
          alternatives: [
            { id: 'email', stage: 'first', strategy: 'email_code', emailAddressId: 'e1', identifier: 'ada@acme.com' },
            { id: 'phone', stage: 'first', strategy: 'phone_code', phoneNumberId: 'p1', identifier: '+1 ••• 0123' },
            { id: 'passkey', stage: 'first', strategy: 'passkey' },
          ],
        }}
        onCancel={noop}
      />,
    );

    expect(screen.queryByRole('button', { name: /passkey|sign-in code|More options/ })).toBeNull();
    const gap =
      screen.getByRole('button', { name: 'Sign in another way' }).getBoundingClientRect().top -
      screen.getByRole('button', { name: 'Continue' }).getBoundingClientRect().bottom;
    expect(gap).toBe(8);
  });

  it('offers one button for every other way to verify on the second-factor code step', () => {
    const onCancel = vi.fn();
    render(
      <Step
        onCancel={onCancel}
        step={{
          kind: 'code',
          purpose: 'second-factor',
          channel: 'totp',
          methods: [
            { id: 'backup', stage: 'second', strategy: 'backup_code' },
            { id: 'passkey', stage: 'second', strategy: 'passkey' },
          ],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: /passkey|backup code/i })).toBeNull();
    const other = screen.getByRole('button', { name: 'Verify another way' });
    const account = screen.getByRole('button', { name: 'Use a different account' });
    expect(account.getBoundingClientRect().top - other.getBoundingClientRect().bottom).toBeLessThanOrEqual(16);

    other.click();
    expect(onCancel).toHaveBeenCalled();
  });

  it('lets the user send the code to another address when the app offers it', () => {
    const onChangeAddress = vi.fn();
    const step: SignInStep = {
      kind: 'code',
      purpose: 'first-factor',
      channel: 'email',
      identifier: 'j***@acme.com',
      alternatives: [{ id: 'email_code_2', identifier: 'j***@gmail.com' }],
    };
    const { unmount } = render(
      <Step
        step={step}
        onChangeAddress={onChangeAddress}
      />,
    );

    screen.getByRole('button', { name: 'Send to another email' }).click();
    expect(onChangeAddress).toHaveBeenCalledTimes(1);
    unmount();

    render(<Step step={step} />);
    expect(screen.queryByRole('button', { name: 'Send to another email' })).toBeNull();
  });

  it('keeps the other-method button on a second-factor code step with no alternatives', () => {
    render(
      <Step
        onCancel={noop}
        step={{ kind: 'code', purpose: 'second-factor', channel: 'totp' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Verify another way' })).toBeInTheDocument();
  });

  it('offers no social providers when choosing a second factor', () => {
    render(
      <Step
        step={{
          kind: 'choice',
          purpose: 'methods',
          options: [
            { id: 'totp', stage: 'second', strategy: 'totp' },
            { id: 'backup', stage: 'second', strategy: 'backup_code' },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Verify another way' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
  });

  it('lets people leave a backup-code screen for another account', () => {
    render(<Step step={{ kind: 'credential', credential: 'backup-code', identifier: 'ada@acme.com' }} />);

    expect(screen.getByRole('button', { name: 'Back to sign-in' })).toBeDefined();
  });

  it('says no account uses the email before asking for sign-up details', () => {
    render(
      <Step
        step={{ kind: 'sign-up', fields: {} }}
        identifier='nina@acme.co'
      />,
    );

    expect(screen.getByText(/No Acme account uses nina@acme.co\./)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Change email' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
  });

  it('lists each method as one button, passkey first, and leaves the address to the next step', () => {
    const onSelectFactor = vi.fn();
    render(
      <Step
        onSelectFactor={onSelectFactor}
        step={{
          kind: 'choice',
          purpose: 'methods',
          options: [
            { id: 'work', stage: 'first', strategy: 'email_code', emailAddressId: 'e1', identifier: 'j***@acme.com' },
            {
              id: 'home',
              stage: 'first',
              strategy: 'email_code',
              emailAddressId: 'e2',
              identifier: 'j***@gmail.com',
              primary: true,
            },
            { id: 'phone', stage: 'first', strategy: 'phone_code', phoneNumberId: 'p1', identifier: '+1 ••• 0123' },
            { id: 'passkey', stage: 'first', strategy: 'passkey' },
          ],
        }}
      />,
    );

    const buttons = screen.getAllByRole('button', { name: /passkey|sign-in code/ });
    expect(buttons.map(button => button.textContent)).toEqual([
      expect.stringContaining('Sign in with a passkey'),
      expect.stringContaining('Email sign-in code'),
      expect.stringContaining('Text sign-in code'),
    ]);
    expect(screen.queryByText(/j\*\*\*@/)).toBeNull();
    expect(screen.queryByText(/0123/)).toBeNull();
    screen.getByRole('button', { name: /Email sign-in code/ }).click();
    expect(onSelectFactor).toHaveBeenCalledWith('work');
  });

  it('lists the primary address first and sends as soon as an address is chosen', () => {
    const onSelectFactor = vi.fn();
    render(
      <Step
        onSelectFactor={onSelectFactor}
        step={{
          kind: 'choice',
          purpose: 'addresses',
          options: [
            { id: 'work', stage: 'first', strategy: 'email_code', emailAddressId: 'e1', identifier: 'j***@acme.com' },
            {
              id: 'home',
              stage: 'first',
              strategy: 'email_code',
              emailAddressId: 'e2',
              identifier: 'j***@gmail.com',
              primary: true,
            },
          ],
        }}
      />,
    );

    const addresses = screen.getAllByRole('button', { name: /j\*\*\*@/ });
    expect(addresses[0]).toHaveAccessibleName(/j\*\*\*@gmail\.com/);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send code' })).toBeNull();

    screen.getByRole('button', { name: /j\*\*\*@acme\.com/ }).click();
    expect(onSelectFactor).toHaveBeenCalledWith('work');
  });
});
