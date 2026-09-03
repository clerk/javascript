import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import type { ProfileRootProps } from '@clerk/ui/mosaic/components/profile';
import { Profile } from '@clerk/ui/mosaic/components/profile';
import { Section } from '@clerk/ui/mosaic/components/section';
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

/** Stand-in content with the shape of a real page: a headline, then sections of rows. */
const stubSections: Record<string, { title: string; rows: { label: string; description: string }[] }[]> = {
  general: [
    {
      title: 'Profile',
      rows: [
        { label: 'Name', description: 'Preston Booth' },
        { label: 'Username', description: 'prestonxyz' },
        { label: 'Email addresses', description: 'preston@clerk.dev, preston.booth@gmail.com' },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { label: 'Language', description: 'English (US)' },
        { label: 'Time zone', description: 'Mountain Time' },
      ],
    },
  ],
  security: [
    {
      title: 'Sign in',
      rows: [
        { label: 'Password', description: 'Last changed 3 months ago' },
        { label: 'Passkeys', description: 'MacBook Pro · iPhone' },
        { label: 'Two-step verification', description: 'Authenticator app, SMS backup' },
      ],
    },
    {
      title: 'Devices',
      rows: [
        { label: 'Safari on macOS', description: 'This device · Salt Lake City, UT' },
        { label: 'Safari on iOS', description: 'Last seen 2 weeks ago · Orem, UT' },
        { label: 'Chrome on Windows', description: 'Last seen 3 months ago · Denver, CO' },
      ],
    },
  ],
  billing: [
    {
      title: 'Subscription',
      rows: [
        { label: 'Plan', description: 'Basic · $12 / month' },
        { label: 'Next payment', description: 'Aug 26' },
      ],
    },
    {
      title: 'Payment methods',
      rows: [{ label: 'Visa •••• 0644', description: 'Expires 02/2029 · Default' }],
    },
    {
      title: 'History',
      rows: [
        { label: 'May 26, 2026', description: '$25.00 · Paid' },
        { label: 'Apr 26, 2026', description: '$25.00 · Paid' },
        { label: 'Mar 26, 2026', description: '$12.00 · Paid' },
      ],
    },
  ],
};

function StubPage({ id, title }: { id: string; title: string }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Profile.PageTitle>{title}</Profile.PageTitle>
      {stubSections[id]?.map(section => (
        <Section.Root key={section.title}>
          <Section.Title>{section.title}</Section.Title>
          <Section.Group>
            <Section.Row>
              <Section.Items>
                {section.rows.map(row => (
                  <Section.Item key={row.label}>
                    <Section.Content>
                      <Section.Label>{row.label}</Section.Label>
                      <Section.Description>{row.description}</Section.Description>
                    </Section.Content>
                    <Section.Actions>
                      <Button
                        color='neutral'
                        size='sm'
                        variant='outline'
                      >
                        Edit
                      </Button>
                    </Section.Actions>
                  </Section.Item>
                ))}
              </Section.Items>
            </Section.Row>
          </Section.Group>
        </Section.Root>
      ))}
    </div>
  );
}

function Surface({
  forceMountPages,
  stub,
  ...props
}: Partial<ProfileRootProps> & { forceMountPages?: boolean; stub?: boolean }) {
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
          <Profile.TabPanel
            key={item.id}
            value={item.id}
            shouldForceMount={forceMountPages}
          >
            {stub ? (
              <StubPage
                id={item.id}
                title={item.label}
              />
            ) : (
              <Placeholder title={item.label} />
            )}
          </Profile.TabPanel>
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

/**
 * A page transition, in CSS alone. Force-mounted pages stay in the document, `inert` while another
 * is selected, and carry the tabs primitive's transition attributes: `data-starting-style` on the
 * frame a page enters, `data-ending-style` while the one it replaces leaves. The pages are stacked
 * in one grid cell so the two cross-fade in place; a page that is neither open nor leaving is not
 * displayed. Under `prefers-reduced-motion: reduce` the swap is instant.
 */
export function Transitions() {
  return (
    <>
      <style>{`
        @scope {
          .cl-profile-content-body {
            display: grid;
          }
          .cl-profile-tab-panel {
            grid-area: 1 / 1;
            transition-property: opacity, scale, filter;
            transition-duration: var(--cl-duration-slow);
            transition-timing-function: var(--cl-ease-enter);
          }
          .cl-profile-tab-panel[data-ending-style] {
            transition-duration: var(--cl-duration-base);
            transition-timing-function: var(--cl-ease-exit);
          }
          .cl-profile-tab-panel[data-starting-style],
          .cl-profile-tab-panel[data-ending-style] {
            opacity: 0;
            scale: 0.98;
            filter: blur(4px);
          }
          .cl-profile-tab-panel:not([data-open]):not([data-ending-style]) {
            display: none;
          }
          @media (prefers-reduced-motion: reduce) {
            .cl-profile-tab-panel {
              transition: none;
            }
          }
        }
      `}</style>
      <Surface
        forceMountPages
        stub
      />
    </>
  );
}
