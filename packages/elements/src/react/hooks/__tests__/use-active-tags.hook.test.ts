import { renderHook } from '@testing-library/react';
import { createActor, createMachine } from 'xstate';

import { catchHookError } from '~/utils/test-utils';

import { ActiveTagsMode, useActiveTags } from '../use-active-tags.hook';

describe('useActiveTags', () => {
  const allTags = ['foo', 'bar'];

  const machine = createMachine({
    initial: 'idle',
    states: {
      idle: {
        tags: allTags,
      },
    },
  });

  const actor = createActor(machine).start();

  it('should throw an error for invalid tags param', () => {
    const error = catchHookError(() => useActiveTags(actor, 1 as any));
    expect(error.message).toEqual('Invalid tags parameter provided to useActiveTags');
  });

  it('should return false for invalid mode param', () => {
    const { result } = renderHook(() => useActiveTags(actor, allTags, 'invalid' as any));
    expect(result.current).toBe(false);
  });

  describe('single tag', () => {
    it('should return true if tag exists', () => {
      const { result } = renderHook(() => useActiveTags(actor, 'bar'));
      expect(result.current).toBe(true);
    });

    it('should return false if tag does not exist', () => {
      const { result } = renderHook(() => useActiveTags(actor, 'baz'));
      expect(result.current).toBe(false);
    });
  });

  describe('multiple tags', () => {
    describe('matching any', () => {
      it('should return true and active tags if all tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, allTags));
        expect(result.current.active).toBe(true);
        expect(result.current.activeTags).toEqual(new Set(allTags));
      });

      it('should return true and active tags if any tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, ['bar']));
        expect(result.current.active).toBe(true);
        expect(result.current.activeTags).toEqual(new Set(['bar']));
      });

      it('should return false and an empty Set if no tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, ['baz']));
        expect(result.current.active).toBe(false);
        expect(result.current.activeTags).toEqual(new Set());
      });
    });

    describe('matching all', () => {
      it('should return true if all tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, allTags, ActiveTagsMode.all));
        expect(result.current).toBe(true);
      });

      it('should return false if not all tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, ['bar'], ActiveTagsMode.all));
        expect(result.current).toBe(false);
      });

      it('should return false if no tags are active', () => {
        const { result } = renderHook(() => useActiveTags(actor, ['baz'], ActiveTagsMode.all));
        expect(result.current).toBe(false);
      });
    });
  });
});
