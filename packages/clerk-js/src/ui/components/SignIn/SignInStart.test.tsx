// import { render, screen } from '@clerk/shared/testUtils';
import { expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { createFixture } from '../../utils/testUtils';
import { SignInStart } from './SignInStart';

it('navigates to home_url', () => {
  // const Component = withRedirectToHome(Tester);
  const { MockClerkProvider, updateMock } = createFixture(f => {
    f.withUsername();
    // f.withEmailAddress({ required: true });
  });

  render(
    <MockClerkProvider>
      <SignInStart />
    </MockClerkProvider>,
  );

  // render(<SignInStart />);

  const component = screen.getByText('Sign in');
  const component2 = screen.getByText('Secured by');

  expect(component).toBeDefined();
  expect(component2).toBeDefined();

  // expect(...).toHaveBeenNthCalledWith(...);

  // updateMock(mocks => {
  //   // TBD, use as a sample only
  //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
  // });

  // expect(...).toHaveBeenNthCalledWith(...);
});
