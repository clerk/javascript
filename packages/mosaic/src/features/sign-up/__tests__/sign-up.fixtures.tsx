import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { onTestFinished } from 'vitest';

import { type FakeFapiSeed, serveFapi, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import { fapiEnvironment, type FapiEnvironmentOverrides, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp, type SignUpProps } from '../sign-up';

export const EMAIL = 'alice@example.com';
export const OTHER_EMAIL = 'alice@acme.test';
export const signedInSession = fapiSession({ id: 'sess_existing', user: fapiUser({ id: 'user_existing' }) });
export const PASSWORD = 'correct-horse-battery';
export const SHORT_PASSWORD = 'abc123';

export function environment({ attributes, ...overrides }: FapiEnvironmentOverrides = {}) {
  return fapiEnvironment({
    attributes: { email_address: { required: true }, password: { required: true }, ...attributes },
    ...overrides,
  });
}

export function minimumPasswordLength(min_length: number) {
  return environment({
    user_settings: { password_settings: { ...fapiEnvironment().user_settings.password_settings, min_length } },
  });
}

export async function renderSignUp(
  seed: FakeFapiSeed = {},
  props: SignUpProps = {},
  options?: Parameters<typeof renderWithClerk>[1],
) {
  const fapi = serveFapi({ environment: environment(), ...seed });
  const view = await renderWithClerk(<SignUp {...props} />, options);
  const user = userEvent.setup();
  return { ...view, fapi, user };
}

export function RouteProbe() {
  const write = useVirtualWrite();
  return (
    <>
      <button
        type='button'
        onClick={() => write('/sign-up', [])}
      >
        Open the start route
      </button>
      <button
        type='button'
        onClick={() => write('/sign-up', ['verify-email-address'])}
      >
        Open the verify route
      </button>
      <button
        type='button'
        onClick={() => write('/sign-up', ['continue'])}
      >
        Open the continue route
      </button>
    </>
  );
}

export async function renderSignUpWithRouteProbe(seed: FakeFapiSeed = {}) {
  const fapi = serveFapi({ environment: environment(), ...seed });
  const view = await renderWithClerk(
    <>
      <SignUp />
      <RouteProbe />
    </>,
  );
  const user = userEvent.setup();
  await screen.findByRole('heading', { name: 'Create your account' });
  return { ...view, fapi, user };
}

export function visitWithQuery(query: string) {
  const original = window.location.href;
  window.history.replaceState(null, '', query);
  onTestFinished(() => window.history.replaceState(null, '', original));
}

export const emailField = () => screen.getByRole('textbox', { name: 'Email address' });
export const passwordField = () => screen.getByLabelText('Password', { selector: 'input' });
export const continueButton = () => screen.getByRole('button', { name: 'Continue' });

export async function submitStart(user: ReturnType<typeof userEvent.setup>, email = EMAIL) {
  await user.type(await screen.findByRole('textbox', { name: 'Email address' }), email);
  await user.type(passwordField(), PASSWORD);
  await user.click(continueButton());
}

export function watchFor(appeared: () => boolean) {
  let seen = false;
  const observer = new MutationObserver(() => {
    seen ||= appeared();
  });
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  return () => {
    observer.disconnect();
    return seen;
  };
}

export const watchForHeading = (name: string | RegExp) =>
  watchFor(() => screen.queryByRole('heading', { name }) !== null);

export const codeSent = () => screen.findByRole('button', { name: /^Resend \(\d+\)$/ });

export async function enterCode(user: ReturnType<typeof userEvent.setup>, code = VERIFICATION_CODE) {
  await codeSent();
  await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
  await user.keyboard(code);
}
