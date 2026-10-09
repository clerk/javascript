import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignInAccountSwitcher, SignInAccountSwitcherForChatGPTSIWC } from '../SignInAccountSwitcher';

const { createFixtures } = bindCreateFixtures('SignIn');

const initConfig = createFixtures.config(f => {
  f.withMultiSessionMode();
  f.withUser({ first_name: 'Nick', last_name: 'Kouk', email_addresses: ['test1@clerk.com'] });
  f.withUser({ first_name: 'Mike', last_name: 'Lamar', email_addresses: ['test2@clerk.com'] });
  f.withUser({ first_name: 'Graciela', last_name: 'Brennan', email_addresses: ['test3@clerk.com'] });
});

describe('SignInAccountSwitcher', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignInAccountSwitcher />, { wrapper });
  });

  it('renders a list of buttons with all signed in accounts', async () => {
    const { wrapper } = await createFixtures(initConfig);
    const { getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
  });

  it('renders the SIWC account chooser for a server-prepared consent continuation', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://accounts.clerk.example.test/oauth-consent?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;

    const { getByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });

    expect(getByText('Nick Kouk')).toBeInTheDocument();
    expect(getByText('Add account')).toBeInTheDocument();
  });

  it('sets an active session when user clicks an already logged in account from the list', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Nick Kouk'));
    expect(fixtures.clerk.setActive).toHaveBeenCalled();
  });

  it('records an authenticated account choice before resuming a mismatched ChatGPT authorization', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;
    fixtures.clerk.setActive.mockImplementation(async ({ session, navigate }: any) => {
      await navigate({ session, decorateUrl: (url: string) => url });
    });
    const { userEvent, getByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });
    const firstSession = fixtures.clerk.client.sessions[0] as any;
    const selectedSession = fixtures.clerk.client.sessions[1] as any;
    const events: string[] = [];
    fixtures.router.navigate.mockImplementation(async () => {
      events.push('navigate');
    });
    firstSession.__internal_acknowledgeChatGPTAccountChoice = vi.fn().mockResolvedValue(undefined);
    selectedSession.__internal_acknowledgeChatGPTAccountChoice = vi.fn().mockImplementation(async () => {
      events.push('acknowledge');
    });

    await userEvent.click(getByText('Mike Lamar'));

    expect(selectedSession.__internal_acknowledgeChatGPTAccountChoice).toHaveBeenCalledWith(expect.any(String));
    expect(firstSession.__internal_acknowledgeChatGPTAccountChoice).not.toHaveBeenCalled();
    expect(events).toEqual(['acknowledge', 'navigate']);
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: selectedSession }));
  });

  it('renders the account choice when a signed-in user has single-session mode enabled', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ first_name: 'Nick', last_name: 'Kouk', email_addresses: ['test1@clerk.com'] });
    });
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;

    const { getByText, queryByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });

    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Add account')).toBeInTheDocument();
  });

  it('keeps Add account available in the ordinary single-session chooser', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ first_name: 'Nick', last_name: 'Kouk', email_addresses: ['test1@clerk.com'] });
    });
    const { getByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });
    expect(getByText('Add account')).toBeInTheDocument();
  });

  it('ignores a crafted account mismatch marker without a valid outer continuation', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.router.queryParams = { __clerk_siwc_account_mismatch: 'true' } as any;
    fixtures.clerk.setActive.mockImplementation(async ({ session, navigate }: any) => {
      await navigate({ session, decorateUrl: (url: string) => url });
    });
    const session = fixtures.clerk.client.sessions[0] as any;
    session.__internal_acknowledgeChatGPTAccountChoice = vi.fn();
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Nick Kouk'));
    expect(session.__internal_acknowledgeChatGPTAccountChoice).not.toHaveBeenCalled();
  });

  it('does not acknowledge a crafted pending marker without a valid outer continuation', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    fixtures.router.queryParams = { __clerk_siwc_account_choice_pending: 'true' } as any;
    fixtures.clerk.setActive.mockImplementation(async ({ session, navigate }: any) => {
      await navigate({ session, decorateUrl: (url: string) => url });
    });
    const session = fixtures.clerk.client.sessions[0] as any;
    session.__internal_acknowledgeChatGPTAccountChoice = vi.fn();
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    await userEvent.click(getByText('Nick Kouk'));
    expect(session.__internal_acknowledgeChatGPTAccountChoice).not.toHaveBeenCalled();
  });

  it('shows sign-in instead of an empty chooser when there is no selected Clerk session', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withSocialProvider({ provider: 'chatgpt' }));
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;
    fixtures.signIn.create.mockResolvedValueOnce({ status: 'needs_identifier' } as any);
    fixtures.signIn.authenticateWithRedirect.mockResolvedValueOnce({} as any);

    render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });

    await waitFor(() =>
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'oauth_chatgpt',
        }),
      ),
    );
  });

  it('preserves the outer OAuth continuation when adding an account with path routing', async () => {
    const { wrapper, fixtures, props } = await createFixtures(initConfig);
    props.setProps({ routing: 'path', path: '/sign-in' } as any);
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=outer-state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;
    const windowNavigate = vi.fn();
    (fixtures.clerk as any).__internal_windowNavigate = windowNavigate;
    const { userEvent, getByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(windowNavigate).toHaveBeenCalledTimes(1);
    const target = String(windowNavigate.mock.calls[0][0]);
    const accountSwitchURL = new URL(target, window.location.origin);
    const switchParams = new URLSearchParams(accountSwitchURL.hash.slice(accountSwitchURL.hash.indexOf('?') + 1));
    expect(switchParams.get('target_flow')).toBe('chatgpt_siwc');
    expect(switchParams.get('__clerk_siwc_account_mismatch')).toBe('false');
    expect(switchParams.get('__clerk_siwc_account_choice_pending')).toBe('true');
    const outerAuthorizationURL = new URL(switchParams.get('redirect_url')!);
    expect(outerAuthorizationURL.searchParams.get('client_id')).toBe('client');
    expect(outerAuthorizationURL.searchParams.get('state')).toBe('outer-state');
  });

  it('preserves the outer OAuth continuation when adding an account with hash routing', async () => {
    const { wrapper, fixtures, props } = await createFixtures(initConfig);
    props.setProps({ routing: 'hash' } as any);
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=outer-state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      __clerk_siwc_account_mismatch: 'true',
    } as any;
    const windowNavigate = vi.fn();
    (fixtures.clerk as any).__internal_windowNavigate = windowNavigate;
    const { userEvent, getByText } = render(<SignInAccountSwitcherForChatGPTSIWC />, { wrapper });
    await userEvent.click(getByText('Add account'));
    expect(windowNavigate).toHaveBeenCalledTimes(1);
    const target = String(windowNavigate.mock.calls[0][0]);
    const accountSwitchURL = new URL(target, window.location.origin);
    const switchParams = new URLSearchParams(accountSwitchURL.hash.slice(accountSwitchURL.hash.indexOf('?') + 1));
    expect(switchParams.get('target_flow')).toBe('chatgpt_siwc');
    expect(switchParams.get('__clerk_siwc_account_mismatch')).toBe('false');
    expect(switchParams.get('__clerk_siwc_account_choice_pending')).toBe('true');
    const outerAuthorizationURL = new URL(switchParams.get('redirect_url')!);
    expect(outerAuthorizationURL.searchParams.get('client_id')).toBe('client');
    expect(outerAuthorizationURL.searchParams.get('state')).toBe('outer-state');
  });

  it('signs out when user clicks on "Sign out of all accounts"', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);
    const { userEvent, getByText } = render(<SignInAccountSwitcher />, { wrapper });
    expect(getByText('Nick Kouk')).toBeDefined();
    expect(getByText('Mike Lamar')).toBeDefined();
    expect(getByText('Graciela Brennan')).toBeDefined();
    await userEvent.click(getByText('Sign out of all accounts'));
    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });
});
