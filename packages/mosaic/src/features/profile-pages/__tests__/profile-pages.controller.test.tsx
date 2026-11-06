import { logger } from '@clerk/shared/logger';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useVirtualSegment, VirtualStoreProvider } from '../../../routing/virtual-store';
import { useProfilePagesController } from '../profile-pages.controller';

const wrapper = ({ children }: { children: ReactNode }) => <VirtualStoreProvider>{children}</VirtualStoreProvider>;

describe('useProfilePagesController', () => {
  it('routes nothing and warns about nothing while there are no pages', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const { result } = renderHook(
      () => ({
        pages: useProfilePagesController([], { routing: 'virtual', path: '/organization' }),
        segment: useVirtualSegment('/organization'),
      }),
      { wrapper },
    );

    expect(result.current.segment).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('makes the first page the root and gives the others their segments', () => {
    const { result } = renderHook(
      () => ({
        pages: useProfilePagesController(['general', 'apiKeys'], { routing: 'virtual', path: '/organization' }),
        segment: useVirtualSegment('/organization'),
      }),
      { wrapper },
    );
    expect(result.current.pages.activePage).toBe('general');
    expect(result.current.segment).toBeUndefined();
  });
});
