import type { JwtPayload } from '@clerk/shared/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAms } from '../useAms';

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}));

vi.mock('@clerk/shared/react', () => ({
  useSession: mockUseSession,
}));

const mockClaims = (claims: JwtPayload | undefined) => {
  mockUseSession.mockReturnValue({
    session: claims
      ? {
          lastActiveToken: {
            jwt: { claims },
          },
        }
      : null,
  });
};

describe('useAms', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
  });

  it('returns inactive when the ams claim is absent', () => {
    mockClaims({ __raw: 'token' } as JwtPayload);

    const { result } = renderHook(() => useAms());

    expect(result.current).toEqual({ isActive: false });
  });

  it('returns active when the ams claim is present without reading its value', () => {
    const claims = { __raw: 'token' } as JwtPayload;
    Object.defineProperty(claims, 'ams', {
      enumerable: true,
      get: () => {
        throw new Error('ams should be opaque');
      },
    });
    mockClaims(claims);

    const { result } = renderHook(() => useAms());

    expect(result.current).toEqual({ isActive: true });
  });
});
