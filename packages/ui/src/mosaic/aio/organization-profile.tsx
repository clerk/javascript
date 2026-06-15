import type { HTMLAttributes } from 'react';

import { Box } from '../components/box';
import { Tabs } from '../components/tabs';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import type { RecipeVariantProps, SlotProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/**
 * One multi-slot recipe owns every navigation pattern of the Organization Profile AIO. The
 * `navigation` variant only re-styles the structural slots (`body`, `nav`, `content`)
 * — the React tree below picks which slots actually render. Because the
 * variant axis lives on the recipe, it also surfaces automatically as a knob and a
 * `<PropTable>` row in swingset.
 */
export const organizationProfileRecipe = defineSlotRecipe(theme => ({
  slots: {
    root: { slot: 'organization-profile' },
    header: { slot: 'organization-profile-header' },
    body: { slot: 'organization-profile-body' },
    nav: { slot: 'organization-profile-nav' },
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
    content: { minWidth: 0 },
  },
  variants: {
    navigation: {
      // Vertical nav rail beside the active panel.
      left: {
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
          borderBottom: 'none',
          flexShrink: 0,
          width: '12rem',
        },
        content: { flex: 1, paddingBlock: 0 },
      },
      // Horizontal tab strip above the active panel. (default)
      top: {
        body: { display: 'block' },
      },
      // No navigation chrome — every section is stacked in a single column.
      none: {
        body: { display: 'flex', flexDirection: 'column', gap: theme.spacing(8) },
      },
    },
  },
  defaultVariants: { navigation: 'top' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'organization-profile': true;
    'organization-profile-header': true;
    'organization-profile-body': true;
    'organization-profile-nav': true;
    'organization-profile-content': true;
  }
}

/**
 * The navigable sections of the Organization Profile. Declared once and consumed by
 * every navigation pattern so the available destinations stay identical regardless
 * of `navigation`.
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

type MosaicRenderProps = HTMLAttributes<HTMLElement> & Partial<SlotProps>;

function mergeClassName(...classNames: Array<string | undefined>) {
  const className = classNames.filter(Boolean).join(' ');
  return className || undefined;
}

/**
 * The full Organization Profile AIO — assembles all organization-related sections
 * into a single view.
 *
 * @param navigation - Where section navigation renders. `top` (default) renders a
 *   horizontal tab strip, `left` renders a vertical nav rail beside the content,
 *   and `none` stacks every section in one column with no navigation.
 * @param sx - Per-instance style overrides merged onto the root element.
 */
export function OrganizationProfile(props: OrganizationProfileProps) {
  const { navigation, sx } = props;
  const s = useRecipe(organizationProfileRecipe, { variants: { navigation }, sx });
  // Mirror the recipe default so the React tree branches on a concrete value.
  const activeNavigation = navigation ?? 'top';

  return (
    <div {...s.root}>
      <h1 {...s.header}>Organization Profile</h1>

      {activeNavigation === 'top' ? (
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
      ) : activeNavigation === 'left' ? (
        <div {...s.body}>
          <Tabs.Root
            defaultValue={SECTIONS[0].value}
            orientation='vertical'
          >
            <Tabs.List
              render={(listProps: MosaicRenderProps) => (
                <div
                  {...s.nav}
                  {...listProps}
                  className={mergeClassName(listProps.className, s.nav.className)}
                  css={[listProps.css, s.nav.css]}
                />
              )}
            >
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
                render={(panelProps: MosaicRenderProps) => (
                  <div
                    {...s.content}
                    {...panelProps}
                    className={mergeClassName(panelProps.className, s.content.className)}
                    css={[panelProps.css, s.content.css]}
                  />
                )}
              >
                {section.render()}
              </Tabs.Panel>
            ))}
          </Tabs.Root>
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
