import { renderHook } from '@clerk/shared/testUtils';
import { useMounted } from './useMounted';

describe('useMounted()', () => {
  it('returns ref indicating if a component is mounted', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current.current).toBe(true);
  });
});
