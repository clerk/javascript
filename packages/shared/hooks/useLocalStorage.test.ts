import { renderHook } from '@clerk/shared/testUtils';
import TestRenderer from 'react-test-renderer';

import { useLocalStorage } from './useLocalStorage';

const { act } = TestRenderer;

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

describe('useLocalStorage(key, initialValue)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('returns passed initial value', () => {
    const initialValue = 'initial';
    const { result } = renderHook(() => useLocalStorage('key', initialValue));
    const [storedValue, setStoredValue] = result.current;
    expect(storedValue).toBe(initialValue);
    expect(typeof setStoredValue).toBe('function');
  });

  it('ignores initial value returns previously saved value', () => {
    const previousVal = 'previousVal';
    window.localStorage.setItem('clerk:key', JSON.stringify(previousVal));

    const initialValue = 'initialVal';
    const { result } = renderHook(() => useLocalStorage('key', initialValue));
    const [storedValue] = result.current;

    expect(window.localStorage.getItem).toHaveBeenCalled();
    expect(storedValue).toBe(previousVal);
  });

  it('updates saved value', () => {
    const previousVal = 'previousVal';
    window.localStorage.setItem('clerk:key', JSON.stringify(previousVal));

    const initialValue = 'initialVal';
    const newValue = 'newVal';
    const { result } = renderHook(() => useLocalStorage('key', initialValue));

    expect(window.localStorage.getItem).toHaveBeenCalled();
    expect(result.current[0]).toBe(previousVal);

    act(() => {
      result.current[1](newValue);
    });

    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(result.current[0]).toBe(newValue);
  });
});
