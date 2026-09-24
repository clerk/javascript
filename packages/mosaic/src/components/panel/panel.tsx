import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { Heading, HeadingLevelProvider, useHeadingLevel } from '../heading';
import { Icon } from '../icon';
import { ContentPanelContext, ProfileContext } from '../profile/profile.context';
import { styles } from './panel.styles';

export type PanelRootProps = MosaicComponentProps<'div'>;
export type PanelTitleProps = MosaicComponentProps<'div'>;
export type PanelSectionsProps = MosaicComponentProps<'div'>;

const Root = React.forwardRef<HTMLDivElement, PanelRootProps>(function PanelRoot({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('panel'), stylex.props(reset.base, styles.root, xstyle), rest),
  });
});

/**
 * A page's headline. Inside a profile that has gone compact the headline IS the way to the other
 * pages: the heading holds a button — the title, and a caret beside it — that opens the navigation
 * sheet. Anywhere else — the wide layout, or a page rendered on its own — it is the heading alone.
 *
 * The caret sits `vertical-align: middle`, which CSS defines as the box's midpoint on the parent's
 * baseline plus half its x-height: optically centered on the lowercase letters rather than on the
 * line box. That needs an inline formatting context, so the button is `display: inline`.
 */
const Title = React.forwardRef<HTMLDivElement, PanelTitleProps>(function PanelTitle(
  { children, render, xstyle, ...rest },
  ref,
) {
  const profile = React.useContext(ProfileContext);
  const panel = React.useContext(ContentPanelContext);
  const registerPageTitle = profile?.registerPageTitle;
  const page = panel?.value;
  const level = useHeadingLevel();
  // The sheet's return-focus target. A no-op outside a profile's page, where there is no sheet.
  const registerTrigger = React.useCallback(
    (element: HTMLButtonElement | null) => {
      if (page !== undefined) {
        registerPageTitle?.(page, element);
      }
    },
    [registerPageTitle, page],
  );
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('panel-title'), stylex.props(reset.base, styles.title, xstyle), rest),
      children: (
        <Heading
          id={panel?.titleId}
          level={level}
          size='2xl'
        >
          {profile?.compact ? (
            <button
              ref={registerTrigger}
              type='button'
              aria-haspopup='dialog'
              aria-expanded={profile.navOpen}
              onClick={profile.openNav}
              {...mergeStyleProps(
                themeProps('profile-nav-trigger'),
                stylex.props(reset.base, styles.navTrigger, focusOutline.visible),
              )}
            >
              {children}
              <Icon
                name='chevron-down'
                size='inherit'
                {...mergeStyleProps(themeProps('profile-nav-trigger-caret'), stylex.props(styles.caret))}
              />
            </button>
          ) : (
            children
          )}
        </Heading>
      ),
    },
  });
});

const Sections = React.forwardRef<HTMLDivElement, PanelSectionsProps>(function PanelSections(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('panel-sections'), stylex.props(reset.base, styles.sections, xstyle), rest),
  });
  return <HeadingLevelProvider>{element}</HeadingLevelProvider>;
});

/**
 * A page of content, composed through `Panel.Root`, `Panel.Title`, and `Panel.Sections`. The
 * sections sit one heading level below the title. Every part accepts the Mosaic `render` prop and
 * forwards its ref.
 *
 * ```tsx
 * <Panel.Root>
 *   <Panel.Title>Account</Panel.Title>
 *   <Panel.Sections>
 *     <Section.Root>…</Section.Root>
 *   </Panel.Sections>
 * </Panel.Root>
 * ```
 */
export const Panel = { Root, Title, Sections };
