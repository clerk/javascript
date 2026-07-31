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
export { default as __source } from './item.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Item',
  source: 'packages/ui/src/mosaic/components/item/item.tsx',
};

function CheckMarkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 16 16'
      width='1em'
      height='1em'
      fill='none'
      {...props}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M12.136 3.607a.75.75 0 0 1 .257 1.029l-4.5 7.5a.75.75 0 0 1-1.173.144l-3-3a.75.75 0 0 1 1.06-1.06l2.321 2.32 4.006-6.676a.75.75 0 0 1 1.029-.257'
        clipRule='evenodd'
      />
    </svg>
  );
}

function PlusIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 16 16'
      width='1em'
      height='1em'
      fill='none'
      {...props}
    >
      <rect
        width='0.0001'
        height='0.0001'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8 3C8.41421 3 8.75 3.33579 8.75 3.75V7.25H12.25C12.6642 7.25 13 7.58579 13 8C13 8.41421 12.6642 8.75 12.25 8.75H8.75V12.25C8.75 12.6642 8.41421 13 8 13C7.58579 13 7.25 12.6642 7.25 12.25V8.75L3.75 8.75C3.33579 8.75 3 8.41421 3 8C3 7.58579 3.33579 7.25 3.75 7.25L7.25 7.25V3.75C7.25 3.33579 7.58579 3 8 3Z'
        fill='#747686'
      />
    </svg>
  );
}

function SignOutIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 16 16'
      width='1em'
      height='1em'
      fill='none'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.47261 2.21675C7.76482 1.92775 8.23518 1.92775 8.52739 2.21675L11.7774 5.43103C12.0719 5.7223 12.0745 6.19717 11.7833 6.49168C11.492 6.78618 11.0171 6.78881 10.7226 6.49754L8.75 4.54661V9.25C8.75 9.66421 8.41421 10 8 10C7.58579 10 7.25 9.66421 7.25 9.25V4.54661L5.27739 6.49754C4.98289 6.78881 4.50802 6.78618 4.21675 6.49168C3.92548 6.19717 3.9281 5.7223 4.22261 5.43103L7.47261 2.21675ZM2.75 10C3.16421 10 3.5 10.3358 3.5 10.75V11.25C3.5 11.9404 4.05964 12.5 4.75 12.5H11.25C11.9404 12.5 12.5 11.9404 12.5 11.25V10.75C12.5 10.3358 12.8358 10 13.25 10C13.6642 10 14 10.3358 14 10.75V11.25C14 12.7688 12.7688 14 11.25 14H4.75C3.23122 14 2 12.7688 2 11.25V10.75C2 10.3358 2.33579 10 2.75 10Z'
        fill='#747686'
      />
    </svg>
  );
}

export function Default() {
  return (
    <Item.Root>
      <Item.Media>
        <Avatar.Root
          shape='square'
          size='fit'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          variant='outline'
          size='sm'
        >
          Manage
        </Button>
      </Item.Actions>
    </Item.Root>
  );
}

export function Interactive() {
  return (
    <Item.Root
      render={({ children, ...props }) => (
        <a
          {...props}
          href='#settings'
        >
          {children}
        </a>
      )}
    >
      <Item.Media>
        <Avatar.Root
          shape='square'
          size='fit'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
    </Item.Root>
  );
}

export function Sizes() {
  return (
    <div className='w-full'>
      {(['md', 'xs'] as const).map(size => (
        <Item.Root
          key={size}
          size={size}
        >
          <Item.Media>
            <Avatar.Root
              shape='square'
              size='fit'
            >
              <Avatar.Fallback>T</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Test Organization</Item.Title>
          </Item.Content>
        </Item.Root>
      ))}
    </div>
  );
}

export function Group() {
  return (
    <div className='w-full'>
      <Item.Group>
        <Item.Root>
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='circle'
            >
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Cameron Walker</Item.Title>
            <Item.Description>cameron@clerk.com</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              variant='outline'
              size='sm'
            >
              Invite
            </Button>
          </Item.Actions>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root size='xs'>
          <Item.Content>
            <Item.Description>cameron.walker@gmail.com</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              variant='ghost'
              color='neutral'
              size='sm'
              shape='square'
            >
              <svg
                width='16'
                viewBox='0 0 16 16'
              >
                <path
                  d='M2.75 8.01978V8.01001C2.75 7.31965 3.30964 6.76001 4 6.76001C4.69036 6.76001 5.25 7.31965 5.25 8.01001V8.01978C5.25 8.71013 4.69036 9.26978 4 9.26978C3.30964 9.26978 2.75 8.71013 2.75 8.01978Z'
                  fill='currentColor'
                />
                <path
                  d='M6.75 8.00977V8C6.75 7.30964 7.30964 6.75 8 6.75C8.69036 6.75 9.25 7.30964 9.25 8V8.00977C9.25 8.70012 8.69036 9.25977 8 9.25977C7.30964 9.25977 6.75 8.70012 6.75 8.00977Z'
                  fill='currentColor'
                />
                <path
                  d='M10.75 8.00977V8C10.75 7.30964 11.3096 6.75 12 6.75C12.6904 6.75 13.25 7.30964 13.25 8V8.00977C13.25 8.70012 12.6904 9.25977 12 9.25977C11.3096 9.25977 10.75 8.70012 10.75 8.00977Z'
                  fill='currentColor'
                />
              </svg>
            </Button>
          </Item.Actions>
        </Item.Root>
        <Item.Root size='xs'>
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Clerk</Item.Title>
          </Item.Content>
          <CheckMarkIcon width='28px' />
        </Item.Root>
        <Item.Root
          size='xs'
          render={({ children, ...props }) => (
            <a
              {...props}
              href='#two'
            >
              {children}
            </a>
          )}
        >
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Clerk</Item.Title>
          </Item.Content>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root
          size='xs'
          render={({ children, ...props }) => (
            <a
              {...props}
              href='#two'
            >
              {children}
            </a>
          )}
        >
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Fallback>D</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>DesignCloud</Item.Title>
          </Item.Content>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root
          size='xs'
          render={({ children, ...props }) => (
            <a
              {...props}
              href='#two'
            >
              {children}
            </a>
          )}
        >
          <Item.Media>
            <PlusIcon width='100%' />
          </Item.Media>
          <Item.Content>
            <Item.Label>Add account</Item.Label>
          </Item.Content>
        </Item.Root>
        <Item.Root
          size='xs'
          render={({ children, ...props }) => (
            <button
              type='button'
              {...props}
            >
              {children}
            </button>
          )}
        >
          <Item.Media>
            <SignOutIcon width='100%' />
          </Item.Media>
          <Item.Content>
            <Item.Label>Sign out of all accounts</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>
    </div>
  );
}

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

// A capped-height group that scrolls, with fade indicators at whichever edge still has
// something to reveal. The scroll surface is StyleX atoms rather than a component, so it goes
// straight onto the `Item.Group` — no wrapper element, and the group keeps its `.cl-item-group`
// slot, which stays the hook a theme targets. The outer box only exists to cap the height and
// to give overlays something to anchor to.
export function Scrolling() {
  // `stylex.props()` returns a `className`, so it has to be MERGED with any class of your own
  // rather than spread beside one — whichever comes last in JSX wins outright.
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
            {/* The sections above are separate groups, so each one's own padding puts a gap either
                side of the separator. Here they share one group — the scroller — so the gap has to
                come from the separator itself. `space['2']` is the group's own padding step, so the
                two stay in sync if the spacing scale is retuned. */}
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
