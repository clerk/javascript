import { render } from '@clerk/shared/testUtils';
import { expect, it } from '@jest/globals';
import { createFixture } from 'ui/utils/testUtils';

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

  // expect(...).toHaveBeenNthCalledWith(...);

  // updateMock(mocks => {
  //   // TBD, use as a sample only
  //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
  // });

  // expect(...).toHaveBeenNthCalledWith(...);
});
