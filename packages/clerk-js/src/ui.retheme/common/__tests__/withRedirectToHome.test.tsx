import React from 'react';

import { render, screen } from '../../../testUtils';
import { bindCreateFixtures } from '../../utils/test/createFixtures';
import {
  withRedirectToHomeOrganizationGuard,
  withRedirectToHomeSingleSessionGuard,
  withRedirectToHomeUserGuard,
} from '../withRedirectToHome';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('withRedirectToHome', () => {
  describe('withRedirectToHomeSingleSessionGuard', () => {
    it('redirects if a session is present and single session mode is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({});
      });

      const WithHOC = withRedirectToHomeSingleSessionGuard(() => <></>);

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is a session is not present', async () => {
      const { wrapper } = await createFixtures();

      const WithHOC = withRedirectToHomeSingleSessionGuard(() => <>test</>);

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });

    it('renders the children if multi session mode is enabled and a session is present', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({});
        f.withMultiSessionMode();
      });

      const WithHOC = withRedirectToHomeSingleSessionGuard(() => <>test</>);

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });

  describe('redirectToHomeUserGuard', () => {
    it('redirects if no user is present', async () => {
      const { wrapper, fixtures } = await createFixtures();

      const WithHOC = withRedirectToHomeUserGuard(() => <></>);

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is a user is present', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({});
      });

      const WithHOC = withRedirectToHomeUserGuard(() => <>test</>);

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });

  describe('withRedirectToHomeOrganizationGuard', () => {
    it('redirects if no organization is active', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({});
        f.withOrganizations();
      });

      const WithHOC = withRedirectToHomeOrganizationGuard(() => <></>);

      render(<WithHOC />, { wrapper });

      expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.homeUrl);
    });

    it('renders the children if is an organization is active', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ organization_memberships: ['Org1'] });
        f.withOrganizations();
      });

      const WithHOC = withRedirectToHomeOrganizationGuard(() => <>test</>);

      render(<WithHOC />, { wrapper });

      screen.getByText('test');
    });
  });
});
