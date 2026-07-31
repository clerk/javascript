/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Item } from '@clerk/ui/mosaic/components/item';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { Text } from '@clerk/ui/mosaic/components/text';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './scroll-area.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'ScrollArea',
  source: 'packages/ui/src/mosaic/components/scroll-area/scroll-area.styles.ts',
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
];

const rows = (names: string[] = members) =>
  names.map(name => (
    <Item.Root key={name}>
      <Item.Media>
        <Avatar.Root
          size='fit'
          shape='circle'
        >
          <Avatar.Fallback>{name[0]}</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>{name}</Item.Title>
      </Item.Content>
    </Item.Root>
  ));

// The scroll surface goes straight onto the `Item.Group` that already scrolls — no wrapper
// element, and the group keeps its own `.cl-item-group` slot, which stays the hook a theme
// targets. `scrollAreaRoot` is on the outer box only so overlays have something to anchor to;
// a group whose parent is already positioned doesn't need it.
export function Default() {
  return (
    <div
      style={{ height: 220, width: 320 }}
      {...stylex.props(scrollAreaRoot)}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>{rows()}</Item.Group>
    </div>
  );
}

// Nothing is scrollable here, so both scroll timelines are inactive, both progress vars stay
// at their registered `initial-value: 0`, and the mask resolves to fully opaque. The absent
// indicators are the resting state rather than something switched off.
export function NotScrollable() {
  return (
    <div
      style={{ height: 220, width: 320 }}
      {...stylex.props(scrollAreaRoot)}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>{rows(members.slice(0, 2))}</Item.Group>
    </div>
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
  const content = overflowing ? rows() : rows(members.slice(0, 2));

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <button
        type='button'
        onClick={() => setOverflowing(value => !value)}
      >
        {overflowing ? 'Shrink content below the threshold' : 'Grow content past the threshold'}
      </button>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div
            style={{ border: '1px solid var(--cl-color-border)', height: 220, width: 260 }}
            {...stylex.props(scrollAreaRoot)}
          >
            <Item.Group {...stylex.props(...scrollAreaViewport('stable'))}>{content}</Item.Group>
          </div>
          <Text size='sm'>stable — rows never move</Text>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div
            style={{ border: '1px solid var(--cl-color-border)', height: 220, width: 260 }}
            {...stylex.props(scrollAreaRoot)}
          >
            <Item.Group {...stylex.props(...scrollAreaViewport('auto'))}>{content}</Item.Group>
          </div>
          <Text size='sm'>auto — rows widen when the scrollbar goes</Text>
        </div>
      </div>
    </div>
  );
}

// Theme tokens rather than component variables, so they can be set anywhere in the cascade —
// on the element, on a wrapper, or once at `:root` to retune every scrolling surface in Mosaic
// at the same time. Scoped to a wrapper class here so the demo doesn't retheme the page.
export function Tuning() {
  return (
    <>
      <style>{`
        .tuned-scroll-area {
          --cl-scroll-fade-size: 4rem;   /* how tall the fade is */
          --cl-scroll-fade-range: 3rem;  /* how far you scroll before it's at full strength */
        }
      `}</style>
      <div
        className='tuned-scroll-area'
        style={{ height: 220, width: 320 }}
        {...stylex.props(scrollAreaRoot)}
      >
        <Item.Group {...stylex.props(...scrollAreaViewport())}>{rows()}</Item.Group>
      </div>
    </>
  );
}

// The indicators are a theme decision, so swapping the mask for something else needs no
// JavaScript — just CSS. `mask-image: none` retires the default treatment and the two progress
// vars stay readable for whatever replaces it.
//
// Three things worth copying. The overlays hang off the element the atoms were applied to,
// because that is what the animations write the vars onto — here `.cl-item-group`, since the
// styles ride on a slot that already exists rather than a wrapper of their own. They are
// absolutely positioned rather than sticky, so they overlay the content instead of taking space
// in the scroll flow. And the scrim is mixed from a theme token rather than hardcoded black,
// which would darken a dark surface and be indistinguishable from the mask it replaced.
export function CustomIndicators() {
  return (
    <>
      <style>{`
        .shadow-indicators .cl-item-group {
          mask-image: none;
        }
        .shadow-indicators .cl-item-group::before,
        .shadow-indicators .cl-item-group::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 2rem;
          pointer-events: none;
        }
        .shadow-indicators .cl-item-group::before {
          top: 0;
          background: linear-gradient(to bottom, color-mix(in oklab, var(--cl-color-card-foreground) 28%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-start);
        }
        .shadow-indicators .cl-item-group::after {
          bottom: 0;
          background: linear-gradient(to top, color-mix(in oklab, var(--cl-color-card-foreground) 28%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-end);
        }
      `}</style>
      <div
        className='shadow-indicators'
        style={{ height: 220, width: 320 }}
        {...stylex.props(scrollAreaRoot)}
      >
        <Item.Group {...stylex.props(...scrollAreaViewport())}>{rows()}</Item.Group>
      </div>
    </>
  );
}
