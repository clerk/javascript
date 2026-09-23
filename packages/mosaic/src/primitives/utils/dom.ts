export interface Coords {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type Rect = Coords & Dimensions;

const ALIGNMENT_PROPERTIES = ['justify-content', 'align-items', 'align-content', 'justify-items'];

/**
 * The window that owns `node`, so measurements inside an iframe read that frame's window. Falls back
 * to the global `window`.
 */
export function getWindow(node: Node) {
  return node.ownerDocument?.defaultView ?? window;
}

/**
 * `getComputedStyle` from the window that owns `element`.
 */
export function getComputedStyle(element: Element) {
  return getWindow(element).getComputedStyle(element);
}

/**
 * The element's layout size, ignoring transforms. Reads the computed CSS `width` and `height` to keep
 * sub-pixel precision, and falls back to `offsetWidth` / `offsetHeight` when those disagree with the
 * rendered box (for example `auto`, or a `content-box` element with padding).
 */
export function getDimensions(element: HTMLElement): Dimensions {
  const style = getComputedStyle(element);
  const width = parseFloat(style.width) || 0;
  const height = parseFloat(style.height) || 0;
  return {
    width: Math.round(width) === element.offsetWidth ? width : element.offsetWidth,
    height: Math.round(height) === element.offsetHeight ? height : element.offsetHeight,
  };
}

/**
 * The full size of the element's content, including any part clipped by overflow. Flex and grid
 * alignment are reset while reading, since non-default alignment can shrink `scrollWidth` /
 * `scrollHeight`, and the element's inline styles are restored before returning.
 */
export function getScrollDimensions(element: HTMLElement): Dimensions {
  const { style } = element;
  const inline = ALIGNMENT_PROPERTIES.map(property => ({
    property,
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  }));
  for (const property of ALIGNMENT_PROPERTIES) {
    style.setProperty(property, 'initial', 'important');
  }
  const dimensions = { width: element.scrollWidth, height: element.scrollHeight };
  for (const { property, value, priority } of inline) {
    if (value === '') {
      style.removeProperty(property);
    } else {
      style.setProperty(property, value, priority);
    }
  }
  return dimensions;
}

/**
 * How much transforms scale the element: its rendered size divided by its layout size. Each axis is
 * `1` when the element has no layout size to compare against.
 */
export function getScale(element: HTMLElement): Coords {
  const rect = element.getBoundingClientRect();
  const x = rect.width / element.offsetWidth;
  const y = rect.height / element.offsetHeight;
  return {
    x: x && Number.isFinite(x) ? x : 1,
    y: y && Number.isFinite(y) ? y : 1,
  };
}

/**
 * The element's position and size in `parent`'s coordinate space: relative to its padding box,
 * following its scroll, and with its scale removed. When `parent` is the containing block, these are
 * the `left` / `top` / `width` / `height` an absolutely positioned child needs to cover the element.
 */
export function getRectRelativeTo(element: Element, parent: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const scale = getScale(parent);
  return {
    x: (rect.left - parentRect.left) / scale.x - parent.clientLeft + parent.scrollLeft,
    y: (rect.top - parentRect.top) / scale.y - parent.clientTop + parent.scrollTop,
    width: rect.width / scale.x,
    height: rect.height / scale.y,
  };
}

/**
 * Calls `update` now and again whenever any of `elements` resizes. Returns a cleanup that stops
 * observing. Without `ResizeObserver`, `update` runs once.
 *
 * ```ts
 * useLayoutEffect(() => autoUpdate(element, () => setHeight(getDimensions(element).height)), [element]);
 * ```
 */
export function autoUpdate(elements: Element | Element[], update: () => void): () => void {
  update();
  if (typeof ResizeObserver === 'undefined') {
    return () => {};
  }
  const observer = new ResizeObserver(() => update());
  for (const element of Array.isArray(elements) ? elements : [elements]) {
    observer.observe(element);
  }
  return () => observer.disconnect();
}
