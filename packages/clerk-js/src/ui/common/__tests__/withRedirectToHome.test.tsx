import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../testUtils';
import { withRedirectToHome } from '../withRedirectToHome';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('withRedirectHome', () => {
  describe('signIn', () => {
    it('redirects if a session is present and single session mode is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({});
      });

      const WithHOC = withRedirectToHome(() => <></>, 'signIn');

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is a session is not present', async () => {
      const { wrapper } = await createFixtures();

      const WithHOC = withRedirectToHome(() => <>test</>, 'signIn');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });

    it('renders the children if multi session mode is enabled and a session is present', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({});
        f.withMultiSessionMode();
      });

      const WithHOC = withRedirectToHome(() => <>test</>, 'signIn');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });

  describe('signUp', () => {
    it('redirects if a session is present and single session mode is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({});
      });

      const WithHOC = withRedirectToHome(() => <></>, 'signUp');

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is a session is not present', async () => {
      const { wrapper } = await createFixtures();

      const WithHOC = withRedirectToHome(() => <>test</>, 'signUp');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });

    it('renders the children if multi session mode is enabled and a session is present', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({});
        f.withMultiSessionMode();
      });

      const WithHOC = withRedirectToHome(() => <>test</>, 'signUp');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });

  describe('userProfile', () => {
    it('redirects if no user is present', async () => {
      const { wrapper, fixtures } = await createFixtures();

      const WithHOC = withRedirectToHome(() => <></>, 'userProfile');

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is a user is present', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({});
      });

      const WithHOC = withRedirectToHome(() => <>test</>, 'userProfile');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });

  describe('organizationProfile', () => {
    it('redirects if no organization is active', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({});
        f.withOrganizations();
      });

      const WithHOC = withRedirectToHome(() => <></>, 'organizationProfile');

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is an organization is active', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ organization_memberships: ['Org1'] });
        f.withOrganizations();
      });

      const WithHOC = withRedirectToHome(() => <>test</>, 'organizationProfile');

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });
});
