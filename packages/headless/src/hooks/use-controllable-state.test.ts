import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  describe('uncontrolled mode', () => {
    it('uses defaultValue when controlled is undefined', () => {
      const { result } = renderHook(() => useControllableState<string>(undefined, 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('updates internal state on setValue', () => {
      const { result } = renderHook(() => useControllableState<string>(undefined, 'initial'));

      act(() => result.current[1]('updated'));

      expect(result.current[0]).toBe('updated');
    });

    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<string>(undefined, 'initial', onChange));

      act(() => result.current[1]('new'));

      expect(onChange).toHaveBeenCalledWith('new');
    });
  });

  describe('controlled mode', () => {
    it('uses controlled value over default', () => {
      const { result } = renderHook(() => useControllableState<string>('controlled', 'default'));
      expect(result.current[0]).toBe('controlled');
    });

    it('does not update internal state when controlled', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<string>('controlled', 'default', onChange));

      act(() => result.current[1]('new'));

      // Value stays controlled
      expect(result.current[0]).toBe('controlled');
      // But onChange still fires
      expect(onChange).toHaveBeenCalledWith('new');
    });

    it('reflects new controlled value on rerender', () => {
      const { result, rerender } = renderHook(({ controlled }) => useControllableState(controlled, 'default'), {
        initialProps: { controlled: 'a' as string | undefined },
      });

      expect(result.current[0]).toBe('a');

      rerender({ controlled: 'b' });

      expect(result.current[0]).toBe('b');
    });
  });

  describe('switching modes', () => {
    it('switches from uncontrolled to controlled', () => {
      const { result, rerender } = renderHook(({ controlled }) => useControllableState(controlled, 'default'), {
        initialProps: { controlled: undefined as string | undefined },
      });

      expect(result.current[0]).toBe('default');

      rerender({ controlled: 'now-controlled' });

      expect(result.current[0]).toBe('now-controlled');
    });
  });
});
