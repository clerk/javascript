import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSignUp } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp } from '../sign-up';
import { continueButton, EMAIL, emailField, environment, renderSignUp, submitStart } from './sign-up.fixtures';

const SEVERAL_CONNECTIONS = 'An enterprise connection ID is required when the domain has several connections.';
const FEATURE_OFF = 'This feature is not enabled on this instance.';
const NOT_ACTIVE = 'This enterprise connection is not active.';
const HOLD = { timeout: 4000 };

const severalConnections = {
  enterpriseDomains: ['example.com'],
  enterpriseConnectionCount: 2,
  oauth: { enterprise_sso: { emailAddress: EMAIL } },
};

const starts = (fapi: ReturnType<typeof serveFapi>) =>
  [...fapi.signUp.creations, ...fapi.signUp.updates].filter(body => body.get('strategy') === 'enterprise_sso');

const chooser = () => screen.findByRole('heading', { name: 'Choose an account' });
const connection = (number: number) => screen.getByRole('button', { name: new RegExp(`^Acme SSO ${number}`) });

afterEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
});

async function submitEnterpriseEmail(
  signUp: FakeFapiSeed['signUp'] = severalConnections,
  options?: Parameters<typeof renderWithClerk>[1],
) {
  const first = await renderSignUp({ signUp }, {}, options);
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

async function arriveOnEnterpriseRoute(signUp: FakeFapiSeed['signUp'] = severalConnections) {
  const fapi = serveFapi({
    environment: environment(),
    client: {
      ...fapiClient(),
      sign_up: fapiSignUp({ email_address: EMAIL, has_password: true, missing_fields: ['enterprise_sso'] }),
    },
    signUp,
  });
  const view = await renderWithClerk(<OpenOnEnterpriseRoute />);
  const leave = vi.spyOn(view.clerk, '__internal_windowNavigate').mockImplementation(() => {});
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Open sign-up on the enterprise route' }));
  return { ...view, fapi, leave, user };
}

describe('choosing between several enterprise connections', () => {
  it('shows the connections after Continue when the email domain has several', async () => {
    const { fapi, leave } = await submitEnterpriseEmail();

    expect(await chooser()).toBeInTheDocument();
    expect(connection(1)).toBeInTheDocument();
    expect(connection(2)).toBeInTheDocument();
    expect(leave).not.toHaveBeenCalled();
    expect(starts(fapi)).toHaveLength(1);
    expect(starts(fapi)[0].has('enterprise_connection_id')).toBe(false);
    expect(fapi.signUp.creations).toHaveLength(1);
  });

  it('shows the connections when sign-up arrives on the enterprise route', async () => {
    const { fapi, leave } = await arriveOnEnterpriseRoute();

    expect(await chooser()).toBeInTheDocument();
    expect(connection(1)).toBeInTheDocument();
    expect(connection(2)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(leave).not.toHaveBeenCalled();
    expect(starts(fapi)).toHaveLength(1);
  });

  it('sends the user to the chosen connection once, with its button busy, then gives the chooser back', async () => {
    const { fapi, leave, user } = await submitEnterpriseEmail();
    await chooser();

    await user.click(connection(2));
    await waitFor(() => expect(leave).toHaveBeenCalled());

    expect(String(leave.mock.calls[0][0])).toBe('https://idp.example/sso?strategy=enterprise_sso&connection=entc_2');
    expect(connection(2)).toHaveAttribute('aria-busy', 'true');
    expect(connection(1)).toBeDisabled();
    const chosen = starts(fapi).at(-1);
    expect(chosen?.get('enterprise_connection_id')).toBe('entc_2');
    expect(new URL(chosen?.get('redirect_url') ?? '').searchParams.get('__clerk_mosaic_sign_up')).toBe('sso-callback');
    expect(starts(fapi)).toHaveLength(2);
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.client.sign_up?.email_address).toBe(EMAIL);

    await waitFor(() => expect(connection(2)).not.toHaveAttribute('aria-busy', 'true'), HOLD);

    expect(connection(1)).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Choose an account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start over' })).toBeNull();
    expect(starts(fapi)).toHaveLength(2);
  });

  it('shows why the chosen connection could not start on the chooser, and lets the user pick another', async () => {
    const { leave, user } = await submitEnterpriseEmail({
      ...severalConnections,
      enterpriseSsoRejected: { connectionId: 'entc_1', code: 'enterprise_connection_not_active', message: NOT_ACTIVE },
    });
    await chooser();

    await user.click(connection(1));

    expect(await screen.findByText(NOT_ACTIVE)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose an account' })).toBeInTheDocument();
    expect(leave).not.toHaveBeenCalled();

    await user.click(connection(2));

    await waitFor(() => expect(leave).toHaveBeenCalledTimes(1));
  });

  it('finishes the sign-up when the user comes back from the chosen connection', async () => {
    const { fapi, leave, unmount, user } = await submitEnterpriseEmail(severalConnections, {
      signUpFallbackRedirectUrl: '/welcome',
    });
    await chooser();
    await user.click(connection(1));
    await waitFor(() => expect(leave).toHaveBeenCalled());
    const callback = new URL(starts(fapi).at(-1)?.get('redirect_url') ?? '');

    unmount();
    fapi.signUp.returnFromOAuth();
    window.history.replaceState(null, '', `${callback.pathname}${callback.search}`);
    const { navigate } = await renderWithClerk(<SignUp />, { signUpFallbackRedirectUrl: '/welcome' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome'));
    expect(fapi.client.sessions).toHaveLength(1);
    expect(starts(fapi)).toHaveLength(2);
  });

  it('goes back to the form with the email still filled in, and shows the chooser again on Continue', async () => {
    const { fapi, leave, user } = await submitEnterpriseEmail();
    await chooser();

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(starts(fapi)).toHaveLength(1);

    await user.click(continueButton());

    expect(await chooser()).toBeInTheDocument();
    expect(starts(fapi)).toHaveLength(2);
    expect(leave).not.toHaveBeenCalled();
  });
});

describe('when the connections cannot be listed', () => {
  it('shows why on the form after Continue', async () => {
    const { leave } = await submitEnterpriseEmail({
      ...severalConnections,
      enterpriseConnectionListing: 'feature_not_enabled',
    });

    expect(await screen.findByText(FEATURE_OFF)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
    expect(leave).not.toHaveBeenCalled();
  });

  it('offers Start over with the reason on arrival', async () => {
    const { user } = await arriveOnEnterpriseRoute({
      ...severalConnections,
      enterpriseConnectionListing: 'feature_not_enabled',
    });

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(FEATURE_OFF);
    expect(screen.queryByRole('heading', { name: 'Choose an account' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Start over' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('offers Start over with the reason when the list comes back empty', async () => {
    await arriveOnEnterpriseRoute({ ...severalConnections, enterpriseConnectionListing: 'empty' });

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(SEVERAL_CONNECTIONS);
    expect(screen.queryByRole('heading', { name: 'Choose an account' })).toBeNull();
  });
});
