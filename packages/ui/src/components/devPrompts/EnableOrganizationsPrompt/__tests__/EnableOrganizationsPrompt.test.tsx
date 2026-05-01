import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { EnableOrganizationsPrompt } from '../index';

const { createFixtures } = bindCreateFixtures('EnableOrganizationsPrompt' as any);

describe('EnableOrganizationsPrompt success state', () => {
  describe('unclaimed keyless, no user', () => {
    it('renders claim CTA instead of sign-in button after enabling orgs', async () => {
      const onSuccess = vi.fn();
      const mockEnableSetting = vi.fn().mockResolvedValue(undefined);

      const { wrapper, fixtures } = await createFixtures();

      // Set up keyless mode (both URLs required)
      (fixtures.options as any).__internal_keyless_claimKeylessApplicationUrl =
        'https://dashboard.clerk.com/claim?token=abc';
      (fixtures.options as any).__internal_keyless_copyInstanceKeysUrl =
        'https://dashboard.clerk.com/apps/app_123/instances/ins_456/api-keys';

      // Mock the enable setting API call
      fixtures.environment.__internal_enableEnvironmentSetting = mockEnableSetting;

      render(
        <EnableOrganizationsPrompt
          caller='OrganizationSwitcher'
          onSuccess={onSuccess}
        />,
        { wrapper },
      );

      // Click "Enable Organizations" to trigger the API call
      const enableButton = screen.getByRole('button', { name: /enable organizations/i });
      await enableButton.click();

      // Wait for the success state to render
      await vi.waitFor(() => {
        expect(screen.getByText(/Organizations are now enabled/i)).toBeInTheDocument();
      });

      // Should show claim CTA as an anchor, not "Sign in to continue"
      const claimLink = screen.getByRole('link', { name: /claim your application/i });
      expect(claimLink).toBeInTheDocument();
      expect(claimLink.tagName).toBe('A');
      expect(claimLink).toHaveAttribute('target', '_blank');
      expect(claimLink).toHaveAttribute('rel', 'noopener noreferrer');

      // href should stay raw until the user clicks, then pick up return_url
      const href = claimLink.getAttribute('href')!;
      expect(href).toContain('dashboard.clerk.com/claim');
      expect(href).not.toContain('return_url=');

      await claimLink.click();

      expect(claimLink.getAttribute('href')).toContain('return_url=');

      // Should show "I'll do it later" button
      expect(screen.getByRole('button', { name: /i.ll do it later/i })).toBeInTheDocument();

      // Should NOT show "Sign in to continue"
      expect(screen.queryByText(/sign in to continue/i)).not.toBeInTheDocument();

      // redirectToSignIn should NOT have been called
      expect(fixtures.clerk.redirectToSignIn).not.toHaveBeenCalled();
    });

    it('"I\'ll do it later" calls onSuccess', async () => {
      const onSuccess = vi.fn();
      const mockEnableSetting = vi.fn().mockResolvedValue(undefined);

      const { wrapper, fixtures } = await createFixtures();

      (fixtures.options as any).__internal_keyless_claimKeylessApplicationUrl =
        'https://dashboard.clerk.com/claim?token=abc';
      (fixtures.options as any).__internal_keyless_copyInstanceKeysUrl =
        'https://dashboard.clerk.com/apps/app_123/instances/ins_456/api-keys';
      fixtures.environment.__internal_enableEnvironmentSetting = mockEnableSetting;

      render(
        <EnableOrganizationsPrompt
          caller='OrganizationSwitcher'
          onSuccess={onSuccess}
        />,
        { wrapper },
      );

      const enableButton = screen.getByRole('button', { name: /enable organizations/i });
      await enableButton.click();

      await vi.waitFor(() => {
        expect(screen.getByText(/Organizations are now enabled/i)).toBeInTheDocument();
      });

      const laterButton = screen.getByRole('button', { name: /i.ll do it later/i });
      await laterButton.click();

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('unclaimed keyless, signed-in user', () => {
    it('renders claim CTA with Continue button and preserves default org name', async () => {
      const onSuccess = vi.fn();
      const mockEnableSetting = vi.fn().mockResolvedValue(undefined);
      const mockGetMemberships = vi.fn().mockResolvedValue({
        data: [{ organization: { name: 'My Org' } }],
      });

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      (fixtures.options as any).__internal_keyless_claimKeylessApplicationUrl =
        'https://dashboard.clerk.com/claim?token=abc';
      (fixtures.options as any).__internal_keyless_copyInstanceKeysUrl =
        'https://dashboard.clerk.com/apps/app_123/instances/ins_456/api-keys';
      fixtures.environment.__internal_enableEnvironmentSetting = mockEnableSetting;
      (fixtures.clerk.user as any).getOrganizationMemberships = mockGetMemberships;

      render(
        <EnableOrganizationsPrompt
          caller='OrganizationSwitcher'
          onSuccess={onSuccess}
        />,
        { wrapper },
      );

      const enableButton = screen.getByRole('button', { name: /enable organizations/i });
      await enableButton.click();

      await vi.waitFor(() => {
        expect(screen.getByText(/Organizations are now enabled/i)).toBeInTheDocument();
      });

      // Should show "Continue" button AND claim CTA
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      const claimLink = screen.getByRole('link', { name: /claim your application/i });
      expect(claimLink).toBeInTheDocument();

      // Should NOT show dashboard link (unclaimed keyless can't access it)
      expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();

      // Should mention the default org name
      await vi.waitFor(() => {
        expect(screen.getByText(/My Org/i)).toBeInTheDocument();
      });
    });
  });

  describe('claimed keyless, no user', () => {
    it('renders Sign in to continue button', async () => {
      const onSuccess = vi.fn();
      const mockEnableSetting = vi.fn().mockResolvedValue(undefined);

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withClaimedAt(new Date().toISOString());
      });

      (fixtures.options as any).__internal_keyless_claimKeylessApplicationUrl =
        'https://dashboard.clerk.com/claim?token=abc';
      (fixtures.options as any).__internal_keyless_copyInstanceKeysUrl =
        'https://dashboard.clerk.com/apps/app_123/instances/ins_456/api-keys';
      fixtures.environment.__internal_enableEnvironmentSetting = mockEnableSetting;

      render(
        <EnableOrganizationsPrompt
          caller='OrganizationSwitcher'
          onSuccess={onSuccess}
        />,
        { wrapper },
      );

      const enableButton = screen.getByRole('button', { name: /enable organizations/i });
      await enableButton.click();

      await vi.waitFor(() => {
        expect(screen.getByText(/Organizations feature enabled/i)).toBeInTheDocument();
      });

      // Should show "Sign in to continue", not claim CTA
      expect(screen.getByRole('button', { name: /sign in to continue/i })).toBeInTheDocument();
      expect(screen.queryByText(/claim your application/i)).not.toBeInTheDocument();
    });
  });

  describe('non-keyless, no user', () => {
    it('renders Sign in to continue button', async () => {
      const onSuccess = vi.fn();
      const mockEnableSetting = vi.fn().mockResolvedValue(undefined);

      const { wrapper, fixtures } = await createFixtures();

      // No keyless URLs set — this is a regular dev instance
      fixtures.environment.__internal_enableEnvironmentSetting = mockEnableSetting;

      render(
        <EnableOrganizationsPrompt
          caller='OrganizationSwitcher'
          onSuccess={onSuccess}
        />,
        { wrapper },
      );

      const enableButton = screen.getByRole('button', { name: /enable organizations/i });
      await enableButton.click();

      await vi.waitFor(() => {
        expect(screen.getByText(/Organizations feature enabled/i)).toBeInTheDocument();
      });

      // Should show "Sign in to continue"
      expect(screen.getByRole('button', { name: /sign in to continue/i })).toBeInTheDocument();
      expect(screen.queryByText(/claim your application/i)).not.toBeInTheDocument();
    });
  });
});
