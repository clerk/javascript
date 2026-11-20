'use client';

import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ArrowLeft } from '../../icons/glyphs/arrow-left';
import { useFlowAutoFocus, useFlowStepActive } from '../../primitives/flow/flow-step-context';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { rtl } from '../../styles/rtl.styles';
import { Heading, HeadingLevelProvider, useHeadingLevel } from '../heading';
import { Icon } from '../icon';
import { ContentPanelContext, ProfileContext } from '../profile/profile.context';
import { VisuallyHidden } from '../visually-hidden';
import { styles } from './panel.styles';

export type PanelRootProps = MosaicComponentProps<'div'>;
export interface PanelTitleProps extends MosaicComponentProps<'div'> {
  /** Makes the whole title a button that goes back, for a page opened from another one. `label` is the hidden word read before the title, such as "Back". */
  back?: { label: string; onClick: () => void };
}
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

// Inside a profile page, the title takes the page title's id, ref and compact menu trigger, but only
// while its page is open and its flow step is not leaving, so one title at a time owns them.
const Title = React.forwardRef<HTMLDivElement, PanelTitleProps>(function PanelTitle(
  { children, back, render, xstyle, ...rest },
  ref,
) {
  const page = React.useContext(ContentPanelContext);
  const profile = React.useContext(ProfileContext);
  const stepActive = useFlowStepActive();
  const panelTitleRef = React.useContext(PanelTitleContext);
  const backFocusRef = useFlowAutoFocus<HTMLButtonElement>();
  const level = useHeadingLevel();
  const claimed = page?.active === true && stepActive ? profile : null;
  const titleRef = useMergeRefs([ref, panelTitleRef]);
  const pageTitleRef = back ? undefined : claimed?.pageTitleRef;
  // eslint-disable-next-line typescript/consistent-type-assertions -- The title ref is present when the imperative handle is attached.
  React.useImperativeHandle(pageTitleRef ? titleRef : null, () => pageTitleRef?.current as HTMLDivElement);
  const pageId = claimed?.pageTitleId;
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, panelTitleRef],
    enabled: !page || back !== undefined,
    props: {
      ...mergeStyleProps(themeProps('panel-title'), stylex.props(reset.base, styles.title, xstyle), {
        tabIndex: -1,
        ...rest,
      }),
      children: (
        <Heading
          ref={back ? claimed?.pageTitleRef : undefined}
          id={pageId}
          level={level}
          size='2xl'
        >
          {back ? (
            <button
              ref={backFocusRef}
              type='button'
              onClick={back.onClick}
              {...mergeStyleProps(
                themeProps('panel-title-back'),
                stylex.props(reset.base, styles.back, focusOutline.visible),
              )}
            >
              <Icon
                glyph={ArrowLeft}
                xstyle={[rtl.mirror, styles.backIcon]}
              />
              <VisuallyHidden>{back.label}</VisuallyHidden>{' '}
              <span id={pageId ? `${pageId}-label` : undefined}>{children}</span>
            </button>
          ) : (
            children
          )}
        </Heading>
      ),
    },
  });
  return page && !back ? page.renderTitle(children, claimed !== null) : element;
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

export { Root as PanelRoot, Title as PanelTitle, Sections as PanelSections };
