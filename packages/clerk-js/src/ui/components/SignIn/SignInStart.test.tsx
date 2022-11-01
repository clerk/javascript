import { expect, it } from '@jest/globals';
import React from 'react';
import { createFixture } from 'ui/utils/testUtils';

import { SignInStart } from './SignInStart';
import { render, screen } from '@clerk/shared/testUtils';

it('navigates to home_url', () => {
  // const Component = withRedirectToHome(Tester);
  const { MockClerkProvider, updateMock } = createFixture(f => {
    f.withUsername();
    // f.withEmailAddress({ required: true });
  });

  render(
    <MockClerkProvider data-testid='sign-in-start'>
      <SignInStart />
    </MockClerkProvider>,
  );

  const component = screen.getByTestId('sign-in-start');

  // expect(component).toBeDefined();

  // expect(...).toHaveBeenNthCalledWith(...);

  // updateMock(mocks => {
  //   // TBD, use as a sample only
  //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
  // });

  // expect(...).toHaveBeenNthCalledWith(...);
});
