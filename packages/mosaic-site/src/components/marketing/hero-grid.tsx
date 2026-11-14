'use client';
import * as React from 'react';

import type { Mode } from '@/components/use-mode';

const MAJOR = 32;
const MINOR = 8;
const SPAN = 160 * MAJOR;

type GridLook = { color: string; major: number; minor: number; mask: string; phoneMask: string };

const TOP_FADE = 'linear-gradient(to bottom, transparent, black 20rem)';

const LOOKS: Record<Mode, GridLook> = {
  light: {
    color: 'oklch(0.6 0.15 255)',
    major: 13,
    minor: 5.5,
    mask: [
      'radial-gradient(ellipse 55% 65% at 50% 32%, black 25%, transparent 100%)',
      'radial-gradient(ellipse 22rem 18rem at 50% 38%, rgb(0 0 0 / 0.3) 0%, black 100%)',
      TOP_FADE,
    ].join(', '),
    phoneMask: [
      'radial-gradient(ellipse 100% 70% at 50% 32%, black 60%, transparent 100%)',
      'radial-gradient(ellipse 14rem 12rem at 50% 38%, rgb(0 0 0 / 0.3) 0%, black 100%)',
      TOP_FADE,
    ].join(', '),
  },
  dark: {
    color: 'var(--foreground)',
    major: 5,
    minor: 2,
    mask: ['radial-gradient(ellipse 65% 75% at 50% 34%, black 40%, transparent 100%)', TOP_FADE].join(', '),
    phoneMask: ['radial-gradient(ellipse 100% 75% at 50% 34%, black 65%, transparent 100%)', TOP_FADE].join(', '),
  },
};

const line = (direction: string, color: string, weight: number, step: number) =>
  `repeating-linear-gradient(${direction}, color-mix(in srgb, ${color} ${weight}%, transparent) 0 1px, transparent 1px ${step}px)`;

function background({ color, major, minor }: GridLook) {
  return [
    line('to right', color, major, MAJOR),
    line('to bottom', color, major, MAJOR),
    line('to right', color, minor, MINOR),
    line('to bottom', color, minor, MINOR),
  ].join(', ');
}

export function HeroGrid() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [top, setTop] = React.useState<number | null>(null);

  React.useEffect(() => {
    const section = ref.current?.parentElement;
    const headline = section?.querySelector('h1');
    if (!section || !headline) {
      return;
    }
    const measure = () => setTop(headline.offsetTop);
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(headline);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-20 [-webkit-mask-image:var(--grid-mask-light)] [mask-image:var(--grid-mask-light)] max-sm:[-webkit-mask-image:var(--grid-mask-light-phone)] max-sm:[mask-image:var(--grid-mask-light-phone)] dark:[-webkit-mask-image:var(--grid-mask-dark)] dark:[mask-image:var(--grid-mask-dark)] max-sm:dark:[-webkit-mask-image:var(--grid-mask-dark-phone)] max-sm:dark:[mask-image:var(--grid-mask-dark-phone)]'
      style={
        {
          '--grid-mask-light': LOOKS.light.mask,
          '--grid-mask-dark': LOOKS.dark.mask,
          '--grid-mask-light-phone': LOOKS.light.phoneMask,
          '--grid-mask-dark-phone': LOOKS.dark.phoneMask,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        } as React.CSSProperties
      }
    >
      <div
        className='absolute [background-image:var(--grid-bg-light)] dark:[background-image:var(--grid-bg-dark)]'
        style={
          {
            left: `calc(50% - ${SPAN / 2}px)`,
            width: SPAN,
            top: -SPAN / 2,
            height: SPAN,
            translate: `0 ${top ?? 0}px`,
            opacity: top === null ? 0 : 1,
            '--grid-bg-light': background(LOOKS.light),
            '--grid-bg-dark': background(LOOKS.dark),
          } as React.CSSProperties
        }
      />
    </div>
  );
}
