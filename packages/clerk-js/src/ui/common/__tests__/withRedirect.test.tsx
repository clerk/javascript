import React from 'react';

import { render } from '../../../testUtils';
import { bindCreateFixtures } from '../../utils/test/createFixtures';
import { withRedirect } from '../withRedirect';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('withRedirect', () => {
  it('redirects to the redirect url provided when condition is met', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({});
    });

    const WithHOC = withRedirect(
      () => <></>,
      () => true,
      () => '/',
      'Redirecting to /',
    );

    render(<WithHOC />, { wrapper });

    expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
  });

  it('does no redirects to the redirect url provided when the condition is not met', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({});
    });

    const WithHOC = withRedirect(
      () => <></>,
      () => false,
      () => '/',
      'Redirecting to /',
    );

    render(<WithHOC />, { wrapper });

    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('/');
  });
});
