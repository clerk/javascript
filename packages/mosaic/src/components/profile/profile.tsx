import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { TabsProps } from '../../primitives/tabs';
import { Tabs } from '../../primitives/tabs';
import { useRender } from '../../primitives/utils';
import { autoUpdate, getDimensions } from '../../primitives/utils/dom';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { BadgeContext } from '../badge/badge.context';
import { Branding } from '../branding';
import { Dialog, DialogContext, isInDialog } from '../dialog';
import { Drawer } from '../drawer';
import { HeadingLevelProvider, useHeadingLevel } from '../heading';
import { Popover } from '../popover';
import { VisuallyHidden } from '../visually-hidden';
import type { ProfileContextValue } from './profile.context';
import { ContentPanelContext, ProfileContext } from './profile.context';
import { contentScroll, contentViewportScroll, styles } from './profile.styles';

type NavLayout = 'column' | 'popover' | 'sheet';

// The sentinel's width (1/2/3px) carries the CSS breakpoints into JS; unmeasured is wide.
function navLayoutFor(sentinelWidth: number): NavLayout {
  if (sentinelWidth >= 3) {
    return 'sheet';
  }
  return sentinelWidth >= 2 ? 'popover' : 'column';
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
  const [navLayout, setNavLayout] = React.useState<NavLayout>('column');
  useSafeLayoutEffect(() => {
    if (!sentinel) {
      return;
    }
    return autoUpdate(sentinel, () => setNavLayout(navLayoutFor(getDimensions(sentinel).width)));
  }, [sentinel]);
  const compact = navLayout !== 'column';
  const pageTitles = React.useRef(new Map<string, HTMLElement>());
  const registerPageTitle = React.useCallback((page: string, element: HTMLElement | null) => {
    if (element) {
      pageTitles.current.set(page, element);
    } else {
      pageTitles.current.delete(page);
    }
  }, []);
  const pageTitleFor = React.useCallback((page: string) => pageTitles.current.get(page) ?? null, []);
  // Scoped to a layout so the replacement sheet or popover never mounts open.
  const [navOpenIn, setNavOpenIn] = React.useState<NavLayout | null>(null);
  const navOpen = navOpenIn === navLayout;
  const [navOpenedByKeyboard, setNavOpenedByKeyboard] = React.useState(false);
  const openNav = React.useCallback(
    (byKeyboard: boolean) => {
      setNavOpenIn(navLayout);
      setNavOpenedByKeyboard(byKeyboard);
    },
    [navLayout],
  );
  const closeNav = React.useCallback(() => setNavOpenIn(null), []);
  React.useEffect(() => {
    setNavOpenIn(null);
  }, [navLayout]);
  const context = React.useMemo(
    () => ({
      titleId,
      renderBranding,
      compact,
      navLayout,
      navOpen,
      navOpenedByKeyboard,
      openNav,
      closeNav,
      value,
      registerPageTitle,
      pageTitleFor,
      inline,
    }),
    [
      titleId,
      renderBranding,
      compact,
      navLayout,
      navOpen,
      navOpenedByKeyboard,
      openNav,
      closeNav,
      value,
      registerPageTitle,
      pageTitleFor,
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
        onValueChange={next => {
          onValueChange?.(next);
          closeNav();
        }}
        orientation={orientation}
        // Compact, arrowing through the list must not switch the page behind it.
        activationMode={compact ? 'manual' : activationMode}
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

function focusListEdge(event: React.KeyboardEvent<HTMLElement>) {
  if (event.target !== event.currentTarget || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) {
    return;
  }
  event.preventDefault();
  const tabs = event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])');
  (event.key === 'ArrowDown' ? tabs[0] : tabs[tabs.length - 1])?.focus();
}

function NavBranding() {
  return (
    <div {...mergeStyleProps(themeProps('profile-branding'), stylex.props(reset.base, styles.branding))}>
      <Branding />
    </div>
  );
}

/**
 * Children are `Profile.NavItem`s only; they render inside the tablist. Compact, the tablist moves
 * into a popover (a sheet on a phone) opened from the page's `Panel.Title`.
 */
const Nav = React.forwardRef<HTMLElement, ProfileNavProps>(function ProfileNav(
  { children, render, xstyle, ...rest },
  ref,
) {
  const profile = useProfileContext('Profile.Nav');
  const {
    titleId,
    renderBranding,
    compact,
    navLayout,
    navOpen,
    navOpenedByKeyboard,
    closeNav,
    value,
    pageTitleFor,
    inline,
  } = profile;
  // The opener's page is hidden after a choice, so focus returns to the new page's title instead.
  const finalFocus = React.useCallback(() => pageTitleFor(value), [pageTitleFor, value]);
  const navRef = React.useRef<HTMLElement | null>(null);
  const inPopover = navLayout === 'popover';
  const list = (
    <Tabs.List {...mergeStyleProps(themeProps('profile-nav-list'), stylex.props(reset.base, styles.navList))}>
      {children}
    </Tabs.List>
  );
  const element = useRender({
    defaultTagName: 'nav',
    render,
    ref: [navRef, ref],
    props: {
      'aria-labelledby': titleId,
      // A pointer open focuses the nav, and the arrows move into the list, as in `Menu`.
      ...(inPopover ? { tabIndex: -1, onKeyDown: focusListEdge } : null),
      ...mergeStyleProps(
        themeProps('profile-nav', { compact }),
        stylex.props(
          reset.base,
          styles.nav,
          (inline || compact) && styles.navFlush,
          inPopover && styles.navInPopover,
          xstyle,
        ),
        rest,
      ),
      children: (
        <>
          {list}
          {renderBranding && !compact && !inline ? <NavBranding /> : null}
        </>
      ),
    },
  });

  if (!compact) {
    return element;
  }
  const onOpenChange = (open: boolean) => {
    if (!open) {
      closeNav();
    }
  };
  if (inPopover) {
    return (
      <Popover.Root
        open={navOpen}
        onOpenChange={onOpenChange}
        placement='bottom-start'
        // The title opens the popover itself, so the popover cannot see a keyboard open.
        initialFocus={navOpenedByKeyboard ? 'first' : navRef}
      >
        <Popover.Popup
          anchor={pageTitleFor(value)}
          aria-labelledby={titleId}
          finalFocus={finalFocus}
          xstyle={styles.navPopover}
        >
          {element}
        </Popover.Popup>
      </Popover.Root>
    );
  }
  return (
    <Drawer.Root
      open={navOpen}
      onOpenChange={onOpenChange}
    >
      <Drawer.Popup
        aria-labelledby={titleId}
        finalFocus={finalFocus}
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
  const { compact, closeNav } = useProfileContext('Profile.NavItem');
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
      {...mergeStyleProps(
        themeProps('profile-nav-item'),
        stylex.props(reset.base, styles.navItem, focusOutline.visible, xstyle),
        rest,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          {...mergeStyleProps(themeProps('profile-nav-item-icon'), stylex.props(reset.base, styles.navItemIcon))}
        >
          {icon}
        </span>
      ) : null}
      <span {...themeProps('profile-nav-item-label')}>{children}</span>
      {badge != null ? (
        <span {...mergeStyleProps(themeProps('profile-nav-item-badge'), stylex.props(reset.base, styles.navItemBadge))}>
          <BadgeContext.Provider value={navItemBadgeDefaults}>{badge}</BadgeContext.Provider>
        </span>
      ) : null}
    </Tabs.Tab>
  );
});

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

export interface ProfileContentPanelProps extends MosaicComponentProps<'div'> {
  value: string;
  /** Keeps unselected pages mounted (`inert`, in flow) so a page transition can be styled. */
  shouldForceMount?: boolean;
}

const ContentPanel = React.forwardRef<HTMLDivElement, ProfileContentPanelProps>(function ProfileContentPanel(
  { value, shouldForceMount, xstyle, ...rest },
  ref,
) {
  const { compact } = useProfileContext('Profile.ContentPanel');
  const titleId = React.useId();
  const panel = React.useMemo(() => ({ titleId, value }), [titleId, value]);
  return (
    <ContentPanelContext.Provider value={panel}>
      <HeadingLevelProvider>
        <Tabs.Panel
          ref={ref}
          value={value}
          shouldForceMount={shouldForceMount}
          // Compact, the naming tab is not mounted; an explicit `undefined` would drop the primitive's label.
          {...(compact ? { 'aria-labelledby': titleId } : null)}
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
