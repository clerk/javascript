import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { UserProfile } from '../UserProfile';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('UserProfile', () => {
  describe('Navigation', () => {
    it('includes buttons for the bigger sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'] });
      });

      render(<UserProfile />, { wrapper });
      const accountElements = screen.getAllByText(/Account/i);
      expect(accountElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
      const securityElements = screen.getAllByText(/Security/i);
      expect(securityElements.some(el => el.tagName.toUpperCase() === 'BUTTON')).toBe(true);
    });
  });
});
