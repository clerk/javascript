import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../utils/form-error';
import { useOrganizationProfileDangerActionController } from './organization-profile-danger-action.controller';

afterEach(() => {
  vi.restoreAllMocks();
});

function confirmWith(onRun: () => Promise<void>) {
  const { result } = renderHook(() => useOrganizationProfileDangerActionController({ onRun }));
  act(() => result.current.onOpenChange(true));
  act(() => result.current.onConfirm());
  return result;
}

describe('useOrganizationProfileDangerActionController', () => {
  it('shows the localized copy for the code a refusal carries and stays open', async () => {
    const result = confirmWith(() =>
      Promise.reject(new SaveError({ global: { code: 'action_blocked', message: 'Raw server sentence.' } })),
    );

    await waitFor(() => expect(result.current.errorMessage).toMatch(/contact support/));
    expect(result.current.isOpen).toBe(true);
  });

  it('shows the generic error, never the message, of an unexpected error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = confirmWith(() => Promise.reject(new Error('Cannot read properties of undefined')));

    await waitFor(() => expect(result.current.errorMessage).toBe('Something went wrong. Please try again.'));
  });

  it('clears the error when cancelled', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = confirmWith(() => Promise.reject(new Error('internal')));
    await waitFor(() => expect(result.current.errorMessage).toBeDefined());

    act(() => result.current.onOpenChange(false));

    expect(result.current.errorMessage).toBeUndefined();
  });
});
