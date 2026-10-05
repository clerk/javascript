import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Select as SelectPrimitive } from '../../primitives/select';
import type { TabsProps } from '../../primitives/tabs';
import { Tabs } from '../../primitives/tabs';
import { useRender } from '../../primitives/utils';
import { autoUpdate, getDimensions } from '../../primitives/utils/dom';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { BadgeContext } from '../badge/badge.context';
import { Branding } from '../branding';
import { Dialog, DialogContext, isInDialog } from '../dialog';
import { Drawer } from '../drawer';
import { Heading, HeadingLevelProvider, useHeadingLevel } from '../heading';
import { Icon } from '../icon';
import { SelectPopup } from '../select';
import { VisuallyHidden } from '../visually-hidden';
import type { ProfileContextValue, ProfileNavLayout } from './profile.context';
import { ContentPanelContext, ProfileContext } from './profile.context';
import { contentScroll, contentViewportScroll, styles } from './profile.styles';

// The sentinel's width (1/2/3px) carries the CSS breakpoints into JS; unmeasured is wide.
function navLayoutFor(sentinelWidth: number): ProfileNavLayout {
  if (sentinelWidth >= 3) {
    return 'sheet';
  }
  return sentinelWidth >= 2 ? 'select' : 'column';
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
  const inline = elevation === 'flush';
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
    setNavOpenIn(null);
  }, [navLayout]);
  const selectPage = React.useCallback(
    (next: string) => {
      onValueChange?.(next);
      closeNav();
    },
    [onValueChange, closeNav],
  );
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
    ],
  );
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile', { elevation: inline ? 'flush' : 'card' }),
        stylex.props(reset.base, styles.root, isInDialog(dialog) && styles.rootInDialog, xstyle),
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
          {isInDialog(dialog) && dialog.role !== 'alertdialog' ? <Dialog.CloseButton /> : null}
          <div
            {...mergeStyleProps(
              themeProps('profile-layout'),
              stylex.props(
                reset.base,
                styles.layout,
                inline && styles.layoutInline,
                dialog !== null && !inline && styles.layoutInDialog,
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
      ref={ref as React.Ref<HTMLSpanElement>}
      render={render ?? <Tag />}
      {...mergeStyleProps(themeProps('profile-title'), stylex.props(xstyle), rest)}
      id={titleId}
    />
  );
});

export type ProfileNavProps = MosaicComponentProps<'nav'>;

type NavItemMode = 'tab' | 'option' | 'label';

// `Profile.Nav` children render again as the page title's label and as the select's options.
const NavItemModeContext = React.createContext<NavItemMode>('tab');

function NavBranding() {
  return (
    <div {...mergeStyleProps(themeProps('profile-branding'), stylex.props(reset.base, styles.branding))}>
      <Branding />
    </div>
  );
}

/**
 * Children are `Profile.NavItem`s only. Wide, they render as a tablist; compact, as the options of
 * the page title's select, or a tablist in a sheet on a phone.
 */
const Nav = React.forwardRef<HTMLElement, ProfileNavProps>(function ProfileNav(
  { children, render, xstyle, ...rest },
  ref,
) {
  const { titleId, renderBranding, compact, navLayout, navOpen, closeNav, setNavItems, navTriggerRef, inline } =
    useProfileContext('Profile.Nav');
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
  const { compact, closeNav, value: selected } = useProfileContext('Profile.NavItem');
  const mode = React.useContext(NavItemModeContext);
  if (mode === 'label') {
    return value === selected ? children : null;
  }
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

function PageTitle() {
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
  const label = (
    <span id={`${pageTitleId}-label`}>
      <NavItemModeContext.Provider value='label'>{navItems}</NavItemModeContext.Provider>
    </span>
  );
  const triggerProps = mergeStyleProps(
    themeProps('profile-nav-trigger'),
    stylex.props(reset.base, styles.navTrigger, focusOutline.visible),
  );
  const triggerContent = (
    <>
      {label}
      <Icon
        name='chevron-down'
        size='sm'
        {...mergeStyleProps(themeProps('profile-nav-trigger-caret'), stylex.props(styles.caret))}
      />
    </>
  );
  const heading = (children: React.ReactNode) => (
    <Heading
      ref={pageTitleRef}
      id={pageTitleId}
      level={level}
      size='2xl'
      tabIndex={-1}
      xstyle={styles.pageTitle}
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
        ref={navTriggerRef}
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
            <HeadingLevelProvider>
              <PageTitle />
            </HeadingLevelProvider>
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

export interface ProfileContentPanelProps extends MosaicComponentProps<'div'> {
  value: string;
  /** Keeps unselected pages mounted (`inert`, in flow) so a page transition can be styled. */
  shouldForceMount?: boolean;
}

const ContentPanel = React.forwardRef<HTMLDivElement, ProfileContentPanelProps>(function ProfileContentPanel(
  { value, shouldForceMount, xstyle, ...rest },
  ref,
) {
  const { compact, pageTitleId } = useProfileContext('Profile.ContentPanel');
  return (
    <ContentPanelContext.Provider value>
      <HeadingLevelProvider>
        <Tabs.Panel
          ref={ref}
          value={value}
          shouldForceMount={shouldForceMount}
          aria-labelledby={`${pageTitleId}-label`}
          // Compact, no tablist is showing, so the page is a plain group rather than an orphan tabpanel.
          {...(compact ? { role: 'group', tabIndex: undefined } : null)}
          {...mergeStyleProps(themeProps('profile-content-panel', { value }), stylex.props(xstyle), rest)}
        />
      </HeadingLevelProvider>
    </ContentPanelContext.Provider>
  );
});

/**
 * A surface you navigate: a column of destinations beside the page each one opens.
 *
 * ```tsx
 * <Profile.Root value={page} onValueChange={setPage}>
 *   <Profile.Title>User profile</Profile.Title>
 *   <Profile.Nav>
 *     <Profile.NavItem value='account' icon={<Icon name='user-circle' size='sm' />}>Account</Profile.NavItem>
 *   </Profile.Nav>
 *   <Profile.Content>
 *     <Profile.ContentPanel value='account'>…</Profile.ContentPanel>
 *   </Profile.Content>
 * </Profile.Root>
 * ```
 */
export const Profile = { Root, Title, Nav, NavItem, Content, ContentPanel };
