import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  type FapiEnvironmentOverrides,
  fapiSession,
  fapiSignUp,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualWrite } from '../../../routing/virtual-store';
import { SignUp } from '../sign-up';
import {
  codeSent,
  continueButton,
  EMAIL,
  enterCode,
  environment,
  renderSignUp,
  renderSignUpWithRouteProbe,
  RouteProbe,
  signedInSession,
  submitStart,
} from './sign-up.fixtures';

const GOOGLE = {
  enabled: true,
  required: false,
  authenticatable: true,
  strategy: 'oauth_google' as const,
  name: 'Google',
  logo_url: null,
};

afterEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
});

function socialEnvironment(overrides: FapiEnvironmentOverrides = {}) {
  return environment({
    ...overrides,
    user_settings: { social: { oauth_google: GOOGLE }, ...overrides.user_settings },
  });
}

async function startWithGoogle(
  seed: FakeFapiSeed,
  options?: Parameters<typeof renderWithClerk>[1],
  provider: RegExp = /Google/,
) {
  const fapi = serveFapi({ environment: socialEnvironment(), ...seed });
  const first = await renderWithClerk(<SignUp />, options);
  const leave = vi.spyOn(first.clerk, '__internal_windowNavigate').mockImplementation(() => {});
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: provider }));
  await waitFor(() => expect(leave).toHaveBeenCalled());
  return { fapi, first, leave, user };
}

async function returnFromGoogle(
  fapi: ReturnType<typeof serveFapi>,
  first: Awaited<ReturnType<typeof renderWithClerk>>,
  options?: Parameters<typeof renderWithClerk>[1],
  ui: ReactElement = <SignUp />,
) {
  const started = [...fapi.signUp.creations, ...fapi.signUp.updates].filter(body => body.has('redirect_url'));
  const callback = new URL(started.at(-1)?.get('redirect_url') ?? '');
  first.unmount();
  fapi.signUp.returnFromOAuth();
  window.history.replaceState(null, '', `${callback.pathname}${callback.search}`);
  return renderWithClerk(ui, options);
}

const SIGN_IN_LANDINGS = [
  { landing: 'the sign-in fallback URL', search: '', to: expect.stringContaining('/home'), elsewhere: '/dashboard' },
  {
    landing: 'the redirect_url from the query',
    search: '?redirect_url=%2Fdashboard',
    to: '/dashboard',
    elsewhere: '/home',
  },
];

const legalConsentEnvironment = (google: { required: boolean }) =>
  environment({
    user_settings: {
      social: { oauth_google: { ...GOOGLE, ...google } },
      sign_up: {
        allowlist_only: false,
        progressive: true,
        captcha_enabled: false,
        mode: 'public',
        legal_consent_enabled: true,
      },
    },
  });

const signUpWithPassword = { ...fapiClient(), sign_up: fapiSignUp({ email_address: EMAIL, has_password: true }) };

describe('starting with a social provider', () => {
  it.each([
    { landing: 'the after sign-up URL', search: '', pathname: '/welcome' },
    { landing: 'the redirect_url from the query', search: '?redirect_url=%2Fdashboard', pathname: '/dashboard' },
  ])(
    'starts Google sign-up with a callback URL that brings the user back to sign-up, then on to $landing',
    async ({ search, pathname }) => {
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);

      const { fapi, leave } = await startWithGoogle({}, { signUpFallbackRedirectUrl: '/welcome' });

      expect(String(leave.mock.calls[0][0])).toBe('https://oauth.example/authorize?strategy=oauth_google');
      expect(fapi.signUp.creations).toHaveLength(1);
      expect(fapi.signUp.creations[0].get('strategy')).toBe('oauth_google');
      expect(fapi.signUp.creations[0].get('redirect_url')).toBeTruthy();
      expect(new URL(fapi.signUp.creations[0].get('action_complete_redirect_url') ?? '').pathname).toBe(pathname);
    },
  );

  it('sends the accepted legal terms and the unsafe metadata with the Google sign-up', async () => {
    const fapi = serveFapi({
      environment: socialEnvironment({
        user_settings: {
          social: { oauth_google: GOOGLE },
          sign_up: {
            allowlist_only: false,
            progressive: true,
            captcha_enabled: false,
            mode: 'public',
            legal_consent_enabled: true,
          },
        },
      }),
    });
    const { clerk } = await renderWithClerk(<SignUp unsafeMetadata={{ plan: 'pro' }} />);
    vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();

    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Google/ }));

    await waitFor(() => expect(fapi.signUp.creations).toHaveLength(1));
    expect(fapi.signUp.creations[0].get('legal_accepted')).toBe('true');
    expect(JSON.parse(fapi.signUp.creations[0].get('unsafe_metadata') ?? '{}')).toEqual({ plan: 'pro' });
  });

  it('starts a new sign-up from start even when an earlier one is still on the client', async () => {
    const fapi = serveFapi({ environment: socialEnvironment() });
    const { clerk } = await renderWithClerk(
      <>
        <SignUp />
        <RouteProbe />
      </>,
    );
    const leave = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();
    await submitStart(user);
    await screen.findByRole('heading', { name: 'Verify your email' });
    await codeSent();

    await user.click(screen.getByRole('button', { name: 'Open the start route' }));
    await user.click(await screen.findByRole('button', { name: /Google/ }));

    await waitFor(() => expect(leave).toHaveBeenCalled());
    expect(fapi.signUp.creations).toHaveLength(2);
    expect(fapi.signUp.creations[1].get('strategy')).toBe('oauth_google');
    expect(fapi.signUp.updates.filter(update => update.get('strategy'))).toEqual([]);
  });

  it('offers only the providers on start when the instance signs up with social accounts alone', async () => {
    await renderSignUp({
      environment: socialEnvironment({
        attributes: { email_address: { enabled: false }, password: { enabled: false } },
        user_settings: {
          social: { oauth_google: GOOGLE },
          sign_up: {
            allowlist_only: false,
            progressive: true,
            captcha_enabled: false,
            mode: 'public',
            legal_consent_enabled: true,
          },
        },
      }),
    });

    expect(await screen.findByRole('button', { name: /Google/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('replaces the form with the blocked notice when starting with Google is blocked', async () => {
    serveFapi({
      environment: socialEnvironment(),
      signUp: { blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' } },
    });
    await renderWithClerk(<SignUp />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Google/ }));

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
  });
});

describe('coming back from the provider', () => {
  it('asks for what Google did not provide after the return, then completes', async () => {
    const seed: FakeFapiSeed = {
      environment: socialEnvironment({ attributes: { username: { enabled: true, required: true } } }),
      signUp: { oauth: { oauth_google: { emailAddress: EMAIL } } },
    };
    const { fapi, first } = await startWithGoogle(seed);

    const { navigate } = await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
    expect(screen.queryByLabelText('Password')).toBeNull();

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Username' }), 'alice');
    await user.click(continueButton());

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.updates.at(-1)?.get('username')).toBe('alice');
    expect(fapi.client.sessions).toHaveLength(1);
  });

  it('completes the return when sign-up opens on the continue route', async () => {
    function OpenOnContinue() {
      const write = useVirtualWrite();
      const [opened, setOpened] = useState(false);
      return opened ? (
        <SignUp />
      ) : (
        <button
          type='button'
          onClick={() => {
            write('/sign-up', ['continue']);
            setOpened(true);
          }}
        >
          Open sign-up on continue
        </button>
      );
    }
    const { fapi, first } = await startWithGoogle({
      environment: socialEnvironment({ attributes: { username: { enabled: true, required: true } } }),
      signUp: { oauth: { oauth_google: { emailAddress: EMAIL } } },
    });

    await returnFromGoogle(fapi, first, undefined, <OpenOnContinue />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open sign-up on continue' }));

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
  });

  it('shows what went wrong at Google on the start form', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { error: { code: 'oauth_access_denied', message: 'Access was denied.' } } },
      },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('You did not grant access to your account.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
  });

  it('shows a generic error when Google returns one that is not meant for users', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { error: { code: 'internal_clerk_error', message: 'Raw server detail.' } } },
      },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('Raw server detail.')).toBeNull();
  });

  it('keeps the denial on screen when an invitee comes back from Google, and does not redeem the ticket again', async () => {
    window.history.replaceState(null, '', `${window.location.pathname}?__clerk_ticket=tkt_invite`);
    const { fapi, first } = await startWithGoogle({
      signUp: {
        tickets: { tkt_invite: { emailAddress: EMAIL } },
        oauth: { oauth_google: { error: { code: 'oauth_access_denied', message: 'Access was denied.' } } },
      },
    });
    expect(fapi.signUp.updates.at(-1)?.get('strategy')).toBe('oauth_google');

    await returnFromGoogle(fapi, first);

    expect(await screen.findByText('You did not grant access to your account.')).toBeInTheDocument();
    await waitFor(() => expect(window.location.search).not.toContain('__clerk_ticket'));
    expect(screen.getByText('You did not grant access to your account.')).toBeInTheDocument();
    expect(fapi.signUp.creations.filter(body => body.get('strategy') === 'ticket')).toHaveLength(1);
  });

  it('replaces the form with the blocked notice when the return from Google was blocked', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: {
          oauth_google: {
            error: {
              code: 'action_blocked',
              message: 'Request blocked',
              meta: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' },
            },
          },
        },
      },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Create your account' })).toBeNull();
    expect(window.location.search).not.toContain('__clerk_mosaic_sign_up');
  });
});

describe('coming back with an account that already has a user', () => {
  it.each(SIGN_IN_LANDINGS)(
    'signs in instead and lands on $landing when the Google account already belongs to a user',
    async ({ search, to, elsewhere }) => {
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);
      const { fapi, first } = await startWithGoogle({
        signUp: { oauth: { oauth_google: { existingUser: { emailAddress: EMAIL } } } },
      });

      const { navigate } = await returnFromGoogle(fapi, first, { signInFallbackRedirectUrl: '/home' });

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(to));
      expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining(elsewhere));
      expect(fapi.signUp.transfers).toHaveLength(1);
      expect(fapi.client.sessions).toHaveLength(1);
    },
  );

  it('hands a transfer that still needs a second factor to the sign-in factor-two route, keeping redirect_url', async () => {
    window.history.replaceState(null, '', `${window.location.pathname}?redirect_url=%2Fdashboard`);
    const { fapi, first } = await startWithGoogle({
      signUp: { oauth: { oauth_google: { existingUser: { emailAddress: EMAIL, secondFactor: true } } } },
    });

    const { navigate } = await returnFromGoogle(fapi, first, { signInUrl: '/sign-in' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/sign-in')));
    const target = new URL(String(navigate.mock.calls.at(-1)?.[0]), window.location.origin);
    const route = new URL(target.hash.slice(1), target.origin);
    expect(target.pathname).toBe('/sign-in');
    expect(route.pathname).toBe('/factor-two');
    expect(new URL(route.searchParams.get('redirect_url') ?? '', target.origin).pathname).toBe('/dashboard');
    expect(fapi.client.sessions).toHaveLength(0);
  });

  it('takes a user who signs in instead to their pending task', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: {
        oauth: { oauth_google: { existingUser: { emailAddress: EMAIL } } },
        sessionTasks: [{ key: 'choose-organization' }],
      },
    });

    const { navigate } = await returnFromGoogle(fapi, first, {
      signInUrl: '/sign-in',
      signInFallbackRedirectUrl: '/home',
    });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('choose-organization')));
    expect(fapi.signUp.transfers).toHaveLength(1);
    expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining('/home'));
  });

  it.each(SIGN_IN_LANDINGS)(
    'switches to the session already signed in to the Google account and lands on $landing',
    async ({ search, to, elsewhere }) => {
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);
      const otherSession = fapiSession({ id: 'sess_other', user: fapiUser({ id: 'user_other' }) });
      const { fapi, first } = await startWithGoogle({
        client: fapiClient([otherSession, signedInSession]),
        signUp: { oauth: { oauth_google: { signedInSession: signedInSession.id } } },
      });

      const { clerk, navigate } = await returnFromGoogle(fapi, first, { signInFallbackRedirectUrl: '/home' });

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(to));
      expect(navigate).not.toHaveBeenCalledWith(expect.stringContaining(elsewhere));
      expect(clerk.session?.id).toBe(signedInSession.id);
      expect(fapi.signUp.transfers).toHaveLength(0);
    },
  );
});

describe('running the Protect check after the return', () => {
  it('runs the Protect check the sign-up still has after the return, then continues', async () => {
    const { fapi, first } = await startWithGoogle({
      environment: socialEnvironment({ attributes: { username: { enabled: true, required: true } } }),
      signUp: { protectChecks: 1, oauth: { oauth_google: { emailAddress: EMAIL } } },
    });

    await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    await userEvent.setup().click(await screen.findByRole('button', { name: 'I am human' }));
    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
  });

  it('runs the Protect check raised on the return from Google, then completes the sign-up', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: { protectChecks: 1, protectCheckOn: 'oauth_callback', oauth: { oauth_google: { emailAddress: EMAIL } } },
    });
    expect(fapi.client.sign_up?.protect_check).toBeNull();

    const { navigate } = await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    expect(fapi.client.sign_up?.missing_fields).toEqual(['protect_check']);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'I am human' }));

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
    expect(fapi.client.sessions).toHaveLength(1);
  });

  it('signs in instead after the Protect check when the Google account already belongs to a user', async () => {
    const { fapi, first } = await startWithGoogle({
      signUp: { protectChecks: 1, oauth: { oauth_google: { existingUser: { emailAddress: EMAIL } } } },
    });

    const { navigate } = await returnFromGoogle(fapi, first, { signInFallbackRedirectUrl: '/home' });

    expect(await screen.findByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    expect(fapi.signUp.transfers).toHaveLength(0);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'I am human' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/home')));
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
    expect(fapi.signUp.transfers).toHaveLength(1);
    expect(fapi.client.sessions).toHaveLength(1);
  });
});

describe('linking a provider the instance requires', () => {
  it('asks only for the provider the sign-up still needs on the continue screen', async () => {
    const provider = { enabled: true, authenticatable: true, logo_url: null };
    const { clerk, fapi, user } = await renderSignUp({
      environment: environment({
        user_settings: {
          social: {
            oauth_google: { ...provider, required: true, strategy: 'oauth_google', name: 'Google' },
            oauth_github: { ...provider, required: false, strategy: 'oauth_github', name: 'GitHub' },
          },
        },
      }),
    });
    const leave = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});

    await submitStart(user);
    await enterCode(user);

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GitHub/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Google/ }));

    await waitFor(() => expect(leave).toHaveBeenCalled());
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.signUp.updates.at(-1)?.get('strategy')).toBe('oauth_google');
  });

  it('offers the provider the sign-up still needs alongside legal consent', async () => {
    const { user } = await renderSignUpWithRouteProbe({
      environment: legalConsentEnvironment({ required: true }),
      client: signUpWithPassword,
    });

    await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
    await enterCode(user);

    expect(await screen.findByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument();
  });

  it('offers no provider when legal consent is all the sign-up needs', async () => {
    const { user } = await renderSignUpWithRouteProbe({
      environment: legalConsentEnvironment({ required: false }),
      client: signUpWithPassword,
    });

    await user.click(screen.getByRole('button', { name: 'Open the verify route' }));
    await enterCode(user);

    expect(await screen.findByRole('heading', { name: 'Legal consent' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull();
  });

  it('asks for the required provider after the user signed up with another one', async () => {
    const github = { ...GOOGLE, strategy: 'oauth_github' as const, name: 'GitHub' };
    const { fapi, first } = await startWithGoogle(
      {
        environment: socialEnvironment({
          user_settings: { social: { oauth_google: { ...GOOGLE, required: true }, oauth_github: github } },
        }),
        signUp: { oauth: { oauth_github: { emailAddress: EMAIL } } },
      },
      undefined,
      /GitHub/,
    );

    await returnFromGoogle(fapi, first);

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GitHub/ })).toBeNull();
  });

  it('offers Start over when the instance requires two providers a sign-up cannot both link', async () => {
    const github = { ...GOOGLE, strategy: 'oauth_github' as const, name: 'GitHub', required: true };
    const { user } = await renderSignUp({
      environment: socialEnvironment({
        user_settings: { social: { oauth_google: { ...GOOGLE, required: true }, oauth_github: github } },
      }),
    });

    await submitStart(user);
    await enterCode(user);

    expect(await screen.findByRole('button', { name: 'Start over' })).toBeInTheDocument();
  });
});
