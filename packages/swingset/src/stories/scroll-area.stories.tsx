/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Item } from '@clerk/ui/mosaic/components/item';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { radiusVars, space } from '@clerk/ui/mosaic/styles';
import * as stylex from '@stylexjs/stylex';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './scroll-area.stories?raw';

export const meta: StoryMeta = {
  group: 'Styles',
  title: 'Scroll Area',
  source: 'packages/ui/src/mosaic/components/scroll-area/scroll-area.styles.ts',
};

const accounts = [
  { email: 'cameron.walker@gmail.com', organizations: ['Clerk', 'Acme Corporation', 'Globex'] },
  { email: 'cameron@clerk.com', organizations: ['Clerk', 'Initech', 'Umbrella Health'] },
  { email: 'cam@designcloud.io', organizations: ['Clerk', 'DesignCloud'] },
];

function OrganizationRow({ name }: { name: string }) {
  return (
    <Item.Root
      size='xs'
      render={({ children, ...props }) => (
        <button
          {...props}
          type='button'
        >
          {children}
        </button>
      )}
    >
      <Item.Media>
        <Avatar.Root
          size='fit'
          shape='square'
        >
          <Avatar.Image
            src='https://github.com/clerk.png'
            alt={name}
          />
          <Avatar.Fallback>{name[0]}</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>{name}</Item.Title>
      </Item.Content>
    </Item.Root>
  );
}

/**
 * The border is on the ROOT, not the viewport: a mask applies to the element's whole rendering,
 * borders included, so a border on the viewport would fade out at the same edges its content does.
 */
export function Default() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {accounts.map(({ email, organizations }, index) => (
          <React.Fragment key={email}>
            {index > 0 ? <Item.Separator style={{ marginBlock: space['2'] }} /> : null}
            <Item.Root size='xs'>
              <Item.Content>
                <Item.Description>{email}</Item.Description>
              </Item.Content>
            </Item.Root>
            {organizations.map(name => (
              <OrganizationRow
                key={`${email}-${name}`}
                name={name}
              />
            ))}
          </React.Fragment>
        ))}
      </Item.Group>
    </div>
  );
}

/** The same atoms on a surface whose content fits. Nothing in the markup is conditional. */
export function NotScrollable() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {accounts[0].organizations.map(name => (
          <OrganizationRow
            key={name}
            name={name}
          />
        ))}
      </Item.Group>
    </div>
  );
}

const gutterRows = ['Clerk', 'DesignCloud', 'Acme Corporation', 'Globex', 'Initech', 'Umbrella Health'];

/**
 * Toggling the row count is the whole demonstration: `auto` jumps its content left by the lane's
 * width as the list starts overflowing, `stable` does not move.
 */
export function Gutter() {
  const [scrollable, setScrollable] = React.useState(false);
  const root = stylex.props(scrollAreaRoot);
  const names = scrollable ? gutterRows : gutterRows.slice(0, 2);

  return (
    <div className='flex w-full flex-col items-start gap-4'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setScrollable(value => !value)}
      >
        {scrollable ? 'Remove rows' : 'Add rows'}
      </Button>

      <div className='flex w-full gap-4'>
        {(['stable', 'auto'] as const).map(gutter => (
          <div
            key={gutter}
            className='min-w-0 flex-1'
          >
            <p className='text-muted-foreground mb-2 font-mono text-xs'>{gutter}</p>
            <div
              {...root}
              className={`${root.className} border-border border`}
              style={{ height: 140, borderRadius: radiusVars['--cl-radius-sm'] }}
            >
              <Item.Group {...stylex.props(...scrollAreaViewport(gutter))}>
                {names.map(name => (
                  <Item.Root
                    key={name}
                    size='xs'
                  >
                    <Item.Media>
                      <Avatar.Root
                        size='fit'
                        shape='square'
                      >
                        <Avatar.Image
                          src='https://github.com/clerk.png'
                          alt={name}
                        />
                        <Avatar.Fallback>{name[0]}</Avatar.Fallback>
                      </Avatar.Root>
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{name}</Item.Title>
                    </Item.Content>
                    {/* The shift is only legible against something reaching the content's right edge. */}
                    <div className='bg-border h-4 w-8 rounded-full' />
                  </Item.Root>
                ))}
              </Item.Group>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const manyRows = [
  'Clerk',
  'Acme Corporation',
  'Globex',
  'Initech',
  'Umbrella Health',
  'DesignCloud',
  'Stark Industries',
  'Wayne Enterprises',
  'Cyberdyne Systems',
  'Soylent Industries',
  'Tyrell Corporation',
  'Weyland-Yutani',
  'Massive Dynamic',
  'Aperture Science',
  'Black Mesa',
  'Oscorp',
];

/**
 * Taking `--cl-scrollbar-thumb-idle` to zero alpha removes the bar entirely until the pointer
 * reaches the region. `oklch(from … / 0)` rather than `transparent`, which is transparent BLACK and
 * drags the fade through dark greys.
 */
export function HoverReveal() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      css={{ '--cl-scrollbar-thumb-idle': 'oklch(from var(--cl-scrollbar-thumb) l c h / 0)' }}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {manyRows.map(name => (
          <OrganizationRow
            key={name}
            name={name}
          />
        ))}
      </Item.Group>
    </div>
  );
}

/**
 * A colour per state, deliberately louder than anything you'd ship. Only amber → teal animates:
 * it is a change on the SCROLLER, which owns the transition. The duration is stretched well past
 * Mosaic's own `base` step purely so that one step is impossible to miss.
 */
export function ThemedScrollbar() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      css={{
        '--cl-scrollbar-width': '14px',
        '--cl-scrollbar-thumb-inset': '4px',
        '--cl-duration-base': '0.6s',
        '--cl-scrollbar-thumb': 'oklch(0.77 0.16 70)',
        '&:hover': { '--cl-scrollbar-thumb': 'oklch(0.72 0.15 195)' },
        '--cl-scrollbar-thumb-hover': 'oklch(0.65 0.24 15)',
        '--cl-scrollbar-thumb-active': 'oklch(0.55 0.25 295)',
      }}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {manyRows.map(name => (
          <OrganizationRow
            key={name}
            name={name}
          />
        ))}
      </Item.Group>
    </div>
  );
}

/**
 * The mask retired for overlay scrims, each reading the progress var for its edge. The scrim mixes
 * from `--cl-color-card-foreground`, so it reads as a shadow on light and a glow on dark;
 * hardcoded black would vanish on a dark surface. `overflow: hidden` on the root keeps the scrims
 * inside its rounded corners.
 *
 * Each scrim slides in from behind its edge as well as fading, so the two vars drive position and
 * opacity together. `overflow: hidden` on the root both rounds their corners and hides the
 * offscreen half.
 *
 * `mask-image` is retired inline rather than from the stylesheet: swingset's dev server injects
 * StyleX atoms with a specificity bump no selector of ours can outrank. The extracted production
 * sheet puts them in a cascade layer, where the plain CSS below would win on its own.
 */
export function ShadowIndicators() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <>
      <style>{`
        .demo-scroll-shadows .cl-item-group::before,
        .demo-scroll-shadows .cl-item-group::after {
          content: '';
          position: absolute;
          inset-inline: 0;
          height: var(--cl-scroll-fade-size);
          pointer-events: none;
        }
        .demo-scroll-shadows .cl-item-group::before {
          top: 0;
          background: linear-gradient(to bottom, color-mix(in oklab, var(--cl-color-card-foreground) 22%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-start);
          transform: translateY(calc((var(--cl-scroll-area-progress-start) - 1) * var(--cl-scroll-fade-size)));
        }
        .demo-scroll-shadows .cl-item-group::after {
          bottom: 0;
          background: linear-gradient(to top, color-mix(in oklab, var(--cl-color-card-foreground) 22%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-end);
          transform: translateY(calc((1 - var(--cl-scroll-area-progress-end)) * var(--cl-scroll-fade-size)));
        }
      `}</style>
      <div
        {...root}
        className={`${root.className} demo-scroll-shadows border-border w-full overflow-hidden border`}
        style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
      >
        <Item.Group
          {...stylex.props(...scrollAreaViewport())}
          style={{ maskImage: 'none' }}
        >
          {manyRows.map(name => (
            <OrganizationRow
              key={name}
              name={name}
            />
          ))}
        </Item.Group>
      </div>
    </>
  );
}
