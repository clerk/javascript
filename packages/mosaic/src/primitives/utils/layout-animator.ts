export const LAYOUT_ITEM_ATTRIBUTE = 'data-layout-item';
export const LAYOUT_ITEM_SELECTOR = `[${LAYOUT_ITEM_ATTRIBUTE}]`;
const EXITING_ATTRIBUTE = 'data-ending-style';
const POPPED_ATTRIBUTE = 'data-layout-popped';
const ANIMATING_ATTRIBUTE = 'data-layout-animating';
const POPPED_PROPERTIES = ['position', 'left', 'top', 'width', 'height', 'margin', 'box-sizing', 'pointer-events'];

interface Point {
  x: number;
  y: number;
}

const ORIGIN: Point = { x: 0, y: 0 };

export function createLayoutAnimator(container: HTMLElement): () => void {
  const positions = new Map<HTMLElement, Point>();
  const popped = new Set<HTMLElement>();
  const animations = new Map<HTMLElement, Animation>();
  let height = readHeight(container);

  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          snapshot();
          if (!animations.has(container)) {
            height = readHeight(container);
          }
        });

  function items() {
    return Array.from(container.querySelectorAll<HTMLElement>(LAYOUT_ITEM_SELECTOR));
  }

  function snapshot() {
    const current = items();
    for (const element of positions.keys()) {
      if (!current.includes(element)) {
        resizeObserver?.unobserve(element);
      }
    }
    for (const element of current) {
      if (!positions.has(element)) {
        resizeObserver?.observe(element);
      }
    }
    positions.clear();
    for (const element of current) {
      positions.set(element, { x: element.offsetLeft, y: element.offsetTop });
    }
    for (const element of popped) {
      if (!current.includes(element)) {
        popped.delete(element);
      }
    }
  }

  function animate(element: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes, timing: Timing) {
    const animation = element.animate(keyframes, timing);
    animations.set(element, animation);
    element.setAttribute(ANIMATING_ATTRIBUTE, '');
    const settle = () => {
      if (animations.get(element) === animation) {
        animations.delete(element);
        element.removeAttribute(ANIMATING_ATTRIBUTE);
      }
    };
    animation.finished.then(settle, settle);
  }

  function run() {
    const timing = readTiming(container);
    const fromHeight = animations.has(container) ? readHeight(container) : height;

    const offsets = new Map<HTMLElement, Point>();
    for (const [element, animation] of animations) {
      offsets.set(element, readTranslate(element));
      animation.cancel();
      element.removeAttribute(ANIMATING_ATTRIBUTE);
    }
    animations.clear();

    const current = items();
    for (const element of current) {
      const exiting = element.hasAttribute(EXITING_ATTRIBUTE);
      if (exiting && !popped.has(element)) {
        pop(element, add(positions.get(element) ?? ORIGIN, offsets.get(element) ?? ORIGIN));
        popped.add(element);
      } else if (!exiting && popped.has(element)) {
        unpop(element);
        popped.delete(element);
      }
    }

    if (timing) {
      for (const element of current) {
        const from = positions.get(element);
        if (!from || popped.has(element)) {
          continue;
        }
        const offset = offsets.get(element) ?? ORIGIN;
        const dx = from.x + offset.x - element.offsetLeft;
        const dy = from.y + offset.y - element.offsetTop;
        if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) {
          animate(element, { translate: [`${dx}px ${dy}px`, '0px 0px'] }, timing);
        }
      }
    }

    const toHeight = readHeight(container);
    if (timing && Math.abs(fromHeight - toHeight) >= 0.5) {
      animate(container, { height: [`${fromHeight}px`, `${toHeight}px`] }, timing);
    }
    height = toHeight;
    snapshot();
  }

  const mutationObserver = new MutationObserver(run);
  mutationObserver.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [EXITING_ATTRIBUTE],
  });
  resizeObserver?.observe(container);
  snapshot();

  return () => {
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    for (const [element, animation] of animations) {
      animation.cancel();
      element.removeAttribute(ANIMATING_ATTRIBUTE);
    }
    animations.clear();
    for (const element of popped) {
      unpop(element);
    }
    popped.clear();
  };
}

interface Timing {
  duration: number;
  easing: string;
}

function readTiming(container: HTMLElement): Timing | null {
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }
  const style = getComputedStyle(container);
  const duration = parseDuration(style.getPropertyValue('--cl-layout-duration'));
  if (duration <= 0) {
    return null;
  }
  return { duration, easing: style.getPropertyValue('--cl-layout-easing').trim() || 'ease' };
}

function parseDuration(value: string) {
  const trimmed = value.trim();
  const amount = parseFloat(trimmed);
  if (Number.isNaN(amount)) {
    return 0;
  }
  if (trimmed.endsWith('ms')) {
    return amount;
  }
  if (trimmed.endsWith('s')) {
    return amount * 1000;
  }
  return 0;
}

function readTranslate(element: HTMLElement): Point {
  const value = getComputedStyle(element).translate;
  if (!value || value === 'none') {
    return ORIGIN;
  }
  const [x = 0, y = 0] = value.split(' ').map(part => parseFloat(part) || 0);
  return { x, y };
}

function readHeight(element: HTMLElement) {
  return parseFloat(getComputedStyle(element).height) || 0;
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function pop(element: HTMLElement, at: Point) {
  const { style } = element;
  style.setProperty('width', `${element.offsetWidth}px`);
  style.setProperty('height', `${element.offsetHeight}px`);
  style.setProperty('position', 'absolute');
  style.setProperty('left', `${at.x}px`);
  style.setProperty('top', `${at.y}px`);
  style.setProperty('margin', '0');
  style.setProperty('box-sizing', 'border-box');
  style.setProperty('pointer-events', 'none');
  element.setAttribute(POPPED_ATTRIBUTE, '');
}

function unpop(element: HTMLElement) {
  for (const property of POPPED_PROPERTIES) {
    element.style.removeProperty(property);
  }
  element.removeAttribute(POPPED_ATTRIBUTE);
}
