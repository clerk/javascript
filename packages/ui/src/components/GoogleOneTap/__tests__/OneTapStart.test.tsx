import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/ui/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import type { PromptMomentNotification } from '../../../utils/one-tap';

// Capture the prompt listener so we can invoke it in tests
let capturedPromptListener: ((notification: PromptMomentNotification) => void) | undefined;

const mockGoogle = {
  accounts: {
    id: {
      initialize: vi.fn(),
      prompt: vi.fn((listener: (notification: PromptMomentNotification) => void) => {
        capturedPromptListener = listener;
      }),
      cancel: vi.fn(),
    },
  },
};

vi.mock('../../../utils/one-tap', async () => {
  const actual = await vi.importActual('../../../utils/one-tap');
  return {
    ...actual,
    loadGIS: vi.fn(() => Promise.resolve(mockGoogle)),
  };
});

const { createFixtures } = bindCreateFixtures('GoogleOneTap');

function createMockNotification(overrides: Partial<PromptMomentNotification> = {}): PromptMomentNotification {
  return {
    getMomentType: () => 'display',
    getDismissedReason: () => 'credential_returned',
    getNotDisplayedReason: () => 'browser_not_supported',
    getSkippedReason: () => 'auto_cancel',
    isDisplayMoment: () => true,
    isDismissedMoment: () => false,
    isSkippedMoment: () => false,
    isDisplayed: () => true,
    isNotDisplayed: () => false,
    ...overrides,
  };
}

// Dynamically import the component after mock is set up
const { OneTapStart } = await import('../one-tap-start');

describe('OneTapStart', () => {
  beforeEach(() => {
    clearFetchCache();
    capturedPromptListener = undefined;
    mockGoogle.accounts.id.initialize.mockClear();
    mockGoogle.accounts.id.prompt.mockClear();
    mockGoogle.accounts.id.cancel.mockClear();
  });

  it('calls onMoment when the prompt fires a display moment', async () => {
    const onMoment = vi.fn();
    const { wrapper, props } = await createFixtures(f => {
      f.withGoogleOneTap();
    });

    props.setProps({ onMoment });

    render(<OneTapStart />, { wrapper });

    await waitFor(() => {
      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
    });

    // Simulate Google firing a display moment
    const notification = createMockNotification({
      getMomentType: () => 'display',
      isDisplayMoment: () => true,
    });
    capturedPromptListener?.(notification);

    expect(onMoment).toHaveBeenCalledOnce();
    expect(onMoment).toHaveBeenCalledWith(notification);
  });

  it('calls onMoment and closes on skipped moment', async () => {
    const onMoment = vi.fn();
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withGoogleOneTap();
    });

    props.setProps({ onMoment });

    render(<OneTapStart />, { wrapper });

    await waitFor(() => {
      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
    });

    // Simulate Google firing a skipped moment
    const notification = createMockNotification({
      getMomentType: () => 'skipped',
      isSkippedMoment: () => true,
      isDisplayMoment: () => false,
    });
    capturedPromptListener?.(notification);

    expect(onMoment).toHaveBeenCalledOnce();
    expect(onMoment).toHaveBeenCalledWith(notification);
    // Existing behavior: closeGoogleOneTap is called on skipped moments
    expect(fixtures.clerk.closeGoogleOneTap).toHaveBeenCalled();
  });

  it('calls onMoment on dismissed moment without closing', async () => {
    const onMoment = vi.fn();
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withGoogleOneTap();
    });

    props.setProps({ onMoment });

    render(<OneTapStart />, { wrapper });

    await waitFor(() => {
      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
    });

    const notification = createMockNotification({
      getMomentType: () => 'dismissed',
      isDismissedMoment: () => true,
      isDisplayMoment: () => false,
    });
    capturedPromptListener?.(notification);

    expect(onMoment).toHaveBeenCalledOnce();
    expect(onMoment).toHaveBeenCalledWith(notification);
    // Should NOT close on dismissed (only on skipped)
    expect(fixtures.clerk.closeGoogleOneTap).not.toHaveBeenCalled();
  });

  it('handles prompt without onMoment prop gracefully', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withGoogleOneTap();
    });

    // No onMoment prop set
    props.setProps({});

    render(<OneTapStart />, { wrapper });

    await waitFor(() => {
      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
    });

    // Simulate a skipped moment — should not throw even without onMoment
    const notification = createMockNotification({
      getMomentType: () => 'skipped',
      isSkippedMoment: () => true,
      isDisplayMoment: () => false,
    });

    expect(() => capturedPromptListener?.(notification)).not.toThrow();
    // closeGoogleOneTap should still be called
    expect(fixtures.clerk.closeGoogleOneTap).toHaveBeenCalled();
  });
});
