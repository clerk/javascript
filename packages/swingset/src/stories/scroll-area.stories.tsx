/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Item } from '@clerk/ui/mosaic/components/item';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { space } from '@clerk/ui/mosaic/styles';
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
      className={`${root.className} border-border w-full rounded-lg border`}
      style={{ height: 260 }}
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
      className={`${root.className} border-border w-full rounded-lg border`}
      style={{ height: 260 }}
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
              className={`${root.className} border-border rounded-lg border`}
              style={{ height: 140 }}
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
 * A scrollbar that stays invisible until you reach the region. Mosaic's own `hover` token is the
 * THUMB's state, so it can't express this — a thumb you can't see is not a target you can find.
 * Region hover is two lines of your own CSS instead: park the token at `transparent` and override
 * it on the container's `:hover`.
 *
 * This one fades. The thumb's colour resolves through an `@property`-registered custom property
 * that the SCROLLER transitions and the thumb inherits, so retargeting the token from the region is
 * a computed-value change the transition picks up. The thumb's own `-hover` / `-active` cannot do
 * the same — Blink runs no transition declared on `::-webkit-scrollbar-thumb`, so those snap.
 *
 * The rest value is the reveal colour at zero alpha, NOT the `transparent` keyword. `transparent`
 * is `rgba(0, 0, 0, 0)` — transparent BLACK — so interpolating out of it drags the thumb through a
 * series of dark, half-transparent greys and the bar reads as dirty on the way in. Relative colour
 * syntax takes the token's own channels and drops only the alpha, so the fade moves along one axis.
 *
 * The lane stays reserved throughout: only the thumb's paint is conditional, so nothing reflows on
 * the way in or out.
 */
export function HoverReveal() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full rounded-lg border`}
      css={{
        '--cl-scrollbar-thumb': 'oklch(from var(--cl-color-neutral-faded) l c h / 0)',
        '&:hover': { '--cl-scrollbar-thumb': 'var(--cl-color-neutral-faded)' },
      }}
      style={{ height: 260 }}
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
 * beneath it. This one goes wider and gives each state a colour of its own — amber at rest, pink
 * under the pointer, violet while dragging — which is deliberately louder than anything you'd ship,
 * so the three are told apart at a glance. Hover the thumb, then drag it. Both switch instantly:
 * a value changed on the thumb itself cannot transition.
 *
 * The states are the THUMB's, not the region's: nothing changes until the pointer is on the bar
 * itself. Setting `--cl-scrollbar-thumb` to `transparent` would hide it at rest while keeping its
 * lane, and the other two states would still work.
 */
export function ThemedScrollbar() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full rounded-lg border`}
      style={
        {
          height: 260,
          '--cl-scrollbar-width': '14px',
          '--cl-scrollbar-thumb-inset': '4px',
          '--cl-scrollbar-thumb': 'oklch(0.77 0.16 70)',
          '--cl-scrollbar-thumb-hover': 'oklch(0.65 0.24 15)',
          '--cl-scrollbar-thumb-active': 'oklch(0.55 0.25 295)',
        } as React.CSSProperties
      }
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
