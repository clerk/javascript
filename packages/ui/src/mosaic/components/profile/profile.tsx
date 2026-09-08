import type { TabsProps } from '@clerk/headless/tabs';
import { Tabs } from '@clerk/headless/tabs';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useMeasure } from '../../hooks/useMeasure';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { Branding } from '../branding';
import { Dialog, DialogContext } from '../dialog';
import { Drawer } from '../drawer';
import { Heading } from '../heading';
import { Icon } from '../icon';
import { VisuallyHidden } from '../visually-hidden';
import { contentScroll, contentViewportScroll, styles } from './profile.styles';

interface ProfileContextValue {
  /** The id `Profile.Title` renders under; the navigation and the sheet point their names at it. */
  titleId: string;
  renderBranding: boolean;
  /** Below `COMPACT_WIDTH`: the navigation lives in a sheet, opened from a page's title. */
  compact: boolean;
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  /** The root element, for parts that have to find something inside the profile. */
  root: HTMLElement | null;
  /** Flush: the page's own content — `elevation='flush'`, or an `inline` dialog. */
  inline: boolean;
}

const ProfileContext = React.createContext<ProfileContextValue | null>(null);

/** The id a `Profile.PageTitle` renders under, so the panel around it can be named by it. */
const TabPanelContext = React.createContext<string | undefined>(undefined);

/**
 * The width below which the layout is compact — the same `48rem` the container query in
 * `profile.styles.ts` reads, measured here because WHERE the navigation renders is a DOM decision
 * CSS cannot make: one tablist, in the column or in the sheet, never both.
 */
const COMPACT_MAX_WIDTH_REM = 48;

/** `width <= 48rem`, the way the container query reads it. Unmeasured, or not laid out, is wide. */
function isCompact(width: number | null): boolean {
  if (width === null || width === 0) {
    return false;
  }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return width <= COMPACT_MAX_WIDTH_REM * rem;
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
  /** The selected page, by the `value` of its `Profile.NavItem` and `Profile.TabPanel`. */
  value: string;
  onValueChange?: (value: string) => void;
  /**
   * Arrow-key direction in the navigation. Vertical, since the navigation is a column; the compact
   * row is a container query the keyboard model cannot see.
   *
   * @default 'vertical'
   */
  orientation?: TabsProps['orientation'];
  activationMode?: TabsProps['activationMode'];
  /**
   * Signs the foot of the navigation with "Secured by Clerk". An instance that has paid the
   * branding off carries none of it, so a connected surface passes `displayConfig.branded` here.
   *
   * @default true
   */
  renderBranding?: boolean;
  /**
   * How the surface sits in its host, the way `Card`'s does. `card` is framed: border, radius, a
   * fixed height with the pages scrolling inside. `flush` is the page's own content: no frame or
   * background, the page scrolls, the columns a gap apart. Over the page, in a `profile` dialog,
   * the popup decides and this is moot; an `inline` dialog implies `flush`.
   *
   * @default 'card'
   */
  elevation?: ProfileElevation;
  children: React.ReactNode;
}

/**
 * A surface you navigate: a column of destinations beside the page each one opens. The account
 * profile and the organization profile are both one of these.
 *
 * Rendered as the content of a `profile` dialog's popup, it fills it and paints it — the dialog
 * positions, the profile paints, the way a `Card` does inside a `card` dialog. Like `Card`, it
 * reads `DialogContext` to name the dialog (through `Profile.Title`) and carry its dismiss, so the
 * composition needs nothing passed in; standalone it carries no dismiss.
 */
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const inline = elevation === 'flush' || (dialog?.inline ?? false);
  // Inside a dialog the title takes the id the popup points `aria-labelledby` at, so the surface
  // names the dialog without knowing it is in one — the way `Card.Title` does.
  const generatedTitleId = React.useId();
  const titleId = dialog?.labelId ?? generatedTitleId;
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const [measure, { width }] = useMeasure<HTMLDivElement>();
  const compact = isCompact(width);
  const [navOpen, setNavOpen] = React.useState(false);
  const openNav = React.useCallback(() => setNavOpen(true), []);
  const closeNav = React.useCallback(() => setNavOpen(false), []);
  // Widening past the threshold unmounts the sheet; the state must go with it, or the sheet would
  // be back the moment the layout narrowed again, unasked.
  React.useEffect(() => {
    if (!compact) {
      setNavOpen(false);
    }
  }, [compact]);
  const context = React.useMemo(
    () => ({ titleId, renderBranding, compact, navOpen, openNav, closeNav, root: node, inline }),
    [titleId, renderBranding, compact, navOpen, openNav, closeNav, node, inline],
  );
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [setNode, measure, ref],
    props: {
      ...mergeStyleProps(
        themeProps('profile', { elevation: inline ? 'flush' : 'card' }),
        stylex.props(reset.base, styles.root, dialog !== null && !dialog.inline && styles.rootInDialog),
        className,
        style,
      ),
      ...rest,
      children: (
        <>
          {/* First in the DOM, so it is the first tabbable element and takes the dialog's opening
              focus — the same reason `Card.Header` renders its dismiss first. Never inline, which
              nothing closes. */}
          {dialog && !dialog.inline ? <Dialog.CloseButton /> : null}
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
        onValueChange={onValueChange}
        orientation={orientation}
        activationMode={activationMode}
      >
        {element}
      </Tabs.Root>
    </ProfileContext.Provider>
  );
});

export type ProfileTitleProps = MosaicComponentProps<'h2'>;

/**
 * What the surface is called — "User profile", "Organization" — as a visually hidden heading. The
 * navigation and the compact sheet take their accessible names from it, and inside a dialog it
 * names the dialog too, through the popup's `labelId`: the counterpart of `Card.Title`, for a
 * surface whose visible headings belong to its pages.
 */
const Title = React.forwardRef<HTMLHeadingElement, ProfileTitleProps>(function ProfileTitle(
  { render, className, style, ...rest },
  ref,
) {
  const { titleId } = useProfileContext('Profile.Title');
  return (
    <VisuallyHidden
      ref={ref as React.Ref<HTMLSpanElement>}
      render={render ?? <h2 />}
      {...mergeStyleProps(themeProps('profile-title'), className, style)}
      {...rest}
      // The ids the navigation and the dialog point at, so the caller's cannot displace it.
      id={titleId}
    />
  );
});

export type ProfileNavProps = MosaicComponentProps<'nav'>;

function NavBranding() {
  return (
    <div {...mergeStyleProps(themeProps('profile-branding'), stylex.props(reset.base, styles.branding))}>
      <Branding />
    </div>
  );
}

/**
 * The navigation: the destinations, and the branding at their foot. Its children are
 * `Profile.NavItem`s; they render inside the tablist, so nothing else belongs among them.
 *
 * Beside the content it is a column. Compact, it renders nothing in place: the tablist moves into
 * a sheet that a page's title opens (`Profile.PageTitle`), and closes on a choice — the branding
 * stays behind, since a sheet is not the surface. One tablist, wherever it lives — two would be
 * two sets of tabs for one set of pages.
 */
const Nav = React.forwardRef<HTMLElement, ProfileNavProps>(function ProfileNav(
  { children, render, className, style, ...rest },
  ref,
) {
  const profile = useProfileContext('Profile.Nav');
  const { titleId, renderBranding, compact, navOpen, closeNav, root, inline } = profile;
  // The headline that opened the sheet belongs to the page a choice just left, so the sheet's own
  // return-focus would land on nothing. The headline of the page now showing is the same control,
  // on the destination.
  const finalFocus = React.useCallback(
    () =>
      root?.querySelector<HTMLElement>('.cl-profile-tab-panel:not([hidden]):not([inert]) .cl-profile-nav-trigger') ??
      null,
    [root],
  );
  const list = (
    <Tabs.List {...mergeStyleProps(themeProps('profile-nav-list'), stylex.props(reset.base, styles.navList))}>
      {children}
    </Tabs.List>
  );
  const element = useRender({
    defaultTagName: 'nav',
    render,
    ref,
    props: {
      'aria-labelledby': titleId,
      ...mergeStyleProps(
        themeProps('profile-nav', { compact }),
        stylex.props(reset.base, styles.nav, inline && styles.navInline, compact && styles.navInSheet),
        className,
        style,
      ),
      ...rest,
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
        height='two-thirds'
        finalFocus={finalFocus}
      >
        {element}
      </Drawer.Popup>
    </Drawer.Root>
  );
});

export interface ProfileNavItemProps extends MosaicComponentProps<'button'> {
  /** Matches the `value` of the `Profile.TabPanel` this destination opens. */
  value: string;
  /** Leads the label. Any node, so a page of the consumer's own can bring its own mark. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

/** A destination. Selecting it shows the `Profile.TabPanel` sharing its `value`. */
const NavItem = React.forwardRef<HTMLButtonElement, ProfileNavItemProps>(function ProfileNavItem(
  { value, icon, disabled, children, render, className, style, onClick, ...rest },
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
        // A choice in the sheet is the end of the visit; arrowing through the list is not.
        if (compact && !event.defaultPrevented && !disabled) {
          closeNav();
        }
      }}
      {...mergeStyleProps(
        themeProps('profile-nav-item'),
        stylex.props(reset.base, styles.navItem, focusOutline.visible),
        className,
        style,
      )}
      {...rest}
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
    </Tabs.Tab>
  );
});

export type ProfilePageTitleProps = MosaicComponentProps<'div'>;

/**
 * A page's headline. Inside a profile that has gone compact the headline IS the way to the other
 * pages: the heading holds a button — the title, and a caret beside it — that opens the navigation
 * sheet. Anywhere else — the wide layout, or a page rendered on its own — it is the heading alone.
 *
 * The caret sits `vertical-align: middle`, which CSS defines as the box's midpoint on the parent's
 * baseline plus half its x-height: optically centred on the lowercase letters rather than on the
 * line box. That needs an inline formatting context, so the button is `display: inline`.
 */
const PageTitle = React.forwardRef<HTMLDivElement, ProfilePageTitleProps>(function ProfilePageTitle(
  { children, render, className, style, ...rest },
  ref,
) {
  const profile = React.useContext(ProfileContext);
  const panelTitleId = React.useContext(TabPanelContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-page-title'),
        stylex.props(reset.base, styles.pageTitle),
        className,
        style,
      ),
      ...rest,
      children: (
        <Heading
          id={panelTitleId}
          render={<h3 />}
          size='2xl'
        >
          {profile?.compact ? (
            <button
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
                aria-hidden
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

export type ProfileContentProps = MosaicComponentProps<'div'>;

/**
 * The column the pages render in. Standalone and over the page it is the surface's scroll region
 * — the navigation stays put while a long page scrolls; inline the page itself scrolls and the
 * branding closes the column out. A plain `div`: the profile is often the content of the host's
 * own `main`, or of a dialog, so it claims no landmark.
 */
const Content = React.forwardRef<HTMLDivElement, ProfileContentProps>(function ProfileContent(
  { children, render, className, style, ...rest },
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
        stylex.props(reset.base, styles.content, inline ? styles.contentInline : contentScroll),
        className,
        style,
      ),
      ...rest,
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

export interface ProfileTabPanelProps extends MosaicComponentProps<'div'> {
  /** Matches the `value` of the `Profile.NavItem` that opens this page. */
  value: string;
  /**
   * Keeps the page in the document while another is selected — `inert`, and carrying the tabs
   * primitive's transition attributes — so a page transition can be styled. Off, an unselected
   * page is `hidden`. Stack the pages yourself when on: they are all in flow.
   */
  shouldForceMount?: boolean;
}

/**
 * One destination's content, shown while its `value` is selected and `hidden` otherwise. With
 * `shouldForceMount` it stays in the document and carries the tabs primitive's transition contract
 * — `data-open` / `data-closed`, `data-starting-style` / `data-ending-style`, and
 * `--cl-tab-transition-direction` — so a page transition is a styling change rather than a new part.
 */
const TabPanel = React.forwardRef<HTMLDivElement, ProfileTabPanelProps>(function ProfileTabPanel(
  { value, shouldForceMount, className, style, ...rest },
  ref,
) {
  const { compact } = useProfileContext('Profile.TabPanel');
  const titleId = React.useId();
  return (
    <TabPanelContext.Provider value={titleId}>
      <Tabs.Panel
        ref={ref}
        value={value}
        shouldForceMount={shouldForceMount}
        // Compact, the tab it would be named by exists only while the sheet is open, so the panel
        // is named by its own title instead — `Profile.PageTitle` takes this id. Spread only then:
        // an explicit `undefined` would displace the primitive's own `aria-labelledby`.
        {...(compact ? { 'aria-labelledby': titleId } : null)}
        {...mergeStyleProps(themeProps('profile-tab-panel', { value }), className, style)}
        {...rest}
      />
    </TabPanelContext.Provider>
  );
});

/**
 * A surface you navigate, composed through `Profile.Root`, `Profile.Title`, `Profile.Nav`,
 * `Profile.NavItem`, `Profile.Content`, `Profile.TabPanel`, and `Profile.PageTitle`. Every part
 * accepts the Mosaic `render` prop and forwards its ref.
 *
 * ```tsx
 * <Profile.Root value={page} onValueChange={setPage}>
 *   <Profile.Title>User profile</Profile.Title>
 *   <Profile.Nav>
 *     <Profile.NavItem value='account' icon={<Icon name='user-circle' size='sm' />}>Account</Profile.NavItem>
 *   </Profile.Nav>
 *   <Profile.Content>
 *     <Profile.TabPanel value='account'>…</Profile.TabPanel>
 *   </Profile.Content>
 * </Profile.Root>
 * ```
 */
export const Profile = { Root, Title, Nav, NavItem, PageTitle, Content, TabPanel };
