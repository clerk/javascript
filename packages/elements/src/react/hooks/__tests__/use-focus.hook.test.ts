import { fireEvent, renderHook } from '@testing-library/react';

import { useFocus } from '../use-focus.hook';

describe('useFocus', () => {
  it('should set isFocused to true when input is focused', () => {
    const inputRef = { current: document.createElement('input') };
    const { result } = renderHook(() => useFocus(inputRef));

    fireEvent.focus(inputRef.current);
    expect(result.current).toBe(true);
  });

  it('should set isFocused to false when input is blurred', () => {
    const inputRef = { current: document.createElement('input') };
    const { result } = renderHook(() => useFocus(inputRef));

    fireEvent.focus(inputRef.current);
    expect(result.current).toBe(true);
    fireEvent.blur(inputRef.current);
    expect(result.current).toBe(false);
  });

  it('should return false when inputRef is null', () => {
    const inputRef = { current: null };
    const { result } = renderHook(() => useFocus(inputRef));

    expect(result.current).toBe(false);
  });
});
