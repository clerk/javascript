import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { titleize } from '@clerk/shared/utils/string';
import React from 'react';

import { OAuth } from './OAuth';

const mockAuthenticateWithRedirect = jest.fn();

jest.mock('ui/contexts', () => {
  return {
    useSignInContext: () => {
      return {
        signUpUrl: 'http://testurl',
        navigateAfterSignIn: jest.fn(),
      };
    },
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        signInUrl: 'http://test.host/signin',
        afterSignInUrl: 'http://test.host',
      },
    })),
    useCoreSignIn: () => ({
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    }),
  };
});

jest.mock('ui/router/RouteContext');

describe('<OAuth/>', () => {
  it('renders the OAuth buttons', async () => {
    const tree = renderJSON(<OAuth oauthOptions={['oauth_google', 'oauth_facebook']} />);
    expect(tree).toMatchSnapshot();
  });

  it.each(['google', 'facebook'])('starts a %s oauth flow on click', async (provider: string) => {
    const providerTitle = titleize(provider);

    render(<OAuth oauthOptions={['oauth_google', 'oauth_facebook']} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: `${providerTitle} Sign in with ${providerTitle}`,
      }),
    );

    expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: `oauth_${provider}`,
      redirectUrl: 'http://localhost/#/sso-callback',
      redirectUrlComplete: 'http://test.host',
    });
  });
});
