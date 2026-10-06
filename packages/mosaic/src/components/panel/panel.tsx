import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Heading, HeadingLevelProvider, useHeadingLevel } from '../heading';
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

// Inside a profile page, the profile renders the page title, and the ref reaches that instead.
const Title = React.forwardRef<HTMLDivElement, PanelTitleProps>(function PanelTitle(
  { children, render, xstyle, ...rest },
  ref,
) {
  const inProfilePage = React.useContext(ContentPanelContext);
  const profile = React.useContext(ProfileContext);
  const level = useHeadingLevel();
  const pageTitleRef = inProfilePage ? profile?.pageTitleRef : undefined;
  React.useImperativeHandle(pageTitleRef ? ref : null, () => pageTitleRef?.current as HTMLDivElement);
  return useRender({
    defaultTagName: 'div',
    render,
    ref: pageTitleRef ? null : ref,
    enabled: !inProfilePage,
    props: {
      ...mergeStyleProps(themeProps('panel-title'), stylex.props(reset.base, styles.title, xstyle), rest),
      children: (
        <Heading
          level={level}
          size='2xl'
        >
          {children}
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
