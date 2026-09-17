import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAccessibleDescriptionWarning } from '../useAccessibleDescriptionWarning';
import { useAccessibleNameWarning } from '../useAccessibleNameWarning';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('accessible warning part names', () => {
  it.each([
    {
      name: 'accessible name warning',
      useWarning: useAccessibleNameWarning,
      initialPart: 'Card.Title',
      nextPart: 'Profile.Title',
    },
    {
      name: 'accessible description warning',
      useWarning: useAccessibleDescriptionWarning,
      initialPart: 'Dialog.Description',
      nextPart: 'Card.Description',
    },
  ])('updates the $name when its suggested part changes', async ({ useWarning, initialPart, nextPart }) => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const node = document.createElement('div');
    node.setAttribute('role', 'alertdialog');
    document.body.append(node);

    const { rerender } = renderHook(({ part }) => useWarning(node, 'Dialog', part), {
      initialProps: { part: initialPart },
    });
    await act(() => {
      vi.runAllTimers();
    });
    expect(warn).toHaveBeenLastCalledWith(expect.stringContaining(`<${initialPart}>`));
    warn.mockClear();

    rerender({ part: nextPart });
    await act(() => {
      vi.runAllTimers();
    });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`<${nextPart}>`));
  });
});
