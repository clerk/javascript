'use client';

import { logger } from '@clerk/shared/logger';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ArrowLeft } from '../../icons/glyphs/arrow-left';
import { ChevronDown } from '../../icons/glyphs/chevron-down';
import { fill, useMessages } from '../../localization';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import { Select as SelectPrimitive } from '../../primitives/select';
import type { TabsProps } from '../../primitives/tabs';
import { Tabs } from '../../primitives/tabs';
import { useRender } from '../../primitives/utils';
import { autoUpdate, getDimensions } from '../../primitives/utils/dom';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { rtl } from '../../styles/rtl.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { BadgeContext } from '../badge/badge.context';
import { Branding } from '../branding';
import { Button } from '../button';
import type { DialogContextValue } from '../dialog';
import { Dialog } from '../dialog';
import { DialogContext, isInDialog } from '../dialog/dialog';
import { Drawer } from '../drawer';
import { Flow } from '../flow';
import { Heading, HeadingLevelProvider, useHeadingLevel } from '../heading';
import { Icon } from '../icon';
import { SelectPopup } from '../select/select';
import { VisuallyHidden } from '../visually-hidden';
import type { ProfileContextValue, ProfileDismiss, ProfileNavLayout } from './profile.context';
import { ContentPanelContext, ProfileContext, SubPagesContext } from './profile.context';
import { contentScroll, contentViewportScroll, styles } from './profile.styles';

// The sentinel's width (1/2/3px) carries the CSS breakpoints into JS; unmeasured is wide.
function navLayoutFor(sentinelWidth: number): ProfileNavLayout {
  if (sentinelWidth >= 3) {
    return 'sheet';
  }
  return sentinelWidth >= 2 ? 'select' : 'column';
}

function dismissOf(dialog: DialogContextValue | null, backInNav: boolean): ProfileDismiss {
  if (!isInDialog(dialog) || !dialog.showCloseButton) {
    return 'none';
  }
  return backInNav ? 'back' : 'corner';
}

function useProfileContext(part: string): ProfileContextValue {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error(`${part} must be rendered inside Profile.Root`);
  }
  return context;
}

export type ProfileElevation = 'card' | 'flush';

export interface ProfileRootProps extends Omit<MosaicComponentProps<'div'>, 'children'> {
  value: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsProps['orientation'];
  activationMode?: TabsProps['activationMode'];
  renderBranding?: boolean;
  elevation?: ProfileElevation;
  children: React.ReactNode;
}

const Root = React.forwardRef<HTMLDivElement, ProfileRootProps>(function ProfileRoot(
  {
    value,
    onValueChange,
    orientation = 'vertical',
    activationMode,
    renderBranding = true,
    elevation = 'card',
    children,
    render,
    xstyle,
    ...rest
  },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const inline = elevation === 'flush' && !isInDialog(dialog);
  const fullscreen = dialog?.variant === 'fullscreen';
  const generatedTitleId = React.useId();
  const titleId = dialog?.labelId ?? generatedTitleId;
  const [sentinel, setSentinel] = React.useState<HTMLSpanElement | null>(null);
  const [navLayout, setNavLayout] = React.useState<ProfileNavLayout>('column');
  useSafeLayoutEffect(() => {
    if (!sentinel) {
      return;
    }
    return autoUpdate(sentinel, () => setNavLayout(navLayoutFor(getDimensions(sentinel).width)));
  }, [sentinel]);
  const compact = navLayout !== 'column';
  const dismiss = dismissOf(dialog, fullscreen && !compact);
  const pageTitleId = React.useId();
  const pageTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const navTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [navItems, setNavItems] = React.useState<React.ReactNode>(null);
  // Scoped to a layout so the replacement sheet never mounts open.
  const [navOpenIn, setNavOpenIn] = React.useState<ProfileNavLayout | null>(null);
  const navOpen = navOpenIn === navLayout;
  const openNav = React.useCallback(() => setNavOpenIn(navLayout), [navLayout]);
  const closeNav = React.useCallback(() => setNavOpenIn(null), []);
  React.useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Reset navigation when the active profile panel changes.
    setNavOpenIn(null);
  }, [navLayout]);
  const pickedPage = React.useRef<string | null>(null);
  const selectPage = React.useCallback(
    (next: string) => {
      pickedPage.current = next;
      onValueChange?.(next);
      closeNav();
    },
    [onValueChange, closeNav],
  );
  React.useEffect(() => {
    const trigger = navTriggerRef.current;
    const picked = pickedPage.current === value;
    pickedPage.current = null;
    const focusLost = trigger?.ownerDocument.activeElement === trigger?.ownerDocument.body;
    if (picked && focusLost) {
      trigger?.focus();
    }
  }, [value]);
  const context = React.useMemo(
    () => ({
      titleId,
      renderBranding,
      compact,
      navLayout,
      navOpen,
      openNav,
      closeNav,
      value,
      selectPage,
      navItems,
      setNavItems,
      pageTitleId,
      pageTitleRef,
      navTriggerRef,
      inline,
      dismiss,
    }),
    [
      titleId,
      renderBranding,
      compact,
      navLayout,
      navOpen,
      openNav,
      closeNav,
      value,
      selectPage,
      navItems,
      pageTitleId,
      inline,
      dismiss,
    ],
  );
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile', { elevation: inline ? 'flush' : 'card' }),
        stylex.props(
          reset.base,
          styles.root,
          isInDialog(dialog) && styles.rootInDialog,
          fullscreen && styles.rootFullscreen,
          xstyle,
        ),
        rest,
      ),
      children: (
        <>
          <span
            aria-hidden
            ref={setSentinel}
            {...mergeStyleProps(themeProps('profile-sentinel'), stylex.props(reset.base, styles.sentinel))}
          />
          {/* First in the DOM so it takes the dialog's opening focus, as in `Card.Header`. */}
          {dismiss === 'corner' ? <Dialog.CloseButton /> : null}
          <div
            {...mergeStyleProps(
              themeProps('profile-layout'),
              stylex.props(
                reset.base,
                styles.layout,
                inline && styles.layoutInline,
                dialog !== null && !inline && styles.layoutInDialog,
                fullscreen && styles.layoutFullscreen,
              ),
            )}
          >
            {children}
          </div>
        </>
      ),
    },
  });

  return (
    <ProfileContext.Provider value={context}>
      <Tabs.Root
        value={value}
        onValueChange={selectPage}
        orientation={orientation}
        // Arrowing through the sheet's list must not switch the page behind it.
        activationMode={navLayout === 'sheet' ? 'manual' : activationMode}
      >
        {element}
      </Tabs.Root>
    </ProfileContext.Provider>
  );
});

export type ProfileTitleProps = MosaicComponentProps<'h2'>;

const Title = React.forwardRef<HTMLHeadingElement, ProfileTitleProps>(function ProfileTitle(
  { render, xstyle, ...rest },
  ref,
) {
  const { titleId } = useProfileContext('Profile.Title');
  const Tag = `h${useHeadingLevel()}` as const;
  return (
    <VisuallyHidden
      ref={ref}
      render={render ?? <Tag />}
      {...mergeStyleProps(themeProps('profile-title'), stylex.props(xstyle), rest)}
      id={titleId}
    />
  );
});

export type ProfileNavProps = MosaicComponentProps<'nav'>;

type NavItemMode = 'tab' | 'option';

// `Profile.Nav` children render again as the select's options.
const NavItemModeContext = React.createContext<NavItemMode>('tab');

const NavGroupLabelContext = React.createContext<string | undefined>(undefined);

function BackButton() {
  const m = useMessages('profile');
  return (
    <Dialog.Close
      {...mergeStyleProps(
        themeProps('profile-back-button'),
        stylex.props(reset.base, styles.navItem, focusOutline.visible, styles.backItem),
      )}
    >
      <span
        aria-hidden
        {...mergeStyleProps(themeProps('profile-back-button-icon'), stylex.props(reset.base, styles.navItemIcon))}
      >
        <Icon
          glyph={ArrowLeft}
          xstyle={rtl.mirror}
        />
      </span>
      <span {...mergeStyleProps(themeProps('profile-back-button-label'), stylex.props(styles.navItemLabel))}>
        {m.backToApp}
      </span>
    </Dialog.Close>
  );
}

function NavBranding() {
  return (
    <div {...mergeStyleProps(themeProps('profile-branding'), stylex.props(reset.base, styles.branding))}>
      <Branding />
    </div>
  );
}

/**
 * Children are `Profile.NavItem`s, or `Profile.NavGroup`s of them. Wide, they render as a tablist; compact, as the options of
 * the page title's select, or a tablist in a sheet on a phone.
 */
const Nav = React.forwardRef<HTMLElement, ProfileNavProps>(function ProfileNav(
  { children, render, xstyle, ...rest },
  ref,
) {
  const {
    titleId,
    renderBranding,
    compact,
    navLayout,
    navOpen,
    closeNav,
    setNavItems,
    navTriggerRef,
    inline,
    dismiss,
  } = useProfileContext('Profile.Nav');
  useSafeLayoutEffect(() => {
    setNavItems(children);
  }, [children, setNavItems]);
  useSafeLayoutEffect(() => () => setNavItems(null), [setNavItems]);
  const element = useRender({
    defaultTagName: 'nav',
    render,
    ref,
    props: {
      'aria-labelledby': titleId,
      ...mergeStyleProps(
        themeProps('profile-nav', { compact }),
        stylex.props(reset.base, styles.nav, (inline || compact) && styles.navFlush, xstyle),
        rest,
      ),
      children: (
        <>
          {dismiss === 'back' ? <BackButton /> : null}
          <Tabs.List {...mergeStyleProps(themeProps('profile-nav-list'), stylex.props(reset.base, styles.navList))}>
            {children}
          </Tabs.List>
          {renderBranding && !compact && !inline ? <NavBranding /> : null}
        </>
      ),
    },
  });

  if (navLayout === 'column') {
    return element;
  }
  if (navLayout === 'select') {
    return null;
  }
  return (
    <Drawer.Root
      open={navOpen}
      onOpenChange={open => {
        if (!open) {
          closeNav();
        }
      }}
    >
      <Drawer.Popup
        aria-labelledby={titleId}
        // The sheet has no trigger of its own to return focus to.
        finalFocus={navTriggerRef}
        xstyle={styles.navSheet}
      >
        {element}
      </Drawer.Popup>
    </Drawer.Root>
  );
});

export interface ProfileNavGroupProps extends MosaicComponentProps<'div'> {
  /** Names the group above its items. */
  label: React.ReactNode;
}

/**
 * A labelled run of `Profile.NavItem`s. As tabs, the label describes each item; as options, it names
 * a listbox group.
 */
const NavGroup = React.forwardRef<HTMLDivElement, ProfileNavGroupProps>(function ProfileNavGroup(
  { label, children, xstyle, ...rest },
  ref,
) {
  const mode = React.useContext(NavItemModeContext);
  const groupProps = mergeStyleProps(
    themeProps('profile-nav-group'),
    stylex.props(reset.base, styles.navGroup, xstyle),
    rest,
  );
  const labelProps = mergeStyleProps(
    themeProps('profile-nav-group-label'),
    stylex.props(reset.base, styles.navGroupLabel),
  );
  if (mode === 'option') {
    return (
      <SelectPrimitive.Group
        ref={ref}
        {...groupProps}
      >
        <SelectPrimitive.GroupLabel {...labelProps}>{label}</SelectPrimitive.GroupLabel>
        {children}
      </SelectPrimitive.Group>
    );
  }
  return (
    <TabsNavGroup
      ref={ref}
      label={label}
      labelProps={labelProps}
      {...groupProps}
    >
      {children}
    </TabsNavGroup>
  );
});

interface TabsNavGroupProps extends Omit<ProfileNavGroupProps, 'xstyle'> {
  labelProps: React.ComponentProps<'div'>;
}

const TabsNavGroup = React.forwardRef<HTMLDivElement, TabsNavGroupProps>(function TabsNavGroup(
  { label, labelProps, children, render, ...rest },
  ref,
) {
  const labelId = React.useId();
  return (
    <NavGroupLabelContext.Provider value={labelId}>
      {useRender({
        defaultTagName: 'div',
        render,
        ref,
        props: {
          ...rest,
          children: (
            <>
              <div
                id={labelId}
                aria-hidden
                {...labelProps}
              >
                {label}
              </div>
              {children}
            </>
          ),
        },
      })}
    </NavGroupLabelContext.Provider>
  );
});

export interface ProfileNavItemProps extends MosaicComponentProps<'button'> {
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

const navItemBadgeDefaults = { color: 'neutral' } as const;

const NavItem = React.forwardRef<HTMLButtonElement, ProfileNavItemProps>(function ProfileNavItem(
  { value, icon, badge, disabled, children, render, xstyle, onClick, ...rest },
  ref,
) {
  const { compact, closeNav } = useProfileContext('Profile.NavItem');
  const mode = React.useContext(NavItemModeContext);
  const groupLabelId = React.useContext(NavGroupLabelContext);
  const styleProps = mergeStyleProps(
    themeProps('profile-nav-item'),
    stylex.props(reset.base, styles.navItem, focusOutline.visible, mode === 'option' && styles.navItemOption, xstyle),
    rest,
  );
  const content = (
    <>
      {icon ? (
        <span
          aria-hidden
          {...mergeStyleProps(themeProps('profile-nav-item-icon'), stylex.props(reset.base, styles.navItemIcon))}
        >
          {icon}
        </span>
      ) : null}
      <span
        {...mergeStyleProps(
          themeProps('profile-nav-item-label'),
          stylex.props(truncationStyles.singleLine, styles.navItemLabel),
        )}
      >
        {children}
      </span>
      {badge != null ? (
        <span {...mergeStyleProps(themeProps('profile-nav-item-badge'), stylex.props(reset.base, styles.navItemBadge))}>
          <BadgeContext.Provider value={navItemBadgeDefaults}>{badge}</BadgeContext.Provider>
        </span>
      ) : null}
    </>
  );
  if (mode === 'option') {
    return (
      <SelectPrimitive.Option
        value={value}
        label={typeof children === 'string' ? children : undefined}
        disabled={disabled}
        render={render}
        // An explicit `undefined` would replace the option's own click handler.
        {...(onClick ? { onClick } : null)}
        {...styleProps}
      >
        {content}
      </SelectPrimitive.Option>
    );
  }
  return (
    <Tabs.Tab
      ref={ref}
      value={value}
      disabled={disabled}
      aria-describedby={groupLabelId}
      render={render}
      onClick={event => {
        onClick?.(event);
        if (compact && !event.defaultPrevented && !disabled) {
          closeNav();
        }
      }}
      {...styleProps}
    >
      {content}
    </Tabs.Tab>
  );
});

function PageTitle({ title, claim }: { title: React.ReactNode; claim: boolean }) {
  const {
    navLayout,
    navOpen,
    openNav,
    closeNav,
    value,
    selectPage,
    navItems,
    pageTitleId,
    pageTitleRef,
    navTriggerRef,
  } = useProfileContext('Profile.Content');
  const level = useHeadingLevel();
  const focusRef = useFlowAutoFocus<HTMLHeadingElement>();
  const headingRef = useMergeRefs([claim ? pageTitleRef : undefined, focusRef]);
  const label = <span id={claim ? `${pageTitleId}-label` : undefined}>{title}</span>;
  const triggerProps = mergeStyleProps(
    themeProps('profile-nav-trigger'),
    stylex.props(reset.base, styles.navTrigger, focusOutline.visible),
  );
  const triggerContent = (
    <>
      {label}
      <Icon
        glyph={ChevronDown}
        {...mergeStyleProps(themeProps('profile-nav-trigger-caret'), stylex.props(styles.caret))}
      />
    </>
  );
  const heading = (children: React.ReactNode) => (
    <Heading
      ref={headingRef}
      id={claim ? pageTitleId : undefined}
      level={level}
      size='2xl'
      tabIndex={-1}
      {...themeProps('profile-page-title')}
    >
      {children}
    </Heading>
  );

  if (navLayout === 'column') {
    return heading(label);
  }
  if (navLayout === 'sheet') {
    return heading(
      <button
        ref={claim ? navTriggerRef : undefined}
        type='button'
        aria-haspopup='dialog'
        aria-expanded={navOpen}
        onClick={() => (navOpen ? closeNav() : openNav())}
        {...triggerProps}
      >
        {triggerContent}
      </button>,
    );
  }
  return (
    // A page title is not a form field: the list drops below it rather than covering it.
    <SelectPrimitive.Root
      value={value}
      onValueChange={selectPage}
      alignItemWithTrigger={false}
    >
      {heading(
        <SelectPrimitive.Trigger
          ref={claim ? navTriggerRef : undefined}
          // A combobox takes no name from its content.
          aria-labelledby={`${pageTitleId}-label`}
          {...triggerProps}
        >
          {triggerContent}
        </SelectPrimitive.Trigger>,
      )}
      <SelectPopup xstyle={styles.navPopup}>
        <NavItemModeContext.Provider value='option'>{navItems}</NavItemModeContext.Provider>
      </SelectPopup>
    </SelectPrimitive.Root>
  );
}

export type ProfileContentProps = MosaicComponentProps<'div'>;

// A plain `div`, not `main`: the profile often renders inside the host's `main` or a dialog.
const Content = React.forwardRef<HTMLDivElement, ProfileContentProps>(function ProfileContent(
  { children, render, xstyle, ...rest },
  ref,
) {
  const { inline, compact, renderBranding } = useProfileContext('Profile.Content');
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-content', { inline }),
        stylex.props(reset.base, styles.content, inline ? styles.contentInline : contentScroll, xstyle),
        rest,
      ),
      children: (
        <div
          {...mergeStyleProps(
            themeProps('profile-content-viewport'),
            stylex.props(
              reset.base,
              styles.contentViewport,
              ...(inline ? [styles.contentViewportInline] : contentViewportScroll),
            ),
          )}
        >
          <div {...mergeStyleProps(themeProps('profile-content-body'), stylex.props(reset.base, styles.contentBody))}>
            {children}
            {inline && renderBranding && !compact ? (
              <div
                {...mergeStyleProps(
                  themeProps('profile-branding'),
                  stylex.props(reset.base, styles.branding, styles.contentBranding),
                )}
              >
                <Branding />
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
  });
});

interface ProfileContentPanelSubPagesProps {
  /** The page's name, shown on the back button of each of its sub-pages. */
  label: string;
  /** The open sub-page, or `null` for the page itself. Matches a `Profile.SubPage` value. */
  subPage: string | null;
  /** Called with the sub-page to open, or `null` to go back to the page. */
  onSubPageChange: (subPage: string | null) => void;
}

interface ProfileContentPanelNoSubPagesProps {
  label?: never;
  subPage?: never;
  onSubPageChange?: never;
}

export type ProfileContentPanelProps = MosaicComponentProps<'div'> & {
  value: string;
} & (ProfileContentPanelSubPagesProps | ProfileContentPanelNoSubPagesProps);

const ContentPanel = React.forwardRef<HTMLDivElement, ProfileContentPanelProps>(function ProfileContentPanel(
  { value, label, subPage, onSubPageChange, children, xstyle, ...rest },
  ref,
) {
  const { compact, pageTitleId, pageTitleRef, value: selected } = useProfileContext('Profile.ContentPanel');
  const active = value === selected;
  useMissingTitleWarning(active, value, subPage, pageTitleRef);
  const page = React.useMemo(
    () => ({
      active,
      renderTitle: (title: React.ReactNode, claim: boolean) => (
        <PageTitle
          title={title}
          claim={claim}
        />
      ),
    }),
    [active],
  );
  const subPages = React.useMemo(
    () =>
      label !== undefined && subPage !== undefined && onSubPageChange !== undefined
        ? { label, subPage, onSubPageChange }
        : null,
    [label, subPage, onSubPageChange],
  );
  return (
    <ContentPanelContext.Provider value={page}>
      <HeadingLevelProvider>
        <Tabs.Panel
          ref={ref}
          value={value}
          aria-labelledby={`${pageTitleId}-label`}
          // Compact, no tablist is showing, so the page is a plain group rather than an orphan tabpanel.
          {...(compact ? { role: 'group', tabIndex: undefined } : null)}
          {...mergeStyleProps(themeProps('profile-content-panel', { value }), stylex.props(xstyle), rest)}
        >
          {subPages ? (
            <SubPagesContext.Provider value={subPages}>
              <Flow.Root
                value={subPages.subPage ?? PAGE}
                direction={subPages.subPage === null ? -1 : 1}
                state={null}
              >
                {() => children}
              </Flow.Root>
            </SubPagesContext.Provider>
          ) : (
            children
          )}
        </Tabs.Panel>
      </HeadingLevelProvider>
    </ContentPanelContext.Provider>
  );
});

const PAGE = '';

export interface ProfileSubPageProps {
  /** The sub-page it shows for, or `null` for the page itself. Matches the `Profile.ContentPanel` `subPage`. */
  value: string | null;
  children?: React.ReactNode;
}

/**
 * One view of a `Profile.ContentPanel` with sub-pages, shown while its `value` is the open `subPage`.
 * A sub-page's `Panel.Title` gets a back button to the page above it, and never opens the
 * navigation on compact layouts.
 */
function SubPage({ value, children }: ProfileSubPageProps) {
  const subPages = React.useContext(SubPagesContext);
  const page = React.useContext(ContentPanelContext);
  if (!subPages || !page) {
    throw new Error('Profile.SubPage must be rendered inside a Profile.ContentPanel with subPage');
  }
  const { label, onSubPageChange } = subPages;
  const { active } = page;
  const subPage = React.useMemo(
    () => ({
      active,
      renderTitle: (title: React.ReactNode, claim: boolean) => (
        <SubPageTitle
          title={title}
          claim={claim}
          parent={label}
          onBack={() => onSubPageChange(null)}
        />
      ),
    }),
    [active, label, onSubPageChange],
  );
  return (
    <Flow.Step ids={[value ?? PAGE]}>
      {value === null ? (
        children
      ) : (
        <ContentPanelContext.Provider value={subPage}>{children}</ContentPanelContext.Provider>
      )}
    </Flow.Step>
  );
}

function SubPageTitle({
  title,
  claim,
  parent,
  onBack,
}: {
  title: React.ReactNode;
  claim: boolean;
  parent: string;
  onBack: () => void;
}) {
  const { pageTitleId, pageTitleRef } = useProfileContext('Profile.SubPage');
  const m = useMessages('profile');
  const level = useHeadingLevel();
  const focusRef = useFlowAutoFocus<HTMLHeadingElement>();
  const headingRef = useMergeRefs([claim ? pageTitleRef : undefined, focusRef]);
  return (
    <div {...mergeStyleProps(themeProps('profile-sub-page-title'), stylex.props(reset.base, styles.subPageTitle))}>
      <Button
        color='neutral'
        variant='ghost'
        size='sm'
        onClick={onBack}
        aria-label={fill(m.backTo, { page: parent })}
        xstyle={styles.subPageBack}
        {...themeProps('profile-sub-page-back')}
      >
        <Icon
          glyph={ArrowLeft}
          xstyle={rtl.mirror}
        />
        {parent}
      </Button>
      <Heading
        ref={headingRef}
        id={claim ? pageTitleId : undefined}
        level={level}
        size='2xl'
        tabIndex={-1}
        {...themeProps('profile-page-title')}
      >
        <span id={claim ? `${pageTitleId}-label` : undefined}>{title}</span>
      </Heading>
    </div>
  );
}

export {
  Root as ProfileRoot,
  Title as ProfileTitle,
  Nav as ProfileNav,
  NavGroup as ProfileNavGroup,
  NavItem as ProfileNavItem,
  Content as ProfileContent,
  ContentPanel as ProfileContentPanel,
  SubPage as ProfileSubPage,
};

/**
 * Warns when the open page has no `Panel.Title`, which leaves the page unnamed and, on compact
 * layouts, without the trigger that opens the navigation.
 */
function useMissingTitleWarning(
  active: boolean,
  value: string,
  subPage: string | null | undefined,
  pageTitleRef: React.RefObject<HTMLHeadingElement | null>,
) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !active || pageTitleRef.current) {
      return;
    }
    if (typeof subPage === 'string') {
      logger.warnOnce(
        `[Clerk] <Profile.ContentPanel value="${value}" subPage="${subPage}"> is open without a <Panel.Title>. Render a <Profile.SubPage value="${subPage}">, and start it with a <Panel.Title>.`,
      );
      return;
    }
    logger.warnOnce(
      `[Clerk] <Profile.ContentPanel value="${value}"> is open without a <Panel.Title>. Start the page with one: it names the page, and on compact layouts it opens the navigation.`,
    );
  }, [active, value, subPage, pageTitleRef]);
}
