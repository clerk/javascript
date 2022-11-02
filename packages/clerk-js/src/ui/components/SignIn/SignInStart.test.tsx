// import { render, screen } from '@clerk/shared/testUtils';
import { expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { createFixture } from '../../utils/test/createFixture';
import { SignInStart } from './SignInStart';

it('navigates to home_url', () => {
  // const Component = withRedirectToHome(Tester);
  const { MockClerkProvider, updateClerkMock } = createFixture(f => {
    f.withUsername();
    f.withGoogleOAuth();
    f.withDiscordOAuth();
    // f.withEmailAddress({ required: true });
  });

  render(
    <MockClerkProvider>
      <SignInStart />
    </MockClerkProvider>,
  );

  // render(<SignInStart />);

  const component = screen.getByText('Sign in');
  const googleOauth = screen.getByText('Continue with Google');
  const discordOauth = screen.getByText('Continue with Discord');

  expect(component).toBeDefined();
  expect(googleOauth).toBeDefined();
  expect(discordOauth).toBeDefined();

  // expect(...).toHaveBeenNthCalledWith(...);

  // updateMock(mocks => {
  //   // TBD, use as a sample only
  //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
  // });

  // expect(...).toHaveBeenNthCalledWith(...);
});
