import React from 'react';

import { render } from '../../../testUtils';
import { bindCreateFixtures } from '../../utils/test/createFixtures';
import { withRedirect } from '../withRedirect';
import { sessionExistsAndRedirectUrlPresent } from '../../../utils/componentGuards';

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

describe('sessionExistsAndRedirectUrlPresent', () => {
  beforeEach(() => {
    // Set up window.location.href for tests
    Object.defineProperty(window, 'location', {
      value: { href: 'http://test.host/' },
      writable: true,
    });
  });

  it('returns true when user is signed in and redirect_url is present', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({});
    });

    // Mock window.location.search to include redirect_url
    Object.defineProperty(window, 'location', {
      value: { 
        href: 'http://test.host/',
        search: '?redirect_url=https%3A%2F%2Fexample.com' 
      },
      writable: true,
    });

    const TestComponent = () => <div>Test</div>;
    const WithHOC = withRedirect(
      TestComponent,
      sessionExistsAndRedirectUrlPresent,
      () => '/redirected',
    );

    render(<WithHOC />, { wrapper });

    expect(fixtures.router.navigate).toHaveBeenCalledWith('/redirected');
  });

  it('returns false when user is not signed in', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      // No user signed in
    });

    // Mock window.location.search to include redirect_url
    Object.defineProperty(window, 'location', {
      value: { 
        href: 'http://test.host/',
        search: '?redirect_url=https%3A%2F%2Fexample.com' 
      },
      writable: true,
    });

    const TestComponent = () => <div>Test</div>;
    const WithHOC = withRedirect(
      TestComponent,
      sessionExistsAndRedirectUrlPresent,
      () => '/redirected',
    );

    render(<WithHOC />, { wrapper });

    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('returns false when redirect_url is not present', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({});
    });

    // Mock window.location.search without redirect_url
    Object.defineProperty(window, 'location', {
      value: { 
        href: 'http://test.host/',
        search: '?other_param=value' 
      },
      writable: true,
    });

    const TestComponent = () => <div>Test</div>;
    const WithHOC = withRedirect(
      TestComponent,
      sessionExistsAndRedirectUrlPresent,
      () => '/redirected',
    );

    render(<WithHOC />, { wrapper });

    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });
});
