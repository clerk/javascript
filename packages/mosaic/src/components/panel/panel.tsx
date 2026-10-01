import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import { isKeyboardEvent } from '../../primitives/utils/interaction-modality';
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

// In a compact profile the heading holds a button that opens the navigation.
const Title = React.forwardRef<HTMLDivElement, PanelTitleProps>(function PanelTitle(
  { children, render, xstyle, ...rest },
  ref,
) {
  const profile = React.useContext(ProfileContext);
  const panel = React.useContext(ContentPanelContext);
  const registerPageTitle = profile?.registerPageTitle;
  const page = panel?.value;
  const level = useHeadingLevel();
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
              onClick={event =>
                profile.navOpen ? profile.closeNav() : profile.openNav(isKeyboardEvent(event.nativeEvent))
              }
              {...mergeStyleProps(
                themeProps('profile-nav-trigger'),
                stylex.props(reset.base, styles.navTrigger, focusOutline.visible),
              )}
            >
              {children}
              <Icon
                name='chevron-down'
                size='sm'
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
 * A page of content. `Panel.Sections` sit one heading level below `Panel.Title`.
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
