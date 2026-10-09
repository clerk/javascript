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
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

function inset() {
  return document.documentElement.style.getPropertyValue('--_cl-keyboard-inset');
}

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

beforeEach(() => {
  viewport = new FakeViewport();
  smallViewportHeight = 768;
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.style.height === '100svh' ? smallViewportHeight : 0;
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
  it('publishes the latest inset once per frame', async () => {
    const release = acquireKeyboardInset();
    expect(inset()).toBe('0px');

    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));
    viewport.offsetTop = 100;
    viewport.dispatchEvent(new Event('scroll'));
    expect(inset()).toBe('0px');

    await nextFrame();
    expect(inset()).toBe('168px');
    release();
  });

  it('drops a pending update when released', async () => {
    const release = acquireKeyboardInset();
    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));
    release();

    await nextFrame();
    expect(inset()).toBe('');
  });

  it('leaves the inset at zero when the browser resizes for the keyboard itself', async () => {
    const release = acquireKeyboardInset();
    viewport.height = 500;
    smallViewportHeight = 500;
    viewport.dispatchEvent(new Event('resize'));

    await nextFrame();
    expect(inset()).toBe('0px');
    release();
  });
});
