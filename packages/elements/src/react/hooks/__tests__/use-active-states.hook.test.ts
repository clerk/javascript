import { act, renderHook } from '@testing-library/react';
import { createActor, createMachine } from 'xstate';

import { useActiveStates } from '../use-active-states.hook';

describe('useActiveStates', () => {
  const machine = createMachine({
    id: 'toggle',
    initial: 'inactive',
    states: {
      inactive: {
        on: { toggle: 'active' },
      },
      active: {
        on: { toggle: 'inactive' },
      },
      reset: {
        on: { toggle: 'inactive' },
      },
    },
  });

  const actor = createActor(machine).start();

  it('should return false for invalid states param', () => {
    const { result } = renderHook(() => useActiveStates(actor, 1 as any));

    expect(result.current).toBe(false);
  });

  describe('single state', () => {
    it('should return true if state is active', () => {
      const { result } = renderHook(() => useActiveStates(actor, 'inactive'));

      expect(result.current).toBe(true);
    });

    it('should return false if state is not active', () => {
      const { result } = renderHook(() => useActiveStates(actor, 'active'));

      expect(result.current).toBe(false);
    });
  });

  describe('multiple states', () => {
    it('should return true if any state is active', () => {
      const { result } = renderHook(() => useActiveStates(actor, ['inactive', 'active']));

      expect(result.current).toBe(true);
    });

    it('should return false if no state is active', () => {
      const { result } = renderHook(() => useActiveStates(actor, ['active', 'reset']));

      expect(result.current).toBe(false);
    });

    it('should return true if valid active state switches', () => {
      const { result } = renderHook(() => useActiveStates(actor, ['inactive', 'active']));

      expect(result.current).toBe(true);
      act(() => actor.send({ type: 'toggle' }));
      expect(result.current).toBe(true);
    });
  });
});
