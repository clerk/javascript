// import { render, screen } from '@clerk/shared/testUtils';
import { it } from '@jest/globals';
import { render } from '@testing-library/react';
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
    <MockClerkProvider data-testid='sign-in-start'>
      <SignInStart />
    </MockClerkProvider>,
  );

  // render(<SignInStart />);

  // const component = screen.getByTestId('sign-in-start');

  // expect(component).toBeDefined();

  // expect(...).toHaveBeenNthCalledWith(...);

  // updateMock(mocks => {
  //   // TBD, use as a sample only
  //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
  // });

  // expect(...).toHaveBeenNthCalledWith(...);
});
