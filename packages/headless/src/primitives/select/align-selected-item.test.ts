import type { MiddlewareState } from '@floating-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { alignSelectedItem } from './align-selected-item';

function rect(top: number, height: number, left = 0, width = 100): DOMRect {
  return {
    top,
    height,
    left,
    width,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

function define(el: HTMLElement, props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(el, key, { value, configurable: true, writable: true });
  }
}

interface Setup {
  referenceTop: number;
  floatingHeight: number;
  selectedOffset: number;
  referenceY?: number;
}

function setup({ referenceTop, floatingHeight, selectedOffset, referenceY = referenceTop }: Setup) {
  const reference = document.createElement('button');
  const floating = document.createElement('div');
  const scroller = document.createElement('div');
  const selected = document.createElement('button');
  floating.appendChild(scroller);
  scroller.appendChild(selected);
  document.body.append(reference, floating);

  reference.getBoundingClientRect = () => rect(referenceTop, 32, 100, 120);
  // Like the browser, the popup is only as tall as its cap allows.
  floating.getBoundingClientRect = () =>
    rect(0, Math.min(floatingHeight, parseFloat(floating.style.maxHeight) || Infinity));
  define(scroller, {
    offsetTop: 0,
    offsetParent: floating,
    scrollHeight: floatingHeight,
    clientHeight: floatingHeight,
  });
  define(selected, { offsetTop: selectedOffset, offsetParent: scroller });
  // Whatever the cap, this list can scroll.
  floating.style.maxHeight = '';
  Object.defineProperty(scroller, 'clientHeight', {
    configurable: true,
    get: () => Math.min(floatingHeight, parseFloat(floating.style.maxHeight) || floatingHeight),
  });

  const openRef = { current: true };
  const selectedItemRef = { current: selected as HTMLElement | null };
  const onFallback = vi.fn();
  const requestUpdate = vi.fn();
  const middleware = alignSelectedItem({ selectedItemRef, openRef, onFallback, requestUpdate });

  const state = {
    x: 0,
    y: 0,
    placement: 'bottom-start',
    strategy: 'absolute',
    initialPlacement: 'bottom-start',
    elements: { reference, floating },
    rects: {
      reference: { x: 100, y: referenceY, width: 120, height: 32 },
      floating: { x: 0, y: 0, width: 100, height: floatingHeight },
    },
    middlewareData: {},
    platform: {},
  } as unknown as MiddlewareState;

  return { middleware, state, floating, scroller, selected, openRef, selectedItemRef, onFallback, requestUpdate };
}

function scrollTo(scroller: HTMLElement, top: number) {
  scroller.scrollTop = top;
  scroller.dispatchEvent(new Event('scroll'));
}

describe('alignSelectedItem', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
    document.body.innerHTML = '';
  });

  it('places the popup so the selected option sits over the trigger', async () => {
    const { middleware, state, floating } = setup({ referenceTop: 300, floatingHeight: 200, selectedOffset: 60 });

    const result = await middleware.fn(state);

    expect(result).toEqual({ x: 100, y: 240, data: { availableHeight: 784 } });
    expect(floating.style.maxHeight).toBe('784px');
    expect(floating.style.getPropertyValue('--cl-available-height')).toBe('784px');
  });

  it('returns coordinates in the floating element space, not the viewport', async () => {
    // The document is scrolled 1000px: the trigger is at 300 in the viewport, 1300 on the page.
    const { middleware, state } = setup({
      referenceTop: 300,
      floatingHeight: 200,
      selectedOffset: 60,
      referenceY: 1300,
    });

    const result = await middleware.fn(state);

    expect(result).toMatchObject({ x: 100, y: 1240 });
  });

  it('ignores the scale transform when measuring the selected option', async () => {
    const { middleware, state, selected } = setup({ referenceTop: 300, floatingHeight: 200, selectedOffset: 60 });
    selected.getBoundingClientRect = () => rect(62.4, 30.72);

    const result = await middleware.fn(state);

    expect(result).toMatchObject({ y: 240 });
  });

  it('cuts the list at the top of the viewport and scrolls it so the option stays on the trigger', async () => {
    const { middleware, state, floating, scroller } = setup({
      referenceTop: 100,
      floatingHeight: 600,
      selectedOffset: 300,
    });

    const result = await middleware.fn(state);

    expect(result).toEqual({ x: 100, y: 8, data: { availableHeight: 392 } });
    expect(floating.style.maxHeight).toBe('392px');
    expect(scroller.scrollTop).toBe(208);
  });

  it('cuts a list taller than the viewport at both edges from its natural height', async () => {
    const { middleware, state, floating, scroller } = setup({
      referenceTop: 300,
      floatingHeight: 1200,
      selectedOffset: 500,
    });

    const result = await middleware.fn(state);

    expect(result).toEqual({ x: 100, y: 8, data: { availableHeight: 784 } });
    expect(floating.style.maxHeight).toBe('784px');
    expect(scroller.scrollTop).toBe(208);
  });

  it('cuts the list at the bottom of the viewport without scrolling it', async () => {
    const { middleware, state, floating, scroller } = setup({
      referenceTop: 500,
      floatingHeight: 600,
      selectedOffset: 0,
    });

    const result = await middleware.fn(state);

    expect(result).toEqual({ x: 100, y: 500, data: { availableHeight: 292 } });
    expect(floating.style.maxHeight).toBe('292px');
    expect(scroller.scrollTop).toBe(0);
  });

  it('falls back to anchored positioning when the aligned popup would be too short', async () => {
    const { middleware, state, onFallback } = setup({
      referenceTop: 30,
      floatingHeight: 600,
      selectedOffset: 560,
    });

    // Would be 54px tall, from 8 to 62: not worth aligning.
    expect(await middleware.fn(state)).toEqual({});
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('falls back to anchored positioning when the trigger hugs a viewport edge', async () => {
    const nearTop = setup({ referenceTop: 10, floatingHeight: 200, selectedOffset: 0 });
    expect(await nearTop.middleware.fn(nearTop.state)).toEqual({});
    expect(nearTop.onFallback).toHaveBeenCalledTimes(1);

    const nearBottom = setup({ referenceTop: 760, floatingHeight: 200, selectedOffset: 160 });
    expect(await nearBottom.middleware.fn(nearBottom.state)).toEqual({});
    expect(nearBottom.onFallback).toHaveBeenCalledTimes(1);
  });

  it('grows downward as the user scrolls up toward the rows cut off at the top', async () => {
    const { middleware, state, floating, scroller, requestUpdate } = setup({
      referenceTop: 100,
      floatingHeight: 600,
      selectedOffset: 300,
    });
    await middleware.fn(state);
    expect(scroller.scrollTop).toBe(208);

    // The rows slide down 50px and the popup's bottom edge follows them into the free space.
    scrollTo(scroller, 158);
    expect(floating.style.maxHeight).toBe('442px');
    expect(scroller.scrollTop).toBe(158);
    expect(await middleware.fn(state)).toEqual({ x: 100, y: 8, data: { availableHeight: 442 } });

    // Scrolled all the way up, the list is back to its natural height.
    scrollTo(scroller, 0);
    expect(floating.style.maxHeight).toBe('600px');
    expect(requestUpdate).not.toHaveBeenCalled();
  });

  it('grows upward as the user scrolls down toward the rows cut off at the bottom', async () => {
    const { middleware, state, floating, scroller, requestUpdate } = setup({
      referenceTop: 500,
      floatingHeight: 600,
      selectedOffset: 0,
    });
    await middleware.fn(state);

    // The rows slide up 50px by moving the popup, not the list, so the top edge takes the free space.
    scrollTo(scroller, 50);
    expect(scroller.scrollTop).toBe(0);
    expect(floating.style.maxHeight).toBe('342px');
    expect(requestUpdate).toHaveBeenCalledTimes(1);
    expect(await middleware.fn(state)).toEqual({ x: 100, y: 450, data: { availableHeight: 342 } });
  });

  it('stops growing at the viewport edge and scrolls the list from there', async () => {
    const { middleware, state, floating, scroller } = setup({
      referenceTop: 500,
      floatingHeight: 1200,
      selectedOffset: 0,
    });
    await middleware.fn(state);

    scrollTo(scroller, 600);
    expect(floating.style.maxHeight).toBe('784px');
    expect(scroller.scrollTop).toBe(108);
    expect(await middleware.fn(state)).toEqual({ x: 100, y: 8, data: { availableHeight: 784 } });

    scrollTo(scroller, 200);
    expect(floating.style.maxHeight).toBe('784px');
    expect(scroller.scrollTop).toBe(200);
    expect(await middleware.fn(state)).toEqual({ x: 100, y: 8, data: { availableHeight: 784 } });
  });

  it('stops reacting to list scroll once closed', async () => {
    const { middleware, state, floating, scroller, openRef } = setup({
      referenceTop: 500,
      floatingHeight: 600,
      selectedOffset: 0,
    });
    await middleware.fn(state);
    openRef.current = false;

    scrollTo(scroller, 50);
    expect(floating.style.maxHeight).toBe('292px');
    expect(scroller.scrollTop).toBe(50);
  });

  it('holds the trigger-relative position for the rest of the open, and through the close', async () => {
    const { middleware, state, selected, scroller, openRef } = setup({
      referenceTop: 300,
      floatingHeight: 200,
      selectedOffset: 60,
    });
    const first = await middleware.fn(state);

    // The user scrolled the list and the page; the popup follows the trigger, nothing else.
    scroller.scrollTop = 40;
    state.rects.reference.y = 1300;
    expect(await middleware.fn(state)).toEqual({ ...first, y: 1240 });

    // Closing moved the selection to another option.
    openRef.current = false;
    define(selected, { offsetTop: 180 });
    expect(await middleware.fn(state)).toEqual({ ...first, y: 1240 });
    expect(scroller.scrollTop).toBe(40);
  });

  it('measures again on the next open', async () => {
    const { middleware, state, selected, openRef } = setup({
      referenceTop: 300,
      floatingHeight: 200,
      selectedOffset: 60,
    });
    await middleware.fn(state);
    openRef.current = false;
    await middleware.fn(state);

    openRef.current = true;
    define(selected, { offsetTop: 180 });

    expect(await middleware.fn(state)).toMatchObject({ y: 120 });
  });

  it('measures again when the popup remounts without a close ever repositioning', async () => {
    const { middleware, state, floating, selected } = setup({
      referenceTop: 300,
      floatingHeight: 200,
      selectedOffset: 60,
    });
    await middleware.fn(state);

    const remounted = document.createElement('div');
    remounted.getBoundingClientRect = floating.getBoundingClientRect;
    remounted.appendChild(selected.parentElement ?? selected);
    define(selected.parentElement ?? selected, { offsetParent: remounted });
    define(selected, { offsetTop: 180 });
    state.elements.floating = remounted;

    expect(await middleware.fn(state)).toMatchObject({ y: 120 });
    expect(remounted.style.maxHeight).toBe('784px');
  });

  it('measures again when the viewport height changes while open', async () => {
    const { middleware, state, floating, scroller } = setup({
      referenceTop: 400,
      floatingHeight: 600,
      selectedOffset: 300,
    });
    Object.defineProperty(window, 'innerHeight', { value: 2000, configurable: true, writable: true });
    expect(await middleware.fn(state)).toEqual({ x: 100, y: 100, data: { availableHeight: 1984 } });

    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true, writable: true });

    expect(await middleware.fn(state)).toEqual({ x: 100, y: 100, data: { availableHeight: 392 } });
    expect(floating.style.maxHeight).toBe('392px');
    expect(scroller.scrollTop).toBe(0);
  });

  it('caps the height but leaves the position alone when nothing is selected', async () => {
    const { middleware, state, floating, selectedItemRef } = setup({
      referenceTop: 300,
      floatingHeight: 200,
      selectedOffset: 60,
    });
    selectedItemRef.current = null;

    const result = await middleware.fn(state);

    expect(result).toEqual({ data: { availableHeight: 784 } });
    expect(floating.style.maxHeight).toBe('784px');
  });
});
