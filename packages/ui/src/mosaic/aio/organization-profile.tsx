import React from 'react';

import { Box } from '../components/box';
import { Tabs } from '../components/tabs';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/**
 * One multi-slot recipe owns every layout of the Organization Profile AIO. The
 * `layout` variant only re-styles the structural slots (`body`, `nav`, `navItem`,
 * `content`) — the React tree below picks which slots actually render. Because the
 * variant axis lives on the recipe, it also surfaces automatically as a knob and a
 * `<PropTable>` row in swingset.
 */
export const organizationProfileRecipe = defineSlotRecipe(theme => ({
  slots: {
    root: { slot: 'organization-profile' },
    header: { slot: 'organization-profile-header' },
    body: { slot: 'organization-profile-body' },
    nav: { slot: 'organization-profile-nav' },
    navItem: { slot: 'organization-profile-nav-item' },
    content: { slot: 'organization-profile-content' },
  },
  base: {
    root: { width: '100%' },
    header: {
      ...theme.text('lg'),
      fontWeight: theme.font.semibold,
      marginBlockEnd: theme.spacing(8),
    },
    body: {},
    nav: {},
    navItem: {},
    content: { minWidth: 0 },
  },
  variants: {
    layout: {
      // Vertical nav rail beside the active panel.
      sidebar: {
        body: {
          display: 'flex',
          flexDirection: 'row',
          gap: theme.spacing(8),
          alignItems: 'flex-start',
        },
        nav: {
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1),
          flexShrink: 0,
          width: '12rem',
        },
        navItem: {
          appearance: 'none',
          textAlign: 'start',
          background: 'transparent',
          border: 'none',
          borderRadius: theme.rounded.md,
          paddingInline: theme.spacing(3),
          paddingBlock: theme.spacing(2),
          ...theme.text('sm'),
          fontWeight: theme.font.medium,
          color: theme.color.mutedForeground,
          cursor: 'pointer',
          transition: 'background-color 150ms, color 150ms',
          _hover: { backgroundColor: theme.alpha('primary', 5) },
          '&[data-cl-selected]': {
            backgroundColor: theme.alpha('primary', 10),
            color: theme.color.primary,
          },
        },
        content: { flex: 1 },
      },
      // Horizontal tab strip above the active panel. (default)
      tabs: {
        body: { display: 'block' },
      },
      // No navigation chrome — every section is stacked in a single column.
      'no-nav': {
        body: { display: 'flex', flexDirection: 'column', gap: theme.spacing(8) },
      },
    },
  },
  defaultVariants: { layout: 'tabs' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'organization-profile': true;
    'organization-profile-header': true;
    'organization-profile-body': true;
    'organization-profile-nav': true;
    'organization-profile-nav-item': true;
    'organization-profile-content': true;
  }
}

/**
 * The navigable sections of the Organization Profile. Declared once and consumed by
 * every layout so the available destinations stay identical regardless of `layout`.
 */
const SECTIONS = [
  { value: 'general', label: 'General', render: () => <OrganizationProfileGeneral /> },
  { value: 'members', label: 'Members', render: () => <MembersPlaceholder /> },
] as const;

function MembersPlaceholder() {
  return (
    <Box
      render={p => <h2 {...p} />}
      sx={t => ({
        ...t.text('base'),
        fontWeight: t.font.medium,
        textAlign: 'center',
      })}
    >
      Members content
    </Box>
  );
}

export type OrganizationProfileProps = RecipeVariantProps<typeof organizationProfileRecipe>;

/**
 * The full Organization Profile AIO — assembles all organization-related sections
 * into a single view.
 *
 * @param layout - How the sections are navigated. `tabs` (default) renders a
 *   horizontal tab strip, `sidebar` renders a vertical nav rail beside the content,
 *   and `no-nav` stacks every section in one column with no navigation.
 * @param sx - Per-instance style overrides merged onto the root element.
 */
export function OrganizationProfile(props: OrganizationProfileProps) {
  const { layout, sx } = props;
  const s = useRecipe(organizationProfileRecipe, { variants: { layout }, sx });
  // Mirror the recipe default so the React tree branches on a concrete value.
  const activeLayout = layout ?? 'tabs';

  const [active, setActive] = React.useState<(typeof SECTIONS)[number]['value']>(SECTIONS[0].value);

  return (
    <div {...s.root}>
      <h1 {...s.header}>Organization Profile</h1>

      {activeLayout === 'tabs' ? (
        <div {...s.body}>
          <Tabs.Root defaultValue={SECTIONS[0].value}>
            <Tabs.List>
              {SECTIONS.map(section => (
                <Tabs.Tab
                  key={section.value}
                  value={section.value}
                >
                  {section.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {SECTIONS.map(section => (
              <Tabs.Panel
                key={section.value}
                value={section.value}
              >
                {section.render()}
              </Tabs.Panel>
            ))}
          </Tabs.Root>
        </div>
      ) : activeLayout === 'sidebar' ? (
        <div {...s.body}>
          <nav {...s.nav}>
            {SECTIONS.map(section => (
              <button
                key={section.value}
                type='button'
                onClick={() => setActive(section.value)}
                {...s.navItem}
                {...(active === section.value ? { 'data-cl-selected': '' } : {})}
                aria-current={active === section.value ? 'page' : undefined}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <div {...s.content}>{SECTIONS.find(section => section.value === active)?.render()}</div>
        </div>
      ) : (
        <div {...s.body}>
          {SECTIONS.map(section => (
            <div
              key={section.value}
              {...s.content}
            >
              {section.render()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
