import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useForm } from '../../../components/form';
import type { SignInStep, SignInValues } from '../sign-in.types';
import { SignInView } from '../sign-in.view';

afterEach(() => cleanup());

const svg = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#6c47ff"/></svg>`,
  )}`;

const SQUARE_LOGO = svg(64, 64);
const WIDE_LOGO = svg(240, 48);
const BROKEN_IMAGE = 'data:image/png;base64,broken';

const EMAIL_STEP: SignInStep = { kind: 'identifier', field: 'email' };
const CODE_STEP: SignInStep = { kind: 'code', purpose: 'first-factor', channel: 'email', identifier: 'jane@acme.com' };

const VALUES: SignInValues = {
  identifier: 'jane@acme.com',
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

function View({ step, logoUrl }: { step: SignInStep; logoUrl?: string }) {
  const form = useForm<SignInValues>({ initialValues: VALUES, onSubmit: () => Promise.resolve() });
  return (
    <div data-testid='view'>
      <SignInView
        step={step}
        applicationName='Acme'
        applicationLogoUrl={logoUrl}
        combined={false}
        socialProviders={[]}
        onSelectProvider={noop}
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
    </div>
  );
}

const find = (selector: string) => screen.getByTestId('view').querySelector<HTMLElement>(selector);
const logo = () => find('.cl-auth-mark-logo');

describe('SignInMark', () => {
  it('shows the application logo, hidden from assistive tech', async () => {
    render(
      <View
        step={EMAIL_STEP}
        logoUrl={SQUARE_LOGO}
      />,
    );

    await waitFor(() => expect(logo()).toHaveAttribute('data-shape', 'square'));
    expect(find('.cl-card-lead')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the logo once the user is known', async () => {
    for (const logoUrl of [SQUARE_LOGO, WIDE_LOGO]) {
      const { unmount } = render(
        <View
          step={CODE_STEP}
          logoUrl={logoUrl}
        />,
      );

      await waitFor(() => expect(logo()).not.toBeNull());
      unmount();
    }
  });

  it('drops the lead when the logo fails to load', async () => {
    render(
      <View
        step={CODE_STEP}
        logoUrl={BROKEN_IMAGE}
      />,
    );

    await waitFor(() => expect(find('.cl-card-lead')).toBeNull());
  });
});
