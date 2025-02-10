import type { CustomPage } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { UserProfile } from '../UserProfile';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('UserProfile', () => {
  describe('Navigation', () => {
    it('includes buttons for the bigger sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<UserProfile />, { wrapper });
      const profileElements = screen.getAllByRole('button', { name: /Profile/i });
      expect(profileElements.length).toBeGreaterThan(0);
      const securityElements = screen.getAllByRole('button', { name: /Security/i });
      expect(securityElements.length).toBeGreaterThan(0);
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
      const profileElements = screen.getAllByRole('button', { name: /Profile/i });
      expect(profileElements.length).toBeGreaterThan(0);
      const securityElements = screen.getAllByRole('button', { name: /Security/i });
      expect(securityElements.length).toBeGreaterThan(0);
      const customElements = screen.getAllByRole('button', { name: /Custom1/i });
      expect(customElements.length).toBeGreaterThan(0);
      const externalElements = screen.getAllByRole('button', { name: /ExternalLink/i });
      expect(externalElements.length).toBeGreaterThan(0);
    });
  });
});
