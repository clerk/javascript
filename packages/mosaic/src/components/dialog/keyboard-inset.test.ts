import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { acquireKeyboardInset } from './keyboard-inset';

class FakeViewport extends EventTarget {
  height = 768;
  offsetTop = 0;
  scale = 1;
}

let viewport: FakeViewport;

function inset() {
  return document.documentElement.style.getPropertyValue('--_cl-keyboard-inset');
}

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

beforeEach(() => {
  viewport = new FakeViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
});

afterEach(() => {
  Reflect.deleteProperty(window, 'visualViewport');
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
});
