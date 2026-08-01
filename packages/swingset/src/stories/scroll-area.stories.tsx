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
 * The scroll surface, capped in height so it overflows. Everything visible here — both edge
 * fades and the scrollbar — is CSS on the one element.
 *
 * `stylex.props()` returns a `className`, so a class of your own has to be MERGED with it rather
 * than spread beside one: whichever comes last in JSX wins outright and silently drops the other.
 *
 * The border marking the scroll container is on the ROOT, not the viewport: a mask applies to the
 * element's whole rendering, borders included, so a border on the viewport would fade out at the
 * same edges its content does. The root wraps the viewport exactly, so it outlines the same box.
 */
export function Default() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-inner'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {accounts.map(({ email, organizations }, index) => (
          <React.Fragment key={email}>
            {/* Sibling groups would each contribute their own padding either side of a separator.
                These share one group — the scroller — so the gap comes from the separator itself.
                `space['2']` is the group's own padding step, so the two stay in sync. */}
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

/**
 * The same atoms on a surface whose content fits. Nothing is conditional in the markup and no
 * measurement runs — an inactive scroll timeline leaves both progress vars at their registered
 * `initial-value: 0`, which the mask reads as "no fade", and the browser draws no scrollbar.
 * So the resting state costs nothing and there is no "is it scrollable" branch to write.
 */
export function NotScrollable() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-inner'] }}
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
 * `stable` holds the scrollbar's lane open even when nothing overflows, so content doesn't shift
 * sideways the moment it crosses the threshold. Toggling the row count is the whole demonstration:
 * `auto` jumps its content left by the lane's width as the list starts overflowing, `stable` does
 * not move. Worth it for content that can change height IN PLACE — a filterable or paginated
 * collection — and wasted width otherwise.
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
              style={{ height: 140, borderRadius: radiusVars['--cl-radius-inner'] }}
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
                    {/* The shift is only legible against something that reaches the content's
                        right edge — hence the trailing rule. */}
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

const themedRows = [
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
 * The far end of what `--cl-scrollbar-thumb-idle` is for. Mosaic already dims the bar while the
 * pointer is elsewhere; taking that token to zero alpha removes it entirely, so the scrollbar
 * appears only once you reach the region. One declaration, no rules of your own.
 *
 * `oklch(from … / 0)` rather than the `transparent` keyword: `transparent` is `rgba(0, 0, 0, 0)` —
 * transparent BLACK — so interpolating out of it drags the thumb through a series of dark,
 * half-transparent greys and the bar reads as dirty on the way in. Relative colour syntax reads the
 * base token's own channels and drops only the alpha, so the only thing moving is opacity.
 *
 * It fades because idle → base is the one step set on the SCROLLER, which owns the transition. The
 * thumb's `-hover` and `-active` still work from there, and still snap.
 *
 * The lane stays reserved throughout: only the thumb's paint is conditional, so nothing reflows on
 * the way in or out.
 */
export function HoverReveal() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      css={{ '--cl-scrollbar-thumb-idle': 'oklch(from var(--cl-scrollbar-thumb) l c h / 0)' }}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-inner'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {themedRows.map(name => (
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
 * The scrollbar tokens are global, so setting them on any ancestor retunes every scrolling surface
 * beneath it. This one goes wider and gives each step a colour of its own — deliberately louder
 * than anything you'd ship, so they're told apart at a glance. Move the pointer into the region,
 * then onto the bar, then drag it.
 *
 * Only the FIRST of those moves animates, and the reason is structural rather than chromatic:
 * amber → teal is a change to the region's own rest colour, so it happens on the scroller, where
 * the transition lives. Pink and violet are the thumb's own states, and Blink runs no transition
 * declared on `::-webkit-scrollbar-thumb`, so those switch instantly however they're written. The
 * demo slows the transition well past Mosaic's default to make that first step legible.
 *
 * Every value here is an `oklch()` literal, which is what keeps the one animated step well
 * defined — the registered property interpolates between two colours in a single space rather than
 * guessing across notations. The trap to avoid is `transparent`: it means `rgba(0, 0, 0, 0)`, so
 * fading out of it travels through dark greys. Use the target colour at zero alpha instead, as
 * `HoverReveal` above does.
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
        // Slowed well past Mosaic's own `base` step purely so the one animated transition is
        // impossible to miss — at the real 0.15s the amber → teal step is over before you've
        // finished moving the pointer, which reads as no animation at all. Nothing else in these
        // rows reads a duration token, so this only stretches the scrollbar.
        '--cl-duration-base': '0.6s',
        // Rest, and the one step that fades: it is set on the scroller, so the scroller's
        // transition carries it.
        '--cl-scrollbar-thumb': 'oklch(0.77 0.16 70)',
        '&:hover': { '--cl-scrollbar-thumb': 'oklch(0.72 0.15 195)' },
        // The thumb's own states. Instant, by construction.
        '--cl-scrollbar-thumb-hover': 'oklch(0.65 0.24 15)',
        '--cl-scrollbar-thumb-active': 'oklch(0.55 0.25 295)',
      }}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-inner'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {themedRows.map(name => (
          <OrganizationRow
            key={name}
            name={name}
          />
        ))}
      </Item.Group>
    </div>
  );
}
