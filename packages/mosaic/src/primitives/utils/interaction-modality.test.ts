import { describe, expect, it } from 'vitest';

import { isKeyboardEvent, isKeyboardOpen } from './interaction-modality';

// A click a browser dispatches for Enter/Space on a button: no pointer behind it.
function keyboardClick() {
  return new MouseEvent('click', { detail: 0 });
}

function pointerClick() {
  return new MouseEvent('click', { detail: 1 });
}

describe('isKeyboardEvent', () => {
  it('is true for key events', () => {
    expect(isKeyboardEvent(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true);
    expect(isKeyboardEvent(new KeyboardEvent('keyup', { key: ' ' }))).toBe(true);
  });

  it('is true for the click a button dispatches for Enter or Space', () => {
    expect(isKeyboardEvent(keyboardClick())).toBe(true);
  });

  it('is false for a pointer click', () => {
    expect(isKeyboardEvent(pointerClick())).toBe(false);
  });

  it('is false for a pointer press that dismisses the popup', () => {
    expect(isKeyboardEvent(new MouseEvent('mousedown', { detail: 1 }))).toBe(false);
  });
});

describe('isKeyboardOpen', () => {
  it('is false when nothing recorded an open event', () => {
    expect(isKeyboardOpen({ dataRef: { current: {} } })).toBe(false);
  });

  it('follows the modality of the recorded open event', () => {
    expect(isKeyboardOpen({ dataRef: { current: { openEvent: keyboardClick() } } })).toBe(true);
    expect(isKeyboardOpen({ dataRef: { current: { openEvent: pointerClick() } } })).toBe(false);
  });
});
