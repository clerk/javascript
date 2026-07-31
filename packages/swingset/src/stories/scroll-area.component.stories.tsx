/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { ScrollArea } from '@clerk/ui/mosaic/components/scroll-area';
import { Text } from '@clerk/ui/mosaic/components/text';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './scroll-area.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'ScrollArea',
  source: 'packages/ui/src/mosaic/components/scroll-area/scroll-area.tsx',
  styleEngine: 'stylex',
};

const members = [
  'Ada Lovelace',
  'Grace Hopper',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Radia Perlman',
  'Barbara Liskov',
  'Frances Allen',
  'Jean Bartik',
  'Karen Spärck Jones',
  'Shafi Goldwasser',
];

const rows = (names: string[] = members) =>
  names.map(name => (
    <div
      key={name}
      style={{ borderBottom: '1px solid var(--cl-color-border)', padding: '0.75rem 1rem' }}
    >
      <Text>{name}</Text>
    </div>
  ));

export function Default() {
  return (
    <ScrollArea.Root style={{ height: 220, width: 320 }}>
      <ScrollArea.Viewport>{rows()}</ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

// Nothing is scrollable here, so both scroll timelines are inactive, both progress vars stay
// at their registered `initial-value: 0`, and the mask resolves to fully opaque. The absent
// indicators are the resting state rather than something switched off.
export function NotScrollable() {
  return (
    <ScrollArea.Root style={{ height: 220, width: 320 }}>
      <ScrollArea.Viewport>{rows(members.slice(0, 3))}</ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

// The two values only diverge when the content DOESN'T overflow: `scrollbar-gutter: auto`
// reserves space whenever a scrollbar is actually present, so with overflowing content both
// look the same. Toggling across the threshold is the whole demo — watch the `auto` column's
// rows jump sideways as its scrollbar comes and goes while `stable` holds still.
//
// Requires space-consuming scrollbars to show anything at all: Windows and Linux always, macOS
// only with a mouse connected or "Show scroll bars: Always" set. Overlay scrollbars reserve no
// space, so there is no gutter for either value to hold open.
export function Gutter() {
  const [overflowing, setOverflowing] = React.useState(true);
  const content = overflowing ? rows() : rows(members.slice(0, 3));

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <Button
        size='sm'
        variant='outline'
        onClick={() => setOverflowing(value => !value)}
      >
        {overflowing ? 'Shrink content below the threshold' : 'Grow content past the threshold'}
      </Button>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <ScrollArea.Root style={{ border: '1px solid var(--cl-color-border)', height: 220, width: 260 }}>
            <ScrollArea.Viewport gutter='stable'>{content}</ScrollArea.Viewport>
          </ScrollArea.Root>
          <Text size='sm'>gutter=&quot;stable&quot; — rows never move</Text>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <ScrollArea.Root style={{ border: '1px solid var(--cl-color-border)', height: 220, width: 260 }}>
            <ScrollArea.Viewport gutter='auto'>{content}</ScrollArea.Viewport>
          </ScrollArea.Root>
          <Text size='sm'>gutter=&quot;auto&quot; — rows widen when the scrollbar goes</Text>
        </div>
      </div>
    </div>
  );
}

// Both knobs are plain custom properties, so they can be set anywhere in the cascade — on
// the element, on a wrapper, or once at `:root` to retune every scroll area in a theme.
export function Tuning() {
  return (
    <>
      <style>{`
        .tuned-scroll-area {
          --cl-scroll-area-fade-size: 4rem;   /* how tall the fade is */
          --cl-scroll-area-fade-range: 3rem;  /* how far you scroll before it's at full strength */
        }
      `}</style>
      <ScrollArea.Root
        className='tuned-scroll-area'
        style={{ height: 220, width: 320 }}
      >
        <ScrollArea.Viewport>{rows()}</ScrollArea.Viewport>
      </ScrollArea.Root>
    </>
  );
}

// The indicators are a theme decision, so swapping the mask for something else needs no prop
// and no JavaScript — just CSS.
//
// `mask-image: none` retires the default treatment, and the two progress vars stay readable
// for whatever replaces it. Here they drive the opacity of a pair of gradient overlays.
//
// Three things worth copying. The overlays hang off the VIEWPORT, because that is the element
// the scroll-driven animations write the vars onto (they inherit downward, not up to the
// root). They are absolutely positioned rather than sticky, so they overlay the content
// instead of taking space in the scroll flow the way a sticky pseudo-element would. And the
// scrim is mixed from a theme token rather than hardcoded black — a black scrim darkens a
// dark surface, which is indistinguishable from the mask it replaced, so the indicator has to
// flip with the theme the way `--cl-color-card-foreground` does.
export function CustomIndicators() {
  return (
    <>
      <style>{`
        .shadow-indicators .cl-scroll-area-viewport {
          mask-image: none;
        }
        .shadow-indicators .cl-scroll-area-viewport::before,
        .shadow-indicators .cl-scroll-area-viewport::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 2rem;
          pointer-events: none;
        }
        .shadow-indicators .cl-scroll-area-viewport::before {
          top: 0;
          background: linear-gradient(to bottom, color-mix(in oklab, var(--cl-color-card-foreground) 28%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-start);
        }
        .shadow-indicators .cl-scroll-area-viewport::after {
          bottom: 0;
          background: linear-gradient(to top, color-mix(in oklab, var(--cl-color-card-foreground) 28%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-end);
        }
      `}</style>
      <ScrollArea.Root
        className='shadow-indicators'
        style={{ height: 220, width: 320 }}
      >
        <ScrollArea.Viewport>{rows()}</ScrollArea.Viewport>
      </ScrollArea.Root>
    </>
  );
}
