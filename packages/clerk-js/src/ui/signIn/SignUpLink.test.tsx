import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { SignUpLink } from './SignUpLink';

jest.mock('ui/contexts/ClerkUIComponentsContext', () => ({
  useSignInContext: () => {
    return {
      signUpUrl: 'http://testurl',
      navigateAfterSignIn: jest.fn(),
    };
  },
}));
jest.mock('ui/router/RouteContext');

describe('<SignUpLink/>', () => {
  it('renders the SignUpLink snapshot', async () => {
    const tree = renderJSON(<SignUpLink />);
    expect(tree).toMatchSnapshot();
  });
});
