import type { CustomPage } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { UserProfile } from '../UserProfile';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('UserProfile', () => {
  describe('Navigation', () => {
    // TODO-RETHEME: revise the test accordingly when the UI is done
    it.skip('includes buttons for the bigger sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<UserProfile />, { wrapper });
      const accountElements = screen.getAllByText(/Account/i);
      expect(accountElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const securityElements = screen.getAllByText(/Security/i);
      expect(securityElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });

    // TODO-RETHEME: revise the test accordingly when the UI is done
    it.skip('includes custom nav items', async () => {
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
      const accountElements = screen.getAllByText(/Account/i);
      expect(accountElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const securityElements = screen.getAllByText(/Security/i);
      expect(securityElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const customElements = screen.getAllByText(/Custom1/i);
      expect(customElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const externalElements = screen.getAllByText(/ExternalLink/i);
      expect(externalElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });
  });
});
