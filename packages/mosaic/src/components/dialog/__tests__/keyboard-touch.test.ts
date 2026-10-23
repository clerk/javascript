import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { guardKeyboardTouch } from '../keyboard-touch';

let container: HTMLDivElement;
let release: () => void;

function scroller(scrollTop: number) {
  const element = document.createElement('div');
  element.style.overflowY = 'auto';
  Object.defineProperties(element, {
    clientHeight: { value: 300 },
    scrollHeight: { value: 900 },
    scrollTop: { value: scrollTop },
  });
  return element;
}

function touch(target: Element, type: string, y: number) {
  const point = { clientX: 10, clientY: y };
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    touches: { value: type === 'touchend' ? [] : [point] },
    changedTouches: { value: [point] },
  });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  release = guardKeyboardTouch(container);
});

afterEach(() => {
  release();
  container.remove();
});

describe('guardKeyboardTouch', () => {
  it('focuses a text field on tap', () => {
    const input = document.createElement('input');
    container.append(input);

    touch(input, 'touchstart', 100);
    touch(input, 'touchend', 102);

    expect(input).toHaveFocus();
  });

  it('leaves a text field alone when a drag ends on it', () => {
    const input = document.createElement('input');
    container.append(input);

    touch(input, 'touchstart', 100);
    touch(input, 'touchmove', 300);
    touch(input, 'touchend', 300);

    expect(input).not.toHaveFocus();
  });

  it('submits on a tap of a submit button and keeps focus on the field', () => {
    const input = document.createElement('input');
    const submit = document.createElement('button');
    submit.type = 'submit';
    const onClick = vi.fn();
    submit.addEventListener('click', onClick);
    container.append(input, submit);
    input.focus();

    touch(submit, 'touchstart', 100);
    const end = touch(submit, 'touchend', 101);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(end.defaultPrevented).toBe(true);
    expect(input).toHaveFocus();
  });

  it('leaves a submit tap to the browser when no field has focus', () => {
    const submit = document.createElement('button');
    submit.type = 'submit';
    container.append(submit);

    touch(submit, 'touchstart', 100);
    const end = touch(submit, 'touchend', 101);

    expect(end.defaultPrevented).toBe(false);
  });

  it('cancels a drag that nothing under it can scroll', () => {
    const block = document.createElement('div');
    container.append(block);

    touch(block, 'touchstart', 100);
    const move = touch(block, 'touchmove', 150);

    expect(move.defaultPrevented).toBe(true);
  });

  it('lets a drag through when an ancestor can scroll that way', () => {
    const scroll = scroller(200);
    const block = document.createElement('div');
    scroll.append(block);
    container.append(scroll);

    touch(block, 'touchstart', 100);
    const move = touch(block, 'touchmove', 150);

    expect(move.defaultPrevented).toBe(false);
  });

  it('cancels a drag past the end an ancestor has already reached', () => {
    const scroll = scroller(0);
    const block = document.createElement('div');
    scroll.append(block);
    container.append(scroll);

    touch(block, 'touchstart', 100);
    const move = touch(block, 'touchmove', 150);

    expect(move.defaultPrevented).toBe(true);
  });

  it('lets a slider take its own drag', () => {
    const slider = document.createElement('input');
    slider.type = 'range';
    container.append(slider);

    touch(slider, 'touchstart', 100);
    const move = touch(slider, 'touchmove', 150);

    expect(move.defaultPrevented).toBe(false);
  });
});
