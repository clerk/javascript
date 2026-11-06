import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { acquireKeyboardInset } from './keyboard-inset';

class FakeViewport extends EventTarget {
  height = 768;
  offsetTop = 0;
  scale = 1;
}

let viewport: FakeViewport;
// What a fixed `100svh` box measures: Safari keeps it at the full height, Chrome on iOS shrinks it
// to the visible band as the keyboard opens.
let smallViewportHeight = 768;
// What a fixed box from the top edge to the bottom edge measures: the box the dialog's overlay
// fills, which iOS can make taller than the document's client height.
let fixedBoxHeight = 768;
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

function inset() {
  return document.documentElement.style.getPropertyValue('--_cl-keyboard-inset');
}

function offset() {
  return document.documentElement.style.getPropertyValue('--_cl-keyboard-offset');
}

beforeEach(() => {
  viewport = new FakeViewport();
  smallViewportHeight = 768;
  fixedBoxHeight = 768;
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.style.height === '100svh') {
        return smallViewportHeight;
      }
      return this.style.position === 'fixed' && this.style.bottom === '0px' ? fixedBoxHeight : 0;
    },
  });
});

afterEach(() => {
  Reflect.deleteProperty(window, 'visualViewport');
  if (offsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight);
  }
});

describe('acquireKeyboardInset', () => {
  it('publishes the inset as soon as the visible band changes', () => {
    const release = acquireKeyboardInset();
    expect(inset()).toBe('0px');

    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));
    expect(inset()).toBe('268px');

    viewport.offsetTop = 100;
    viewport.dispatchEvent(new Event('scroll'));
    expect(inset()).toBe('168px');
    release();
  });

  it('publishes how far the browser has panned the visible band while the keyboard is up', () => {
    const release = acquireKeyboardInset();
    viewport.offsetTop = 40;
    viewport.dispatchEvent(new Event('scroll'));
    expect(offset()).toBe('0px');

    viewport.height = 500;
    viewport.offsetTop = 100;
    viewport.dispatchEvent(new Event('resize'));
    expect(offset()).toBe('100px');

    release();
    expect(offset()).toBe('');
  });

  it('measures the keyboard against the box the overlay fills, not the document height', () => {
    fixedBoxHeight = 852;
    smallViewportHeight = 852;
    const release = acquireKeyboardInset();

    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));

    expect(inset()).toBe('352px');
    release();
  });

  it('stops publishing when released', () => {
    const release = acquireKeyboardInset();
    release();

    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));
    expect(inset()).toBe('');
  });

  it('leaves the inset at zero when the browser resizes for the keyboard itself', () => {
    const release = acquireKeyboardInset();
    viewport.height = 500;
    smallViewportHeight = 500;
    viewport.dispatchEvent(new Event('resize'));
    expect(inset()).toBe('0px');
    release();
  });
});
