import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { SignInLink } from './SignInLink';

jest.mock('ui/contexts/ClerkUIComponentsContext', () => ({
  useSignUpContext: () => {
    return {
      signInUrl: 'https://testSignInUrl',
    };
  },
}));

jest.mock('ui/router/RouteContext');

describe('<SignInLink/>', () => {
  it('renders the fallback screen and enters a password', async () => {
    const tree = renderJSON(<SignInLink />);
    expect(tree).toMatchSnapshot();
  });
});
