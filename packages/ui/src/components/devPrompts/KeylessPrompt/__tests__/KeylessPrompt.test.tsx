import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { getCurrentState, getResolvedContent, KeylessPrompt } from '../index';
import {
  calculateVelocity,
  getCornerStyles,
  getNearestCorner,
  project,
  saveCornerPreference,
  STORAGE_KEY,
} from '../use-drag-to-corner';

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

describe('useDragToCorner utilities', () => {
  describe('getNearestCorner', () => {
    const corners = {
      'top-left': { x: -500, y: -500 },
      'top-right': { x: 500, y: -500 },
      'bottom-left': { x: -500, y: 500 },
      'bottom-right': { x: 0, y: 0 },
    } as const;

    it('returns the nearest corner to a given translation', () => {
      expect(getNearestCorner({ x: -400, y: -400 }, corners)).toBe('top-left');
      expect(getNearestCorner({ x: 400, y: -400 }, corners)).toBe('top-right');
      expect(getNearestCorner({ x: -400, y: 400 }, corners)).toBe('bottom-left');
      expect(getNearestCorner({ x: 10, y: 10 }, corners)).toBe('bottom-right');
    });

    it('returns the exact corner when translation matches', () => {
      expect(getNearestCorner({ x: 0, y: 0 }, corners)).toBe('bottom-right');
      expect(getNearestCorner({ x: -500, y: -500 }, corners)).toBe('top-left');
    });

    it('handles equidistant case by returning the first found', () => {
      // When equidistant from multiple corners, the iteration order determines the result
      const result = getNearestCorner({ x: 0, y: -500 }, corners);
      expect(['top-left', 'top-right']).toContain(result);
    });
  });

  describe('getCornerStyles', () => {
    it('returns correct CSS for top-left', () => {
      expect(getCornerStyles('top-left')).toEqual({ top: '1.25rem', left: '1.25rem' });
    });

    it('returns correct CSS for top-right', () => {
      expect(getCornerStyles('top-right')).toEqual({ top: '1.25rem', right: '1.25rem' });
    });

    it('returns correct CSS for bottom-left', () => {
      expect(getCornerStyles('bottom-left')).toEqual({ bottom: '1.25rem', left: '1.25rem' });
    });

    it('returns correct CSS for bottom-right', () => {
      expect(getCornerStyles('bottom-right')).toEqual({ bottom: '1.25rem', right: '1.25rem' });
    });
  });

  describe('saveCornerPreference', () => {
    afterEach(() => {
      localStorage.removeItem(STORAGE_KEY);
    });

    it('saves corner to localStorage', () => {
      saveCornerPreference('top-left');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('top-left');
    });

    it('overwrites previous value', () => {
      saveCornerPreference('top-left');
      saveCornerPreference('bottom-right');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('bottom-right');
    });
  });

  describe('project', () => {
    it('returns 0 for zero velocity', () => {
      expect(project(0)).toBe(0);
    });

    it('returns positive value for positive velocity', () => {
      expect(project(1000)).toBeGreaterThan(0);
    });

    it('returns negative value for negative velocity', () => {
      expect(project(-1000)).toBeLessThan(0);
    });

    it('scales proportionally with velocity', () => {
      const single = project(500);
      const double = project(1000);
      expect(double).toBeCloseTo(single * 2);
    });
  });

  describe('calculateVelocity', () => {
    it('returns zero for empty history', () => {
      expect(calculateVelocity([])).toEqual({ x: 0, y: 0 });
    });

    it('returns zero for single entry', () => {
      expect(calculateVelocity([{ position: { x: 10, y: 20 }, timestamp: 100 }])).toEqual({ x: 0, y: 0 });
    });

    it('returns zero when time delta is zero', () => {
      const history = [
        { position: { x: 0, y: 0 }, timestamp: 100 },
        { position: { x: 50, y: 50 }, timestamp: 100 },
      ];
      expect(calculateVelocity(history)).toEqual({ x: 0, y: 0 });
    });

    it('calculates velocity correctly using first and last entries', () => {
      const history = [
        { position: { x: 0, y: 0 }, timestamp: 0 },
        { position: { x: 50, y: 50 }, timestamp: 50 },
        { position: { x: 100, y: 200 }, timestamp: 100 },
      ];
      const velocity = calculateVelocity(history);
      // (100 - 0) / 100 * 1000 = 1000
      expect(velocity.x).toBe(1000);
      // (200 - 0) / 100 * 1000 = 2000
      expect(velocity.y).toBe(2000);
    });
  });
});
