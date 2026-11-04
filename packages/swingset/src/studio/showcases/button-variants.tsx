'use client';

import type { ButtonProps } from '@clerk/mosaic/components/button';
import { Button } from '@clerk/mosaic/components/button';
import type { CSSProperties, RefObject } from 'react';
import { useEffect, useRef } from 'react';

import { ACTIVE_ATTR, HOVER_ATTR, mirrorInteractionStyles } from '../interactionStyles';
import type { Showcase } from '../types';
import { Spec } from './spec';

type State = Record<string, never>;
type Variant = NonNullable<ButtonProps['variant']>;
type Color = NonNullable<ButtonProps['color']>;
type Point = { x: number; y: number };
type Stop = { cell: [number, number]; click?: boolean; dwell: number } | { edge: Point; dwell: number };

const variants: Variant[] = ['filled', 'outline', 'ghost', 'link'];
const colors: Color[] = ['primary', 'neutral', 'negative'];

const SCRIPT_MS = 8000;
const LOOP_MS = SCRIPT_MS + 1200;
const PRESS_MS = 140;

const people: { name: string; color: string; start: number; stops: Stop[] }[] = [
  {
    name: 'Alex',
    color: 'oklch(0.58 0.22 285)',
    start: 200,
    stops: [
      { edge: { x: -0.3, y: 0.2 }, dwell: 0 },
      { cell: [0, 0], dwell: 700 },
      { cell: [0, 0], click: true, dwell: 500 },
      { cell: [1, 1], dwell: 600 },
      { cell: [1, 1], click: true, dwell: 900 },
      { cell: [3, 2], dwell: 1200 },
      { edge: { x: 1.35, y: 0.9 }, dwell: 0 },
    ],
  },
  {
    name: 'Austin',
    color: 'oklch(0.68 0.17 50)',
    start: 600,
    stops: [
      { edge: { x: 0.7, y: 1.4 }, dwell: 0 },
      { cell: [2, 2], dwell: 500 },
      { cell: [2, 2], click: true, dwell: 700 },
      { cell: [0, 2], dwell: 900 },
      { cell: [0, 1], dwell: 400 },
      { cell: [0, 1], click: true, dwell: 800 },
      { edge: { x: 0.4, y: 1.4 }, dwell: 0 },
    ],
  },
  {
    name: 'Kyle',
    color: 'oklch(0.62 0.13 175)',
    start: 1500,
    stops: [
      { edge: { x: 1.3, y: -0.3 }, dwell: 0 },
      { cell: [1, 2], dwell: 600 },
      { cell: [1, 2], click: true, dwell: 800 },
      { cell: [3, 0], dwell: 500 },
      { cell: [3, 0], click: true, dwell: 700 },
      { edge: { x: -0.35, y: 0.6 }, dwell: 0 },
    ],
  },
];

function travel(from: Point, to: Point) {
  return Math.min(900, 380 + Math.hypot(to.x - from.x, to.y - from.y) * 0.9);
}

function MultiplayerCursors({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = root.current;
    if (!host) {
      return;
    }
    mirrorInteractionStyles();
    let alive = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, ms);
        timers.add(timer);
      });

    const button = ([row, column]: [number, number]) =>
      host.querySelectorAll<HTMLElement>('.studio-spec-cell button')[row * colors.length + column];
    const pointOf = (stop: Stop): Point => {
      if ('edge' in stop) {
        return { x: stop.edge.x * host.offsetWidth, y: stop.edge.y * host.offsetHeight };
      }
      const rect = host.getBoundingClientRect();
      const scale = rect.width / host.offsetWidth || 1;
      const target = button(stop.cell).getBoundingClientRect();
      return {
        x: (target.left - rect.left + target.width * 0.62) / scale,
        y: (target.top - rect.top + target.height * 0.68) / scale,
      };
    };
    const setHover = (element: HTMLElement | undefined, on: boolean) => element?.toggleAttribute(HOVER_ATTR, on);

    const run = async (index: number) => {
      const person = people[index];
      const cursor = refs.current[index];
      if (!cursor) {
        return;
      }
      while (alive) {
        const cycle = performance.now();
        let from = pointOf(person.stops[0]);
        cursor.style.transition = 'none';
        cursor.style.translate = `${from.x}px ${from.y}px`;
        cursor.style.opacity = '0';
        await wait(person.start);
        cursor.style.opacity = '1';
        let current: HTMLElement | undefined;
        for (const stop of person.stops.slice(1)) {
          const to = pointOf(stop);
          const target = 'cell' in stop ? button(stop.cell) : undefined;
          if (target !== current || !target) {
            setHover(current, false);
            const ms = travel(from, to);
            cursor.style.transition = `translate ${ms}ms cubic-bezier(0.645, 0.045, 0.355, 1), opacity 150ms ease-out`;
            cursor.style.translate = `${to.x}px ${to.y}px`;
            await wait(ms * 0.85);
            setHover(target, true);
            await wait(ms * 0.15);
            current = target;
          }
          if ('click' in stop && stop.click && target) {
            cursor.toggleAttribute('data-pressed', true);
            target.toggleAttribute(ACTIVE_ATTR, true);
            await wait(PRESS_MS);
            cursor.toggleAttribute('data-pressed', false);
            target.toggleAttribute(ACTIVE_ATTR, false);
          }
          await wait(stop.dwell);
          from = to;
        }
        setHover(current, false);
        cursor.style.opacity = '0';
        await wait(Math.max(0, LOOP_MS - (performance.now() - cycle)));
      }
    };

    people.forEach((_, index) => void run(index));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [root]);

  return (
    <div
      className='studio-multiplayer'
      aria-hidden
    >
      {people.map((person, index) => (
        <div
          key={person.name}
          ref={element => {
            refs.current[index] = element;
          }}
          className='studio-multiplayer-cursor'
          style={{ '--person': person.color } as CSSProperties}
        >
          <svg
            width='18'
            height='20'
            viewBox='0 0 18 20'
          >
            <path
              d='M1.5 1.5 L16 9 L9.2 10.6 L6.2 17.5 Z'
              fill='var(--person)'
              stroke='white'
              strokeWidth='1.5'
              strokeLinejoin='round'
            />
          </svg>
          <span>{person.name}</span>
        </div>
      ))}
    </div>
  );
}

function View() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={root}
      className='studio-multiplayer-root'
    >
      <Spec
        axis='variant · color'
        rows={variants}
        columns={colors}
        rowLabel={variant => variant}
        columnLabel={color => color}
        cell={(variant, color) => (
          <Button
            variant={variant}
            color={color}
          >
            Continue
          </Button>
        )}
      />
      <MultiplayerCursors root={root} />
    </div>
  );
}

export const buttonVariants: Showcase<State> = {
  slug: 'button-variants',
  title: 'Button variants',
  summary: 'Every Button variant and color as a spec sheet, with a few collaborators hovering and clicking.',
  cellPadding: 48,
  plain: true,
  initialState: {},
  View,
  steps: [{ label: 'Multiplayer', layout: 'component', duration: SCRIPT_MS / 1000 }],
};
