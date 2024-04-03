import type { CustomPage } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { UserProfile } from '../UserProfile';

const { createFixtures } = bindCreateFixtures('UserProfile');

const mockUseEnvironment = jest.fn();

describe('UserProfile', () => {
  describe('Navigation', () => {
    it('includes buttons for the bigger sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<UserProfile />, { wrapper });
      const profileElements = screen.getAllByText(/Profile/i);
      expect(profileElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const securityElements = screen.getAllByText(/Security/i);
      expect(securityElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });

    it('includes custom nav items', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'] });
      });

      const customPages: CustomPage[] = [
        {
          label: 'Custom1',
          url: 'custom1',
          mount: () => undefined,
          unmount: () => undefined,
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'ExternalLink',
          url: '/link',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];

      props.setProps({ customPages });
      render(<UserProfile />, { wrapper });
      const profileElements = screen.getAllByText(/Profile/i);
      expect(profileElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const securityElements = screen.getAllByText(/Security/i);
      expect(securityElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const customElements = screen.getAllByText(/Custom1/i);
      expect(customElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const externalElements = screen.getAllByText(/ExternalLink/i);
      expect(externalElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });

    it('includes a button for the billing section if billing is enabled', async () => {
      mockUseEnvironment.mockImplementationOnce(() => ({ userSetting: { billing: { enabled: true } } }));
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'] });
        f.withBilling({ enabled: true });
      });

      render(<UserProfile />, { wrapper });

      const billingElements = screen.getAllByText(/Plan & Billing/i);
      expect(billingElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });
  });
});
