import { renderHook } from '@clerk/shared/testUtils';

import { useInput } from './useInput';

describe('useInput(callback)', () => {
  it('returns ref', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useInput(callback));

    expect(result.current.onChange).toBeInstanceOf(Function);
    expect(result.current.onKeyPress).toBeInstanceOf(Function);
    expect(result.current.ref).toBeDefined();
  });
});
