'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type CursorKind, cursorKindOf, type CursorState } from './Cursor';
import { recordedPaths } from './cursor-paths';
import { choosePath, type CursorPath, landing, type Point, type Random, seeded, trace } from './cursorPath';
import { ACTIVE_ATTR, HOVER_ATTR, mirrorInteractionStyles } from './interactionStyles';
import type { CursorAction } from './types';

const ENTRY_DROP = 48;
const PARK = { x: 64, y: 40 };
const PARK_WIDTH = 48;

function dispatchPointer(element: Element, type: string, point: Point, related: Element | null = null) {
  const init = {
    bubbles: !type.endsWith('enter') && !type.endsWith('leave'),
    cancelable: true,
    composed: true,
    button: 0,
    buttons: type.endsWith('down') || type.endsWith('move') ? 1 : 0,
    clientX: point.x,
    clientY: point.y,
    relatedTarget: related,
  };
  element.dispatchEvent(
    type.startsWith('pointer')
      ? new PointerEvent(type, { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true })
      : new MouseEvent(type, init),
  );
}

function both(element: Element, type: string, point: Point, related?: Element | null) {
  dispatchPointer(element, `pointer${type}`, point, related);
  dispatchPointer(element, `mouse${type}`, point, related);
}

export function useCursor() {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLElement>(null);
  const scaleRef = useRef(1);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const motion = useRef(0);
  const frame = useRef(0);
  const position = useRef<Point | null>(null);
  const hovered = useRef<Element[]>([]);
  const dragging = useRef(false);
  const [cursor, setCursor] = useState<CursorState>({ kind: 'default', visible: false, pressed: false });

  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    motion.current++;
    cancelAnimationFrame(frame.current);
    dragging.current = false;
    stageRef.current?.querySelectorAll(`[${ACTIVE_ATTR}]`).forEach(node => node.removeAttribute(ACTIVE_ATTR));
  }, []);

  const client = useCallback((point: Point): Point => {
    const box = stageRef.current?.getBoundingClientRect();
    return box
      ? { x: box.left + point.x * scaleRef.current, y: box.top + point.y * scaleRef.current }
      : { x: point.x, y: point.y };
  }, []);

  const elementAt = useCallback(
    (point: Point) => {
      const stage = stageRef.current;
      const { x, y } = client(point);
      const element = document.elementFromPoint(x, y);
      return element && stage?.contains(element) && element !== stage ? element : null;
    },
    [client],
  );

  const place = useCallback((point: Point) => {
    position.current = point;
    const element = stageRef.current?.querySelector<HTMLElement>('.studio-cursor');
    if (element) {
      element.style.translate = `${point.x}px ${point.y}px`;
    }
  }, []);

  const hover = useCallback(
    (element: Element | null, point: Point) => {
      const stage = stageRef.current;
      const chain: Element[] = [];
      for (let node = element; node && node !== stage; node = node.parentElement) {
        chain.push(node);
      }
      const previous = hovered.current;
      if (previous[0] === chain[0]) {
        return;
      }
      const at = client(point);
      const left = previous.filter(node => !chain.includes(node));
      const entered = chain.filter(node => !previous.includes(node));
      if (previous[0]) {
        both(previous[0], 'out', at, chain[0]);
      }
      for (const node of left) {
        node.removeAttribute(HOVER_ATTR);
        both(node, 'leave', at, chain[0]);
      }
      if (chain[0]) {
        both(chain[0], 'over', at, previous[0]);
      }
      for (const node of entered.reverse()) {
        node.setAttribute(HOVER_ATTR, '');
        both(node, 'enter', at, previous[0]);
      }
      hovered.current = chain;
    },
    [client],
  );

  const kindAt = useCallback((element: Element | null, target: Element | null, override?: CursorKind): CursorKind => {
    if (dragging.current) {
      return override ?? 'grabbing';
    }
    if (override && element && target?.contains(element)) {
      return override;
    }
    return element ? cursorKindOf(element) : 'default';
  }, []);

  const track = useCallback(
    (point: Point, target: Element | null, override?: CursorKind) => {
      const element = elementAt(point);
      if (element !== hovered.current[0]) {
        hover(element, point);
        const kind = kindAt(element, target, override);
        setCursor(c => (c.kind === kind ? c : { ...c, kind }));
      }
      if (element) {
        both(element, 'move', client(point));
      }
    },
    [elementAt, hover, kindAt, client],
  );

  const glide = useCallback(
    (path: CursorPath, from: Point, to: Point, target: Element | null, override?: CursorKind) =>
      new Promise<void>(resolve => {
        const token = ++motion.current;
        const at = trace(path, from, to);
        let start = 0;
        const tick = (now: number) => {
          if (token !== motion.current) {
            return;
          }
          start ||= now;
          const progress = Math.min(1, (now - start) / path.duration);
          const point = at(progress);
          place(point);
          track(point, target, override);
          if (progress < 1) {
            frame.current = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        frame.current = requestAnimationFrame(tick);
      }),
    [place, track],
  );

  const press = useCallback(
    (target: Element, point: Point) => {
      mirrorInteractionStyles();
      const under = elementAt(point);
      const hit = under && target.contains(under) ? under : target;
      for (let node: Element | null = hit; node && node !== stageRef.current; node = node.parentElement) {
        node.setAttribute(ACTIVE_ATTR, '');
      }
      setCursor(c => ({ ...c, pressed: true }));
      both(hit, 'down', client(point));
      return hit;
    },
    [elementAt, client],
  );

  const release = useCallback(
    (hit: Element, point: Point) => {
      stageRef.current?.querySelectorAll(`[${ACTIVE_ATTR}]`).forEach(node => node.removeAttribute(ACTIVE_ATTR));
      setCursor(c => ({ ...c, pressed: false }));
      both(hit, 'up', client(point));
    },
    [client],
  );

  const play = useCallback(
    (actions: CursorAction[], seed = '') => {
      cancel();
      const random: Random = seeded(seed);
      const wait = (ms: number) =>
        new Promise<void>(resolve => {
          const timer = setTimeout(() => {
            timers.current.delete(timer);
            resolve();
          }, ms);
          timers.current.add(timer);
        });

      const boxOf = (stage: HTMLElement, element: Element) => {
        const box = element.getBoundingClientRect();
        const origin = stage.getBoundingClientRect();
        const scale = scaleRef.current;
        return new DOMRect(
          (box.left - origin.left) / scale,
          (box.top - origin.top) / scale,
          box.width / scale,
          box.height / scale,
        );
      };

      const approach = async (stage: HTMLElement, target: Element, override?: CursorKind) => {
        const box = boxOf(stage, target);
        const center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        let from = position.current;
        if (!from) {
          from = {
            x: center.x + (random() - 0.5) * 0.3 * stage.offsetWidth,
            y: stage.offsetHeight + ENTRY_DROP,
          };
          place(from);
          setCursor(c => ({ ...c, kind: 'default', visible: true, pressed: false }));
        }
        const width = Math.min(box.width, box.height);
        const path = choosePath(recordedPaths, 'move', from, center, width, random);
        const over = from.x >= box.left && from.x <= box.right && from.y >= box.top && from.y <= box.bottom;
        const to = over ? from : landing(box, path.land);
        if (!over) {
          await glide(path, from, to, target, override);
        }
        return { path, to };
      };

      const perform = async (action: CursorAction) => {
        const stage = stageRef.current;
        if (!stage) {
          return;
        }
        if (action.hide) {
          if (position.current) {
            hover(null, position.current);
          }
          position.current = null;
          setCursor(c => ({ ...c, visible: false, pressed: false }));
          return;
        }
        mirrorInteractionStyles();
        if (action.park) {
          const from = position.current;
          if (!from) {
            return;
          }
          const offset = action.park === true ? PARK : action.park;
          const to = { x: from.x + offset.x, y: from.y + offset.y };
          await glide(choosePath(recordedPaths, 'move', from, to, PARK_WIDTH, random), from, to, null, action.cursor);
          return;
        }
        const target = action.target ? viewRef.current?.querySelector(action.target) : null;
        if (!target) {
          return;
        }
        const { path, to } = await approach(stage, target, action.cursor);
        setCursor(c => ({ ...c, kind: kindAt(elementAt(to), target, action.cursor) }));

        const drop = action.drag ? viewRef.current?.querySelector(action.drag) : null;
        if (drop) {
          await wait(path.dwell);
          const hit = press(target, to);
          dragging.current = true;
          setCursor(c => ({ ...c, kind: action.cursor ?? 'grabbing' }));
          const box = boxOf(stage, drop);
          const center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
          const carry = choosePath(recordedPaths, 'drag', to, center, Math.min(box.width, box.height), random);
          await wait(carry.lead);
          const end = landing(box, carry.land);
          await glide(carry, to, end, drop, action.cursor);
          await wait(carry.dwell);
          dragging.current = false;
          release(elementAt(end) ?? hit, end);
          setCursor(c => ({ ...c, kind: kindAt(elementAt(end), drop) }));
          return;
        }

        if (!action.click) {
          return;
        }
        await wait(path.dwell);
        const hit = press(target, to);
        await wait(path.press);
        release(hit, to);
        (target as HTMLElement).click();
      };

      for (const action of actions) {
        void wait(action.at * 1000).then(() => perform(action));
      }
    },
    [cancel, place, glide, hover, kindAt, elementAt, press, release],
  );

  useEffect(() => cancel, [cancel]);

  return { cursor, play, cancel, stageRef, viewRef, scaleRef };
}
