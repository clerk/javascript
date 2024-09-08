import { renderHook } from '@testing-library/react';

import { usePrevious } from '../use-previous';

describe('usePrevious', () => {
  it('should retain the previous value', () => {
    const { result, rerender } = renderHook((props: string) => usePrevious(props), { initialProps: 'foo' });
    expect(result.current).toBeUndefined();

    rerender('bar');
    expect(result.current).toBe('foo');

    rerender('baz');
    expect(result.current).toBe('bar');
  });
});
