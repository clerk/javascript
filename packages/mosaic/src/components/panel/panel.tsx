import { useMergeRefs } from '@floating-ui/react';
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

const PanelTitleContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function usePanelTitle(): () => HTMLDivElement | null {
  const titleRef = React.useContext(PanelTitleContext);
  return () => titleRef?.current ?? null;
}

const Root = React.forwardRef<HTMLDivElement, PanelRootProps>(function PanelRoot({ render, xstyle, ...rest }, ref) {
  const titleRef = React.useRef<HTMLDivElement>(null);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('panel'), stylex.props(reset.base, styles.root, xstyle), rest),
  });
  return <PanelTitleContext.Provider value={titleRef}>{element}</PanelTitleContext.Provider>;
});

// Inside a profile page, the profile renders the page title, and the ref reaches that instead.
const Title = React.forwardRef<HTMLDivElement, PanelTitleProps>(function PanelTitle(
  { children, render, xstyle, ...rest },
  ref,
) {
  const inProfilePage = React.useContext(ContentPanelContext);
  const profile = React.useContext(ProfileContext);
  const panelTitleRef = React.useContext(PanelTitleContext);
  const titleRef = useMergeRefs([ref, panelTitleRef]);
  const level = useHeadingLevel();
  const pageTitleRef = inProfilePage ? profile?.pageTitleRef : undefined;
  React.useImperativeHandle(pageTitleRef ? titleRef : null, () => pageTitleRef?.current as HTMLDivElement);
  return useRender({
    defaultTagName: 'div',
    render,
    ref: pageTitleRef ? null : titleRef,
    enabled: !inProfilePage,
    props: {
      ...mergeStyleProps(themeProps('panel-title'), stylex.props(reset.base, styles.title, xstyle), {
        tabIndex: -1,
        ...rest,
      }),
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
