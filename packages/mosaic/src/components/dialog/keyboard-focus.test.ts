import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { guardKeyboardFocus } from './keyboard-focus';

class FakeViewport extends EventTarget {
  height = 768;
  offsetTop = 0;
  scale = 1;
}

let viewport: FakeViewport;
let detach: () => void;

function field(parent: HTMLElement, rect = { y: 0, height: 0 }) {
  const input = document.createElement('input');
  input.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: rect.y, width: 100, height: rect.height });
  parent.append(input);
  return input;
}

function setup() {
  const track = document.createElement('div');
  document.body.append(track);
  const first = field(track);
  const second = field(track, { y: 600, height: 40 });
  first.focus();
  detach = guardKeyboardFocus(track);
  return { track, first, second };
}

function styleOnFocus(element: HTMLElement) {
  const seen: { opacity: string; transform: string; transition: string }[] = [];
  element.addEventListener('focus', () => {
    const { opacity, transform, transition } = element.style;
    seen.push({ opacity, transform, transition });
  });
  return seen;
}

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

function setScroll(x: number, y: number) {
  Object.defineProperty(window, 'scrollX', { configurable: true, value: x });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
}

beforeEach(() => {
  viewport = new FakeViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  setScroll(0, 0);
});

afterEach(() => {
  detach();
  document.body.replaceChildren();
  Reflect.deleteProperty(window, 'visualViewport');
  Reflect.deleteProperty(window, 'scrollX');
  Reflect.deleteProperty(window, 'scrollY');
  vi.restoreAllMocks();
});

describe('guardKeyboardFocus', () => {
  it('presents the incoming field centered above the keyboard while focus moves to it', () => {
    const { second } = setup();
    viewport.height = 400;
    second.style.opacity = '0.5';
    second.style.transition = 'opacity 1s';
    const seen = styleOnFocus(second);

    second.focus();

    expect(seen).toEqual([{ opacity: '0', transform: 'translateY(-420px)', transition: 'none' }]);
    expect(second.style.opacity).toBe('0.5');
    expect(second.style.transform).toBe('');
    expect(second.style.transition).toBe('opacity 1s');
  });

  it('centers in the band iOS has panned to', () => {
    const { second } = setup();
    viewport.height = 400;
    viewport.offsetTop = 100;
    const seen = styleOnFocus(second);

    second.focus();

    expect(seen[0]?.transform).toBe('translateY(-320px)');
  });

  it('leaves a field outside the element alone', () => {
    setup();
    viewport.height = 400;
    const outside = field(document.body, { y: 600, height: 40 });
    const seen = styleOnFocus(outside);

    outside.focus();

    expect(seen).toEqual([{ opacity: '', transform: '', transition: '' }]);
  });

  it('leaves the field alone while the keyboard is down', () => {
    const { second } = setup();
    const seen = styleOnFocus(second);

    second.focus();

    expect(seen).toEqual([{ opacity: '', transform: '', transition: '' }]);
  });

  it('leaves the field alone while the page is pinch-zoomed', () => {
    const { second } = setup();
    viewport.height = 400;
    viewport.scale = 2;
    const seen = styleOnFocus(second);

    second.focus();

    expect(seen).toEqual([{ opacity: '', transform: '', transition: '' }]);
  });

  it('restores the field on the next frame when focus never lands on it', async () => {
    const { first, second } = setup();
    viewport.height = 400;

    first.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second }));
    expect(second.style.opacity).toBe('0');

    await nextFrame();
    expect(second.style.opacity).toBe('');
    expect(second.style.transform).toBe('');
  });

  it('snaps the page back when it scrolls with the keyboard up', () => {
    setScroll(0, 40);
    setup();
    viewport.height = 400;
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    setScroll(0, 160);
    window.dispatchEvent(new Event('scroll'));

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 40, behavior: 'instant' });
  });

  it('lets the page scroll while the keyboard is down', () => {
    setup();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    setScroll(0, 160);
    window.dispatchEvent(new Event('scroll'));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('lets the page scroll once focus has left the element', () => {
    setup();
    viewport.height = 400;
    field(document.body).focus();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    setScroll(0, 160);
    window.dispatchEvent(new Event('scroll'));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
