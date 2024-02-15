import { renderHook } from '@testing-library/react';
import { createActor, createMachine } from 'xstate';

import { ActiveTagsMode, useActiveTags } from './use-active-tags.hook';

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

  describe('single tag', () => {
    it('should return true if any tags are active', () => {
      const { result } = renderHook(() => useActiveTags(actor, 'bar'));
      expect(result.current).toBe(true);
    });

    it('should return false if any tags are active', () => {
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

      it('should return false and any empty Set if no tags are active', () => {
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

      it("should return false if all tags aren't active", () => {
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
