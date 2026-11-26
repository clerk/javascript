import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSignUp } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp } from '../sign-up';
import {
  continueButton,
  EMAIL,
  emailField,
  environment,
  renderSignUp,
  renderSignUpWithRouteProbe,
  submitStart,
} from './sign-up.fixtures';

const IDP_URL = 'https://idp.example/sso?strategy=enterprise_sso';
const SEVERAL_CONNECTIONS = 'An enterprise connection ID is required when the domain has several connections.';
const HOLD = { timeout: 4000 };

const oneConnection: FakeFapiSeed = {
  signUp: { enterpriseDomains: ['example.com'], oauth: { enterprise_sso: { emailAddress: EMAIL } } },
};
const severalConnections: FakeFapiSeed = {
  signUp: { enterpriseDomains: ['example.com'], enterpriseConnectionCount: 2 },
};

const starts = (fapi: ReturnType<typeof serveFapi>) =>
  [...fapi.signUp.creations, ...fapi.signUp.updates].filter(body => body.get('strategy') === 'enterprise_sso');

afterEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
});

async function submitEnterpriseEmail(
  seed: FakeFapiSeed = oneConnection,
  options?: Parameters<typeof renderWithClerk>[1],
) {
  const first = await renderSignUp(seed, {}, options);
  const leave = vi.spyOn(first.clerk, '__internal_windowNavigate').mockImplementation(() => {});
  await submitStart(first.user);
  return { ...first, leave };
}

function OpenOnEnterpriseRoute() {
  const write = useVirtualWrite();
  const [opened, setOpened] = useState(false);
  return opened ? (
    <SignUp />
  ) : (
    <button
      type='button'
      onClick={() => {
        write('/sign-up', ['enterprise-connections']);
        setOpened(true);
      }}
    >
      Open sign-up on the enterprise route
    </button>
  );
}

async function arriveOnEnterpriseRoute(seed: FakeFapiSeed) {
  const fapi = serveFapi({
    environment: environment(),
    client: {
      ...fapiClient(),
      sign_up: fapiSignUp({ email_address: EMAIL, has_password: true, missing_fields: ['enterprise_sso'] }),
    },
    ...seed,
  });
  const view = await renderWithClerk(<OpenOnEnterpriseRoute />);
  const leave = vi.spyOn(view.clerk, '__internal_windowNavigate').mockImplementation(() => {});
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Open sign-up on the enterprise route' }));
  return { ...view, fapi, leave, user };
}

describe('submitting the form with an email that belongs to an enterprise connection', () => {
  it('keeps the form busy and sends the user to the identity provider from the sign-up they started', async () => {
    const { fapi, leave } = await submitEnterpriseEmail();

    await waitFor(() => expect(leave).toHaveBeenCalled());

    expect(String(leave.mock.calls[0][0])).toBe(IDP_URL);
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(continueButton()).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(starts(fapi)).toHaveLength(1);
    expect(new URL(starts(fapi)[0].get('redirect_url') ?? '').searchParams.get('__clerk_mosaic_sign_up')).toBe(
      'sso-callback',
    );
    expect(fapi.client.sign_up?.email_address).toBe(EMAIL);
  });

  it('gives the form back with the email kept when the browser is still on the page, and starts again on the next Continue', async () => {
    const { fapi, leave, user } = await submitEnterpriseEmail();
    await waitFor(() => expect(leave).toHaveBeenCalled());

    await waitFor(() => expect(continueButton()).not.toHaveAttribute('aria-busy', 'true'), HOLD);

    expect(emailField()).toHaveValue(EMAIL);
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(starts(fapi)).toHaveLength(1);

    await user.click(continueButton());

    await waitFor(() => expect(leave).toHaveBeenCalledTimes(2));
    expect(starts(fapi)).toHaveLength(2);
  });

  it('shows why the redirect could not start on the form', async () => {
    const { leave } = await submitEnterpriseEmail(severalConnections);

    expect(await screen.findByText(SEVERAL_CONNECTIONS)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
    expect(continueButton()).not.toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(leave).not.toHaveBeenCalled();
  });

  it('finishes the sign-up when the user comes back from the identity provider', async () => {
    const { fapi, leave, unmount } = await submitEnterpriseEmail(oneConnection, {
      signUpFallbackRedirectUrl: '/welcome',
    });
    await waitFor(() => expect(leave).toHaveBeenCalled());
    const callback = new URL(starts(fapi)[0].get('redirect_url') ?? '');

    unmount();
    fapi.signUp.returnFromOAuth();
    window.history.replaceState(null, '', `${callback.pathname}${callback.search}`);
    const { navigate } = await renderWithClerk(<SignUp />, { signUpFallbackRedirectUrl: '/welcome' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome'));
    expect(fapi.client.sessions).toHaveLength(1);
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
    expect(starts(fapi)).toHaveLength(1);
  });
});

describe('submitting the continue form with an email that belongs to an enterprise connection', () => {
  async function openContinue(signUp: Parameters<typeof fapiSignUp>[0]) {
    const view = await renderSignUpWithRouteProbe({
      ...oneConnection,
      environment: environment({
        attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
      }),
      client: { ...fapiClient(), sign_up: fapiSignUp(signUp) },
    });
    const leave = vi.spyOn(view.clerk, '__internal_windowNavigate').mockImplementation(() => {});
    await view.user.click(screen.getByRole('button', { name: 'Open the continue route' }));
    await screen.findByRole('heading', { name: 'Fill in missing fields' });
    return { ...view, leave };
  }

  it('keeps the continue form busy while it sends the user to the identity provider, then gives it back', async () => {
    const { fapi, leave, user } = await openContinue({ has_password: true });

    await user.type(emailField(), EMAIL);
    await user.click(continueButton());
    await waitFor(() => expect(leave).toHaveBeenCalled());

    expect(String(leave.mock.calls[0][0])).toBe(IDP_URL);
    expect(screen.getByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(continueButton()).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(fapi.signUp.creations).toHaveLength(0);
    expect(starts(fapi)).toHaveLength(1);

    await waitFor(() => expect(continueButton()).not.toHaveAttribute('aria-busy', 'true'), HOLD);

    expect(screen.getByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(starts(fapi)).toHaveLength(1);
  });

  it('waits for Continue when sign-up opens on the continue form with the redirect still to start', async () => {
    const { fapi, leave, user } = await openContinue({
      email_address: EMAIL,
      has_password: true,
      missing_fields: ['enterprise_sso'],
    });

    expect(leave).not.toHaveBeenCalled();

    await user.click(continueButton());

    await waitFor(() => expect(leave).toHaveBeenCalledTimes(1));
    expect(starts(fapi)).toHaveLength(1);
  });
});

describe('arriving on the enterprise route with no form to hold', () => {
  it('shows loading while it sends the user to the identity provider, then offers Start over if the browser is still on the page', async () => {
    const { fapi, leave } = await arriveOnEnterpriseRoute(oneConnection);

    await waitFor(() => expect(leave).toHaveBeenCalled());

    expect(String(leave.mock.calls[0][0])).toBe(IDP_URL);
    expect(screen.getByRole('progressbar', { name: 'Loading…' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(fapi.signUp.creations).toHaveLength(0);

    expect(await screen.findByRole('button', { name: 'Start over' }, HOLD)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(starts(fapi)).toHaveLength(1);
  });

  it('offers Start over with the reason when the redirect cannot start', async () => {
    const { leave, user } = await arriveOnEnterpriseRoute(severalConnections);

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(SEVERAL_CONNECTIONS);
    expect(leave).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Start over' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });
});
