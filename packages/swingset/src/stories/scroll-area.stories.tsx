/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
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
 */
export function Default() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} w-full`}
      style={{ height: 260 }}
    >
      {/* The group pads all four sides, and the scrollbar takes its lane INSIDE that padding, so
          the right edge otherwise reads as padding plus lane. Cutting the inline-end padding to
          the smallest step lets the scrollbar occupy the gutter the padding was holding, while
          still keeping the rows off it. */}
      <Item.Group
        {...stylex.props(...scrollAreaViewport())}
        style={{ paddingInlineEnd: space['0.5'] }}
      >
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
      className={`${root.className} w-full`}
      style={{ height: 260 }}
    >
      <Item.Group
        {...stylex.props(...scrollAreaViewport())}
        style={{ paddingInlineEnd: space['0.5'] }}
      >
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

/**
 * `stable` holds the scrollbar's lane open even when nothing overflows, so content doesn't shift
 * sideways the moment it crosses the threshold. Both boxes below hold the same short list; only
 * the left one reserves the space. Worth it for content that can change height IN PLACE — a
 * filterable or paginated collection — and wasted width otherwise.
 */
export function Gutter() {
  const root = stylex.props(scrollAreaRoot);

  return (
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
              {accounts[2].organizations.map(name => (
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
                  {/* Neither box overflows, so the reserved lane is only legible against something
                      that reaches the content's right edge — hence the trailing rule. */}
                  <div className='bg-border h-4 w-8 rounded-full' />
                </Item.Root>
              ))}
            </Item.Group>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The scrollbar tokens are global, so setting them on any ancestor retunes every scrolling
 * surface beneath it. This one goes wider and warmer; setting `--cl-scrollbar-thumb` to
 * `transparent` instead would hide the thumb while keeping its lane.
 */
export function ThemedScrollbar() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} w-full`}
      style={
        {
          height: 260,
          '--cl-scrollbar-width': '14px',
          '--cl-scrollbar-thumb-inset': '4px',
          '--cl-scrollbar-thumb': 'oklch(0.72 0.13 55)',
        } as React.CSSProperties
      }
    >
      <Item.Group
        {...stylex.props(...scrollAreaViewport())}
        style={{ paddingInlineEnd: space['0.5'] }}
      >
        {accounts.map(({ email, organizations }) =>
          organizations.map(name => (
            <OrganizationRow
              key={`${email}-${name}`}
              name={name}
            />
          )),
        )}
      </Item.Group>
    </div>
  );
}
