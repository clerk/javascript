import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useDomainListController } from '../domain-list.controller';
import type { DomainListModel } from '../domain-list.types';

const observer = vi.hoisted(() => ({ onChange: undefined as ((inView: boolean) => void) | undefined, ref: vi.fn() }));
vi.mock('@/ui/hooks', () => ({
  useInView: (options: { onChange: (inView: boolean) => void }) => {
    observer.onChange = options.onChange;
    return { ref: observer.ref };
  },
}));

describe('Domain pagination lifecycle', () => {
  it('fetches only with an active sentinel and ignores retained callbacks after unmount', () => {
    const model: DomainListModel = {
      scope: 'scope',
      hasOrganization: true,
      canManageDomains: true,
      rows: [],
      isLoading: false,
      canFetchNext: true,
      showSpinner: false,
      fetchNext: vi.fn(),
    };
    const { result, rerender, unmount } = renderHook(() => useDomainListController(model));
    expect(result.current.sentinelRef).toBe(observer.ref);
    observer.onChange!(false);
    expect(model.fetchNext).not.toHaveBeenCalled();
    observer.onChange!(true);
    expect(model.fetchNext).toHaveBeenCalledOnce();
    model.canFetchNext = false;
    rerender();
    expect(result.current.sentinelRef).toBeUndefined();
    observer.onChange!(true);
    expect(model.fetchNext).toHaveBeenCalledOnce();
    model.canFetchNext = true;
    rerender();
    const retained = observer.onChange!;
    unmount();
    retained(true);
    expect(model.fetchNext).toHaveBeenCalledOnce();
  });
});
