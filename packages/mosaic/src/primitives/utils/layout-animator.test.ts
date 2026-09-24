import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLayoutAnimator } from './layout-animator';

interface Box {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

function fakeAnimation() {
  return { cancel: vi.fn(), finished: new Promise<Animation>(() => {}) };
}

function place(element: HTMLElement, parent: HTMLElement, { x, y, width = 40, height = 20 }: Box) {
  Object.defineProperties(element, {
    offsetParent: { configurable: true, get: () => parent },
    offsetLeft: { configurable: true, get: () => x },
    offsetTop: { configurable: true, get: () => y },
    offsetWidth: { configurable: true, get: () => width },
    offsetHeight: { configurable: true, get: () => height },
  });
}

function item(container: HTMLElement, box: Box) {
  const element = document.createElement('div');
  element.setAttribute('data-layout-item', '');
  element.animate = vi.fn(fakeAnimation);
  place(element, container, box);
  container.append(element);
  return element;
}

function flush() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('createLayoutAnimator', () => {
  let container: HTMLElement;
  let dispose: () => void;

  beforeEach(() => {
    dispose = () => {};
    container = document.createElement('div');
    container.style.setProperty('--cl-layout-duration', '250ms');
    container.style.setProperty('--cl-layout-easing', 'cubic-bezier(0, 0, 0.2, 1)');
    container.style.height = '20px';
    container.animate = vi.fn(fakeAnimation);
    document.body.append(container);
  });

  afterEach(() => {
    dispose();
    container.remove();
    vi.restoreAllMocks();
  });

  it('slides items that move when a sibling is removed', async () => {
    const a = item(container, { x: 0, y: 0 });
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(a.animate).not.toHaveBeenCalled();
    expect(c.animate).toHaveBeenCalledWith(
      { translate: ['50px 0px', '0px 0px'] },
      { duration: 250, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
    );
    expect(c).toHaveAttribute('data-layout-animating');
  });

  it('does not animate an item that is new', async () => {
    item(container, { x: 0, y: 0 });
    dispose = createLayoutAnimator(container);

    const added = item(container, { x: 50, y: 0 });
    await flush();

    expect(added.animate).not.toHaveBeenCalled();
  });

  it('pins an exiting item where it was and slides its siblings into its place', async () => {
    item(container, { x: 0, y: 0 });
    const b = item(container, { x: 50, y: 0, width: 45, height: 24 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.setAttribute('data-ending-style', '');
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(b).toHaveAttribute('data-layout-popped');
    expect(b.style.position).toBe('absolute');
    expect(b.style.left).toBe('50px');
    expect(b.style.top).toBe('0px');
    expect(b.style.width).toBe('45px');
    expect(b.style.height).toBe('24px');
    expect(b.animate).not.toHaveBeenCalled();
    expect(c.animate).toHaveBeenCalledWith({ translate: ['50px 0px', '0px 0px'] }, expect.anything());
  });

  it('puts a pinned item back in the flow when its exit is reversed', async () => {
    item(container, { x: 0, y: 0 });
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.setAttribute('data-ending-style', '');
    place(c, container, { x: 50, y: 0 });
    await flush();

    b.removeAttribute('data-ending-style');
    place(c, container, { x: 100, y: 0 });
    await flush();

    expect(b).not.toHaveAttribute('data-layout-popped');
    expect(b.style.position).toBe('');
    expect(c.animate).toHaveBeenLastCalledWith({ translate: ['-50px 0px', '0px 0px'] }, expect.anything());
  });

  it('starts an interrupted slide from where the item is on screen', async () => {
    item(container, { x: 0, y: 0 });
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();
    const first = vi.mocked(c.animate).mock.results[0]?.value;

    const computed = globalThis.getComputedStyle;
    vi.spyOn(globalThis, 'getComputedStyle').mockImplementation(element => {
      const style = computed(element);
      if (element === c) {
        Object.defineProperty(style, 'translate', { value: '20px 0px' });
      }
      return style;
    });
    container.append(document.createElement('span'));
    place(c, container, { x: 0, y: 30 });
    await flush();

    expect(first.cancel).toHaveBeenCalled();
    expect(c.animate).toHaveBeenLastCalledWith({ translate: ['70px -30px', '0px 0px'] }, expect.anything());
  });

  it('animates the container height when it changes', async () => {
    item(container, { x: 0, y: 0 });
    const b = item(container, { x: 0, y: 30 });
    container.style.height = '50px';
    dispose = createLayoutAnimator(container);

    b.remove();
    container.style.height = '20px';
    await flush();

    expect(container.animate).toHaveBeenCalledWith({ height: ['50px', '20px'] }, expect.anything());
  });

  it('snaps when no duration is set', async () => {
    container.style.removeProperty('--cl-layout-duration');
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(c.animate).not.toHaveBeenCalled();
  });

  it('snaps when the duration is 0s', async () => {
    container.style.setProperty('--cl-layout-duration', '0s');
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(c.animate).not.toHaveBeenCalled();
  });

  it('reads the duration in seconds', async () => {
    container.style.setProperty('--cl-layout-duration', '0.3s');
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(c.animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 300 }));
  });

  it('snaps under reduced motion but still pins an exiting item', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    dispose = createLayoutAnimator(container);

    b.setAttribute('data-ending-style', '');
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(b).toHaveAttribute('data-layout-popped');
    expect(c.animate).not.toHaveBeenCalled();
    expect(container.animate).not.toHaveBeenCalled();
  });

  it('observes each item for resizes only once', async () => {
    const observed: Element[] = [];
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    const a = item(container, { x: 0, y: 0 });
    dispose = createLayoutAnimator(container);

    notify();
    container.append(document.createElement('span'));
    await flush();

    expect(observed.filter(element => element === a)).toHaveLength(1);
    vi.unstubAllGlobals();
  });

  it('stops watching once disposed', async () => {
    const b = item(container, { x: 50, y: 0 });
    const c = item(container, { x: 100, y: 0 });
    createLayoutAnimator(container)();

    b.remove();
    place(c, container, { x: 50, y: 0 });
    await flush();

    expect(c.animate).not.toHaveBeenCalled();
  });
});
