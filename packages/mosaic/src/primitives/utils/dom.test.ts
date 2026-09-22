import { afterEach, describe, expect, it, vi } from 'vitest';

import { autoUpdate, getDimensions, getRectRelativeTo, getScale, getScrollDimensions } from './dom';

function stub(element: HTMLElement, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, get: () => value });
  }
}

function stubRect(
  element: HTMLElement,
  { x, y, width, height }: { x: number; y: number; width: number; height: number },
) {
  element.getBoundingClientRect = () => DOMRect.fromRect({ x, y, width, height });
}

function create() {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getDimensions', () => {
  it('reads the fractional CSS size when it agrees with the rendered box', () => {
    const element = create();
    element.style.width = '100.4px';
    element.style.height = '20.6px';
    stub(element, { offsetWidth: 100, offsetHeight: 21 });

    expect(getDimensions(element)).toEqual({ width: 100.4, height: 20.6 });
  });

  it('falls back to the rendered box when the CSS size disagrees', () => {
    const element = create();
    element.style.width = '100px';
    stub(element, { offsetWidth: 120, offsetHeight: 40 });

    expect(getDimensions(element)).toEqual({ width: 120, height: 40 });
  });
});

describe('getScrollDimensions', () => {
  it('reads the scroll size with content alignment reset', () => {
    const element = create();
    element.style.justifyContent = 'center';
    let alignment = '';
    Object.defineProperty(element, 'scrollHeight', {
      configurable: true,
      get: () => {
        alignment = element.style.justifyContent;
        return 80;
      },
    });
    stub(element, { scrollWidth: 200 });

    expect(getScrollDimensions(element)).toEqual({ width: 200, height: 80 });
    expect(alignment).toBe('initial');
    expect(element.style.justifyContent).toBe('center');
  });

  it('restores an inline priority after reading', () => {
    const element = create();
    element.style.setProperty('align-items', 'end', 'important');

    getScrollDimensions(element);

    expect(element.style.getPropertyValue('align-items')).toBe('end');
    expect(element.style.getPropertyPriority('align-items')).toBe('important');
  });
});

describe('getScale', () => {
  it('compares the rendered size to the layout size', () => {
    const element = create();
    stub(element, { offsetWidth: 100, offsetHeight: 50 });
    stubRect(element, { x: 0, y: 0, width: 50, height: 25 });

    expect(getScale(element)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('is 1 when the element has no layout size', () => {
    const element = create();
    stubRect(element, { x: 0, y: 0, width: 50, height: 25 });

    expect(getScale(element)).toEqual({ x: 1, y: 1 });
  });
});

describe('getRectRelativeTo', () => {
  it('places the element inside the parent padding box, following its scroll', () => {
    const parent = create();
    const element = document.createElement('div');
    parent.append(element);
    stubRect(parent, { x: 100, y: 50, width: 300, height: 200 });
    stub(parent, { clientLeft: 2, clientTop: 1, scrollLeft: 30, scrollTop: 0 });
    stubRect(element, { x: 140, y: 61, width: 80, height: 20 });

    expect(getRectRelativeTo(element, parent)).toEqual({ x: 68, y: 10, width: 80, height: 20 });
  });

  it('removes the parent scale', () => {
    const parent = create();
    const element = document.createElement('div');
    parent.append(element);
    stub(parent, { offsetWidth: 200, offsetHeight: 100 });
    stubRect(parent, { x: 0, y: 0, width: 100, height: 50 });
    stubRect(element, { x: 20, y: 10, width: 40, height: 10 });

    expect(getRectRelativeTo(element, parent)).toEqual({ x: 40, y: 20, width: 80, height: 20 });
  });
});

describe('autoUpdate', () => {
  it('updates right away and whenever an element resizes', () => {
    let notify = () => {};
    const observed: Element[] = [];
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        disconnect = disconnect;
      },
    );
    const a = create();
    const b = create();
    const update = vi.fn();

    const cleanup = autoUpdate([a, b], update);

    expect(update).toHaveBeenCalledTimes(1);
    expect(observed).toEqual([a, b]);

    notify();

    expect(update).toHaveBeenCalledTimes(2);

    cleanup();

    expect(disconnect).toHaveBeenCalled();
  });

  it('still updates once without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const update = vi.fn();

    autoUpdate(create(), update)();

    expect(update).toHaveBeenCalledTimes(1);
  });
});
