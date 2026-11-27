import { springCurve } from '@/lib/motion';

export const EASE = {
  spring: springCurve(0.3, 0).css,
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  outQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  outExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  inOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
};

export const CURVE_PRESETS = [
  { label: 'Spring', value: EASE.spring },
  { label: 'Enter', value: EASE.enter },
  { label: 'Exit', value: EASE.exit },
  { label: 'Out-quint', value: EASE.outQuint },
  { label: 'Out-expo', value: EASE.outExpo },
  { label: 'In-out', value: EASE.inOut },
];

export interface Recipe {
  id: string;
  label: string;
  summary: string;
  opacity: string;
  transform: string;
  filter: string;
  exitTransform?: string;
  fadeMs: number;
  moveMs: number;
  exitMs: number;
  growWaitMs: number;
  spring?: { dur: number; bounce: number };
  ease: string;
  exitEase: string;
}

export const RECIPES: Recipe[] = [
  {
    id: 'fade',
    label: 'Fade',
    summary: 'Opacity only.',
    opacity: '0',
    transform: 'none',
    filter: 'none',
    fadeMs: 100,
    moveMs: 100,
    exitMs: 100,
    growWaitMs: 0,
    ease: EASE.enter,
    exitEase: EASE.exit,
  },
  {
    id: 'pop',
    label: 'Pop',
    summary: 'Fades and scales in from 0.94.',
    opacity: '0',
    transform: 'scale(0.94)',
    filter: 'none',
    fadeMs: 100,
    moveMs: 150,
    exitMs: 100,
    growWaitMs: 0,
    ease: EASE.enter,
    exitEase: EASE.exit,
  },
  {
    id: 'slide',
    label: 'Slide',
    summary: 'Enters from the bottom edge while fading.',
    opacity: '0',
    transform: 'translateY(100%)',
    filter: 'none',
    fadeMs: 250,
    moveMs: 250,
    exitMs: 150,
    growWaitMs: 0,
    ease: EASE.enter,
    exitEase: EASE.exit,
  },
  {
    id: 'push',
    label: 'Push',
    summary: 'Moves a short way in from the right and out to the left under a light blur, and reverses on Back.',
    opacity: '0',
    transform: 'translateX(calc(var(--cl-flow-transition-direction, 1) * 1.5rem))',
    filter: 'blur(2px)',
    exitTransform: 'translateX(calc(var(--cl-flow-transition-direction, 1) * -1.5rem))',
    fadeMs: 300,
    moveMs: 320,
    exitMs: 200,
    growWaitMs: 0,
    ease: EASE.outQuint,
    exitEase: EASE.outQuint,
  },
  {
    id: 'morph',
    label: 'Morph',
    summary:
      'Resizes with a spring and crossfades, with a short wait for the room to open on a grow. On something that does not resize it is a spring fade.',
    opacity: '0',
    transform: 'none',
    filter: 'blur(1.5px)',
    fadeMs: 420,
    moveMs: 420,
    exitMs: 150,
    growWaitMs: 60,
    spring: { dur: 0.3, bounce: 0 },
    ease: EASE.spring,
    exitEase: EASE.spring,
  },
  {
    id: 'none',
    label: 'None',
    summary: 'Instant.',
    opacity: '1',
    transform: 'none',
    filter: 'none',
    fadeMs: 0,
    moveMs: 0,
    exitMs: 0,
    growWaitMs: 0,
    ease: EASE.enter,
    exitEase: EASE.exit,
  },
  {
    id: 'custom',
    label: 'Custom',
    summary: 'You set the starting pose, the timing and the curve.',
    opacity: '0',
    transform: 'rotate(6deg) scale(0.92)',
    filter: 'blur(6px)',
    fadeMs: 300,
    moveMs: 300,
    exitMs: 200,
    growWaitMs: 0,
    ease: EASE.outQuint,
    exitEase: EASE.exit,
  },
];

export interface Target {
  id: string;
  label: string;
  defaultRecipe: string;
  note: string;
}

export const TARGETS: Target[] = [
  { id: 'flow', label: 'Sign-in step', defaultRecipe: 'morph', note: 'A Flow: the step swaps and the card resizes.' },
  { id: 'menu', label: 'Menu', defaultRecipe: 'pop', note: 'A popup that opens from its trigger.' },
  { id: 'select', label: 'Select', defaultRecipe: 'none', note: 'A list of options that opens from its trigger.' },
  { id: 'combobox', label: 'Combobox', defaultRecipe: 'pop', note: 'A searchable list that opens from its input.' },
  { id: 'popover', label: 'Popover', defaultRecipe: 'pop', note: 'A panel that opens from its trigger.' },
  { id: 'tooltip', label: 'Tooltip', defaultRecipe: 'pop', note: 'A hint that appears on hover or focus.' },
  { id: 'dialog', label: 'Card dialog', defaultRecipe: 'pop', note: 'A dialog that opens over the page.' },
  { id: 'profile', label: 'Profile dialog', defaultRecipe: 'fade', note: 'A large dialog. Mosaic fades it today.' },
  { id: 'drawer', label: 'Drawer', defaultRecipe: 'slide', note: 'A sheet that enters from the bottom edge.' },
  { id: 'toast', label: 'Toast', defaultRecipe: 'slide', note: 'A notice that enters from the bottom edge.' },
  { id: 'actionbar', label: 'Action bar', defaultRecipe: 'pop', note: 'A bar that appears when items are selected.' },
];

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const point = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  return (x: number) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (point(mid, x1, x2) < x) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return point((low + high) / 2, y1, y2);
  };
}

export function sampleCurve(css: string, count = 48): number[] {
  const numbers = (css.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  if (css.startsWith('cubic-bezier') && numbers.length === 4) {
    const fn = bezier(numbers[0], numbers[1], numbers[2], numbers[3]);
    return Array.from({ length: count + 1 }, (_, i) => fn(i / count));
  }
  if (css.startsWith('linear(') && numbers.length > 1) {
    return numbers;
  }
  return Array.from({ length: count + 1 }, (_, i) => i / count);
}

export function parseBezier(css: string): [number, number, number, number] | null {
  if (!css.startsWith('cubic-bezier')) {
    return null;
  }
  const numbers = (css.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  return numbers.length === 4 ? [numbers[0], numbers[1], numbers[2], numbers[3]] : null;
}
