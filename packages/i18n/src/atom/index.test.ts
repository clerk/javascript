import { describe, expect, it, vi } from 'vitest';

import { atom } from './index';

describe('atom', () => {
  it('reads and writes its value', () => {
    const $a = atom(1);
    expect($a.get()).toBe(1);
    $a.set(2);
    expect($a.get()).toBe(2);
  });

  it('subscribe fires immediately with the current value and on every change', () => {
    const $a = atom(1);
    const cb = vi.fn();

    const unsubscribe = $a.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toBe(1);

    $a.set(2);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[1][0]).toBe(2);

    unsubscribe();
    $a.set(3);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('listen skips the current value and fires only on change', () => {
    const $a = atom(1);
    const cb = vi.fn();

    const unsubscribe = $a.listen(cb);
    expect(cb).not.toHaveBeenCalled();

    $a.set(2);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toBe(2);

    unsubscribe();
    $a.set(3);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not notify when set to an equal value', () => {
    const $a = atom(1);
    const cb = vi.fn();
    $a.listen(cb);
    $a.set(1);
    expect(cb).not.toHaveBeenCalled();
  });
});
