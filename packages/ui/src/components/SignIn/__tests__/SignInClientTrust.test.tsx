import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInClientTrust } from '../SignInClientTrust';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInClientTrust', () => {
  describe('Use another method', () => {
    it('does not render when only one verification factor is available', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: true });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.queryByText('Use another method')).not.toBeInTheDocument();
    });

    it('renders when multiple verification factors are available', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: true, supportEmailCode: true });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.getByText('Use another method')).toBeInTheDocument();
    });
  });
});
