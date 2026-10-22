import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { guardKeyboardFocus } from '../keyboard-focus';

class FakeViewport extends EventTarget {
  height = 768;
  offsetTop = 0;
  scale = 1;
}

let viewport: FakeViewport;
let container: HTMLDivElement;
let release: () => void;

function rect(top: number, height: number): DOMRect {
  return new DOMRect(0, top, 320, height);
}

function openKeyboard() {
  viewport.height = 400;
  viewport.dispatchEvent(new Event('resize'));
}

function scroller() {
  const element = document.createElement('div');
  element.style.overflowY = 'auto';
  Object.defineProperties(element, {
    clientHeight: { value: 768 },
    scrollHeight: { value: 1400 },
  });
  element.getBoundingClientRect = () => rect(0, 768);
  element.scrollTo = vi.fn();
  return element;
}

function field(top: number) {
  const input = document.createElement('input');
  input.getBoundingClientRect = () => rect(top, 40);
  return input;
}

beforeEach(() => {
  viewport = new FakeViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 768 });
  container = document.createElement('div');
  document.body.appendChild(container);
  release = guardKeyboardFocus(container);
});

afterEach(() => {
  release();
  container.remove();
  Reflect.deleteProperty(window, 'visualViewport');
  Reflect.deleteProperty(document.documentElement, 'clientHeight');
});

describe('guardKeyboardFocus', () => {
  it('moves focus between fields without the browser panning while the keyboard is up', () => {
    const first = field(100);
    const second = field(200);
    container.append(first, second);
    first.focus();
    openKeyboard();
    const focus = vi.spyOn(second, 'focus');

    second.focus();

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(second);
  });

  it('leaves focus to the browser while the keyboard is down', () => {
    const first = field(100);
    const second = field(200);
    container.append(first, second);
    first.focus();
    const focus = vi.spyOn(second, 'focus');

    second.focus();

    expect(focus).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledWith();
  });

  it('centers the focused field in the band above the keyboard once it opens', () => {
    const scroll = scroller();
    const input = field(600);
    scroll.append(input);
    container.append(scroll);
    input.focus();

    openKeyboard();

    expect(scroll.scrollTo).toHaveBeenCalledWith({ top: 420, behavior: 'smooth' });
  });

  it('leaves a field that is already visible above the keyboard where it is', () => {
    const scroll = scroller();
    const input = field(100);
    scroll.append(input);
    container.append(scroll);
    input.focus();

    openKeyboard();

    expect(scroll.scrollTo).not.toHaveBeenCalled();
  });

  it('centers the next field when focus moves with the keyboard up', () => {
    const scroll = scroller();
    const first = field(100);
    const second = field(700);
    scroll.append(first, second);
    container.append(scroll);
    first.focus();
    openKeyboard();

    second.focus();

    expect(scroll.scrollTo).toHaveBeenCalledWith({ top: 520, behavior: 'smooth' });
  });
});
