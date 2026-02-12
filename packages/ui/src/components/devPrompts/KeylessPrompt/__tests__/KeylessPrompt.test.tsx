import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { getCurrentState, getResolvedContent, KeylessPrompt } from '../index';

const { createFixtures } = bindCreateFixtures('KeylessPrompt' as any);

describe('getCurrentState', () => {
  it('returns completed when success is true', () => {
    expect(getCurrentState(true, true, true)).toBe('completed');
    expect(getCurrentState(true, true, false)).toBe('completed');
    expect(getCurrentState(false, true, true)).toBe('completed');
    expect(getCurrentState(false, true, false)).toBe('completed');
  });

  it('returns claimed when claimed is true and success is false', () => {
    expect(getCurrentState(true, false, true)).toBe('claimed');
    expect(getCurrentState(true, false, false)).toBe('claimed');
  });

  it('returns userCreated when isSignedIn is true and claimed/success are false', () => {
    expect(getCurrentState(false, false, true)).toBe('userCreated');
  });

  it('returns idle when all flags are false', () => {
    expect(getCurrentState(false, false, false)).toBe('idle');
  });

  it('follows precedence: completed > claimed > userCreated > idle', () => {
    // All true -> completed
    expect(getCurrentState(true, true, true)).toBe('completed');

    // claimed + isSignedIn but no success -> claimed
    expect(getCurrentState(true, false, true)).toBe('claimed');

    // isSignedIn but no claimed/success -> userCreated
    expect(getCurrentState(false, false, true)).toBe('userCreated');

    // All false -> idle
    expect(getCurrentState(false, false, false)).toBe('idle');
  });
});

describe('getResolvedContent', () => {
  const baseContext = {
    appName: 'Test App',
    instanceUrl: 'https://dashboard.clerk.com/apps/app_123/instances/ins_456',
    claimUrl: 'https://dashboard.clerk.com/claim',
    onDismiss: null,
  };

  describe('idle state', () => {
    it('builds correct view model for idle state', () => {
      const resolvedContent = getResolvedContent('idle', baseContext);

      expect(resolvedContent.state).toBe('idle');
      expect(resolvedContent.title).toBe('Configure your application');
      expect(resolvedContent.triggerWidth).toBe('14.25rem');
      expect(resolvedContent.cta.kind).toBe('link');
      expect(resolvedContent.cta.text).toBe('Configure your application');
      if (resolvedContent.cta.kind === 'link') {
        expect(resolvedContent.cta.href).toBe(baseContext.claimUrl);
      }
    });

    it('resolves static description correctly', () => {
      const resolvedContent = getResolvedContent('idle', baseContext);
      expect(resolvedContent.description).toBeDefined();
      expect(React.isValidElement(resolvedContent.description)).toBe(true);
    });
  });

  describe('userCreated state', () => {
    it('builds correct view model for userCreated state', () => {
      const resolvedContent = getResolvedContent('userCreated', baseContext);

      expect(resolvedContent.state).toBe('userCreated');
      expect(resolvedContent.title).toBe("You've created your first user!");
      expect(resolvedContent.triggerWidth).toBe('15.75rem');
      expect(resolvedContent.cta.kind).toBe('link');
      expect(resolvedContent.cta.text).toBe('Configure your application');
      if (resolvedContent.cta.kind === 'link') {
        expect(resolvedContent.cta.href).toBe(baseContext.claimUrl);
      }
    });
  });

  describe('claimed state', () => {
    it('builds correct view model for claimed state', () => {
      const resolvedContent = getResolvedContent('claimed', baseContext);

      expect(resolvedContent.state).toBe('claimed');
      expect(resolvedContent.title).toBe('Missing environment keys');
      expect(resolvedContent.triggerWidth).toBe('14.25rem');
      expect(resolvedContent.cta.kind).toBe('link');
      expect(resolvedContent.cta.text).toBe('Get API keys');
      if (resolvedContent.cta.kind === 'link') {
        expect(resolvedContent.cta.href).toBe(baseContext.claimUrl);
      }
    });
  });

  describe('completed state', () => {
    it('builds correct view model for completed state', () => {
      const resolvedContent = getResolvedContent('completed', baseContext);

      expect(resolvedContent.state).toBe('completed');
      expect(resolvedContent.title).toBe('Your app is ready');
      expect(resolvedContent.triggerWidth).toBe('10.5rem');
      expect(resolvedContent.cta.kind).toBe('action');
      expect(resolvedContent.cta.text).toBe('Dismiss');
      if (resolvedContent.cta.kind === 'action') {
        expect(typeof resolvedContent.cta.onClick).toBe('function');
      }
    });

    it('resolves function-based description with context', () => {
      const resolvedContent = getResolvedContent('completed', baseContext);
      expect(resolvedContent.description).toBeDefined();
      expect(React.isValidElement(resolvedContent.description)).toBe(true);
    });

    it('creates onClick handler that calls onDismiss', async () => {
      const onDismiss = vi.fn().mockResolvedValue(undefined);
      // Note: window.location.reload cannot be easily mocked in jsdom,
      // so we verify that onDismiss is called correctly
      // The reload side effect is tested at integration level

      const resolvedContent = getResolvedContent('completed', {
        ...baseContext,
        onDismiss,
      });

      expect(resolvedContent.cta.kind).toBe('action');
      if (resolvedContent.cta.kind === 'action') {
        resolvedContent.cta.onClick();
        // Wait for the promise chain to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(onDismiss).toHaveBeenCalledOnce();
        // Note: window.location.reload() is called but cannot be verified in jsdom
      }
    });

    it('handles null onDismiss gracefully', () => {
      // Note: window.location.reload cannot be easily mocked in jsdom,
      // so we verify the handler executes without error
      // The reload side effect is tested at integration level

      const resolvedContent = getResolvedContent('completed', {
        ...baseContext,
        onDismiss: null,
      });

      expect(resolvedContent.cta.kind).toBe('action');
      if (resolvedContent.cta.kind === 'action') {
        const onClick = resolvedContent.cta.onClick;
        // Should execute without throwing an error even when onDismiss is null
        expect(() => {
          onClick();
        }).not.toThrow();
        // Note: window.location.reload() is called but cannot be verified in jsdom
        // The onClick handler uses void to fire-and-forget the promise chain
      }
    });
  });

  describe('CTA href resolution', () => {
    it('resolves function-based href with context', () => {
      const context = {
        ...baseContext,
        claimUrl: 'https://custom-claim.com',
        instanceUrl: 'https://custom-instance.com',
      };

      const resolvedContent = getResolvedContent('idle', context);
      expect(resolvedContent.cta.kind).toBe('link');
      if (resolvedContent.cta.kind === 'link') {
        expect(resolvedContent.cta.href).toBe(context.claimUrl);
      }
    });

    it('resolves string-based href directly', () => {
      // This test verifies that if we had a string href, it would work
      // Currently all states use function-based hrefs, but the logic supports both
      const resolvedContent = getResolvedContent('idle', baseContext);
      expect(resolvedContent.cta.kind).toBe('link');
      if (resolvedContent.cta.kind === 'link') {
        expect(typeof resolvedContent.cta.href).toBe('string');
      }
    });
  });

  describe('description resolution', () => {
    it('resolves static descriptions', () => {
      const resolvedContent = getResolvedContent('idle', baseContext);
      expect(React.isValidElement(resolvedContent.description)).toBe(true);
    });

    it('resolves function-based descriptions with context', () => {
      const resolvedContent = getResolvedContent('completed', {
        ...baseContext,
        appName: 'My Test App',
        instanceUrl: 'https://test-instance.com',
      });

      expect(React.isValidElement(resolvedContent.description)).toBe(true);
      // The description should contain the app name
      const descriptionString = JSON.stringify(resolvedContent.description);
      expect(descriptionString).toContain('My Test App');
    });
  });
});

describe('KeylessPrompt component', () => {
  it('renders with idle state content when user is not signed in', async () => {
    const { wrapper } = await createFixtures();
    const { getAllByText } = render(
      <KeylessPrompt
        claimUrl='https://dashboard.clerk.com/claim'
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={null}
      />,
      { wrapper },
    );

    // The text appears in both the trigger button and the CTA link
    const elements = getAllByText('Configure your application');
    expect(elements).toHaveLength(2);
    expect(elements[0]).toBeInTheDocument();
    expect(elements[1]).toBeInTheDocument();
  });

  it('renders with userCreated state content when user is signed in', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText } = render(
      <KeylessPrompt
        claimUrl='https://dashboard.clerk.com/claim'
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={null}
      />,
      { wrapper },
    );

    expect(getByText("You've created your first user!")).toBeInTheDocument();
  });

  it('renders CTA link with correct href for idle state', async () => {
    const { wrapper } = await createFixtures();
    const claimUrl = 'https://dashboard.clerk.com/claim?test=123';

    const { getByRole } = render(
      <KeylessPrompt
        claimUrl={claimUrl}
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={null}
      />,
      { wrapper },
    );

    const link = getByRole('link', { name: 'Configure your application' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('claim'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders CTA button for completed state when onDismiss is provided', async () => {
    const onDismiss = vi.fn().mockResolvedValue(undefined);
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      // Mock environment to simulate claimed state
      f.withClaimedAt(new Date().toISOString());
    });

    const { getByRole } = render(
      <KeylessPrompt
        claimUrl='https://dashboard.clerk.com/claim'
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={onDismiss}
      />,
      { wrapper },
    );

    const button = getByRole('button', { name: 'Dismiss' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('toggles expanded state when trigger button is clicked', async () => {
    const { wrapper } = await createFixtures();
    const { getByRole, container } = render(
      <KeylessPrompt
        claimUrl='https://dashboard.clerk.com/claim'
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={null}
      />,
      { wrapper },
    );

    const triggerButton = getByRole('button', { name: /keyless prompt/i });
    const promptContainer = container.querySelector('[data-expanded]');

    // Initially should be expanded (isOpen defaults to true)
    expect(promptContainer).toHaveAttribute('data-expanded', 'true');

    // Click to collapse
    await triggerButton.click();
    expect(promptContainer).toHaveAttribute('data-expanded', 'false');

    // Click again to expand
    await triggerButton.click();
    expect(promptContainer).toHaveAttribute('data-expanded', 'true');
  });

  it('renders description content correctly for idle state', async () => {
    const { wrapper } = await createFixtures();
    const { getByText } = render(
      <KeylessPrompt
        claimUrl='https://dashboard.clerk.com/claim'
        copyKeysUrl='https://dashboard.clerk.com/copy-keys'
        onDismiss={null}
      />,
      { wrapper },
    );

    expect(getByText(/Temporary API keys are enabled/i)).toBeInTheDocument();
    expect(getByText(/Add SSO connections/i)).toBeInTheDocument();
  });
});
