import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useForm } from '../../../components/form';
import type { SignInProvider, SignInValues } from '../sign-in.types';
import { SignInView } from '../sign-in.view';

afterEach(() => cleanup());

const PROVIDERS: SignInProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' },
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

function Start({
  lastUsedProviderId,
  providers = PROVIDERS,
}: {
  lastUsedProviderId?: string;
  providers?: SignInProvider[];
}) {
  const form = useForm<SignInValues>({ initialValues: VALUES, onSubmit: () => Promise.resolve() });
  return (
    <SignInView
      step={{ kind: 'identifier', field: 'email' }}
      applicationName='Acme'
      combined={false}
      socialProviders={providers}
      lastUsedProviderId={lastUsedProviderId}
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
      onSelectFactor={noop}
      canResend
    />
  );
}

const top = (name: RegExp) => screen.getByRole('button', { name }).getBoundingClientRect().top;

describe('Sign-in passkey option', () => {
  it('stacks with two providers, one full-width row each, above the divider', () => {
    render(<Start />);

    const divider = screen.getByRole('separator').getBoundingClientRect().top;
    expect(top(/Continue with Google/)).toBeLessThan(top(/Continue with GitHub/));
    expect(top(/Continue with GitHub/)).toBeLessThan(top(/Continue with a passkey/));
    expect(top(/Continue with a passkey/)).toBeLessThan(divider);
    expect(screen.getByRole('button', { name: /Continue with a passkey/ }).getBoundingClientRect().width).toBe(
      screen.getByRole('button', { name: /Continue with Google/ }).getBoundingClientRect().width,
    );
  });

  it('keeps the passkey on its own row below a single provider', () => {
    render(<Start providers={PROVIDERS.slice(0, 1)} />);

    expect(top(/Google/)).toBeLessThan(top(/Continue with a passkey/));
    expect(top(/Continue with a passkey/)).toBeLessThan(screen.getByRole('separator').getBoundingClientRect().top);
  });

  it('joins the icon row once the providers and the passkey make four buttons', () => {
    const apple: SignInProvider = { ...PROVIDERS[0], id: 'oauth_apple', name: 'Apple' };
    render(<Start providers={[...PROVIDERS, apple]} />);

    expect(top(/passkey/i)).toBe(top(/Google/));
  });

  it('joins the icon row below a last-used provider once there are four buttons', () => {
    const apple: SignInProvider = { ...PROVIDERS[0], id: 'oauth_apple', name: 'Apple' };
    render(
      <Start
        providers={[...PROVIDERS, apple]}
        lastUsedProviderId='oauth_google'
      />,
    );

    expect(top(/Continue with Google/)).toBeLessThan(top(/GitHub/));
    expect(top(/passkey/i)).toBe(top(/GitHub/));
    expect(top(/Apple/)).toBe(top(/GitHub/));
  });

  it('comes first when it was the last method used', () => {
    render(<Start lastUsedProviderId='passkey' />);

    expect(top(/Continue with a passkey/)).toBeLessThan(top(/Continue with Google/));
    expect(screen.getByRole('button', { name: /Continue with a passkey/ })).toHaveAccessibleName(/Last used/);
  });
});
