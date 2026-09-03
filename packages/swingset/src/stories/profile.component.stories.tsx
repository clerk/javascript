import { Icon } from '@clerk/ui/mosaic/components/icon';
import type { ProfileRootProps } from '@clerk/ui/mosaic/components/profile';
import { Profile } from '@clerk/ui/mosaic/components/profile';
import { Text } from '@clerk/ui/mosaic/components/text';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './profile.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Profile',
  layout: 'wide',
  source: 'packages/ui/src/mosaic/components/profile/profile.tsx',
  styles: {
    _variants: {
      renderBranding: { true: {}, false: {} },
    },
    _defaultVariants: {
      renderBranding: true,
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as Partial<ProfileRootProps>;
}

const pages = [
  { id: 'general', label: 'General', icon: 'user-circle' as const },
  { id: 'security', label: 'Security', icon: 'shield-check' as const },
  { id: 'billing', label: 'Billing', icon: 'credit-card' as const },
];

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Profile.PageTitle>{title}</Profile.PageTitle>
      <Text>Content for the {title.toLowerCase()} page.</Text>
    </div>
  );
}

function Surface(props: Partial<ProfileRootProps>) {
  const [page, setPage] = useState('general');
  return (
    <Profile.Root
      value={page}
      onValueChange={setPage}
      {...props}
    >
      <Profile.Title>Settings</Profile.Title>
      <Profile.Nav>
        {pages.map(item => (
          <Profile.NavItem
            key={item.id}
            value={item.id}
            icon={
              <Icon
                name={item.icon}
                size='sm'
              />
            }
          >
            {item.label}
          </Profile.NavItem>
        ))}
      </Profile.Nav>
      <Profile.Content>
        {pages.map(item => (
          <Profile.Page
            key={item.id}
            value={item.id}
          >
            <Placeholder title={item.label} />
          </Profile.Page>
        ))}
      </Profile.Content>
    </Profile.Root>
  );
}

export function Default(props: Record<string, unknown>) {
  return <Surface {...knobsAsProps(props)} />;
}

/**
 * Sliding selected and hover marks, in CSS alone: the selected item and the hovered item each
 * publish an anchor name, and two pseudo-elements of the tablist follow them through CSS anchor
 * positioning — no measuring, no script. Both are the neutral colour at a low opacity, so on the
 * selected item the hover mark stacks on the selected one and the fill deepens rather than
 * changing hue. Where anchors are unsupported the rules inside `@supports` never apply and the
 * items keep their own fills.
 *
 * `@scope` with no prelude scopes the sheet to the style element's parent, so it reaches this
 * example and nothing else on the page. Swingset injects the component's styles at a specificity a
 * plain rule cannot beat, hence the `!important`s on the two fills; an app importing the layered
 * stylesheet does not need them.
 */
export function Customized() {
  return (
    <>
      <style>{`
        @scope {
          .cl-profile-nav-item[data-selected] {
            anchor-name: --selected;
          }
          @media (hover: hover) {
            .cl-profile-nav-item:hover:not([data-selected]) {
              anchor-name: --hovered;
            }
            .cl-profile-nav-item[data-selected]:hover {
              anchor-name: --selected, --hovered;
            }
            /* A tab keeps its hover anchor for the length of the fade after the pointer leaves the
               LIST, so the mark fades out where the pointer left it rather than at its static
               position. Inside the list the name hands off at once, so moving between tabs slides. */
            .cl-profile-nav-item {
              --release: var(--cl-duration-fast);
              transition: anchor-name 0s var(--release) allow-discrete;
            }
            .cl-profile-nav-list:hover .cl-profile-nav-item {
              --release: 0s;
            }
          }

          @supports (anchor-name: --probe) {
            .cl-profile-nav-item[data-selected],
            .cl-profile-nav-item:hover:not(:active) {
              background-color: transparent !important;
            }

            .cl-profile-nav-list::before,
            .cl-profile-nav-list::after {
              content: '';
              position: absolute;
              z-index: -1;
              pointer-events: none;
              inset-block-start: anchor(start);
              inset-inline-start: anchor(start);
              inline-size: anchor-size(inline);
              block-size: anchor-size(block);
              border-radius: var(--cl-radius-md);
              background-color: var(--cl-color-neutral);
              opacity: 0.08;
              transition:
                inset-block-start var(--cl-duration-base) var(--cl-ease-default),
                inset-inline-start var(--cl-duration-base) var(--cl-ease-default),
                inline-size var(--cl-duration-base) var(--cl-ease-default),
                block-size var(--cl-duration-base) var(--cl-ease-default),
                opacity var(--cl-duration-fast);
            }
            .cl-profile-nav-list::after {
              position-anchor: --selected;
            }
            .cl-profile-nav-list::before {
              position-anchor: --hovered;
              opacity: 0;
            }
            @media (hover: hover) {
              .cl-profile-nav-list:hover::before {
                opacity: 0.08;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .cl-profile-nav-list::before,
              .cl-profile-nav-list::after {
                transition-duration: 0.01ms;
              }
            }
          }
        }
      `}</style>
      <Surface />
    </>
  );
}
