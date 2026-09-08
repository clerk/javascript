import type { TabsProps } from '@clerk/headless/tabs';
import { Tabs } from '@clerk/headless/tabs';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ClerkLogo } from './components/clerk-logo';
import { Dialog, DialogContext } from './components/dialog';
import { Icon } from './components/icon';
import { VisuallyHidden } from './components/visually-hidden';
import type { IconName } from './icons/registry';
import { contentScroll, mainScroll, styles } from './profile-page.styles';
import type { MosaicComponentProps } from './props';
import { mergeStyleProps, themeProps } from './props';
import { focusOutline } from './utils/focus-outline.styles';
import { reset } from './utils/reset.styles';

export interface ProfilePageItem {
  value: string;
  label: string;
  icon: IconName;
}

export interface ProfilePageRootProps extends Omit<MosaicComponentProps<'div'>, 'children'> {
  /**
   * What the page is called. Inside a dialog it names the dialog, through a visually hidden
   * heading carrying the popup's `labelId` — the counterpart of `Card.Title`, for a surface
   * whose visible headings belong to its panels.
   */
  label?: string;
  value: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsProps['orientation'];
  activationMode?: TabsProps['activationMode'];
  children: React.ReactNode;
}

/**
 * The page: a surface holding a sidebar and a content column. Rendered inside a `panel` dialog's
 * popup, it fills it and paints it — the dialog positions, the page paints, the way a `Card` does
 * inside a `card` dialog. Like `Card`, it reads `DialogContext` to name the dialog and carry its
 * dismiss, so the composition needs nothing passed in; standalone it renders neither.
 */
const ProfilePageRoot = React.forwardRef<HTMLDivElement, ProfilePageRootProps>(function ProfilePageRoot(
  {
    label,
    value,
    onValueChange,
    orientation = 'vertical',
    activationMode,
    children,
    render,
    className,
    style,
    ...rest
  },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-page'),
        stylex.props(reset.base, styles.root, dialog !== null && styles.rootInDialog),
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
          {dialog && label ? <VisuallyHidden render={<h2 id={dialog.labelId} />}>{label}</VisuallyHidden> : null}
          <div {...mergeStyleProps(themeProps('profile-page-layout'), stylex.props(reset.base, styles.layout))}>
            {children}
          </div>
        </>
      ),
    },
  });

  return (
    <Tabs.Root
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      activationMode={activationMode}
    >
      {element}
    </Tabs.Root>
  );
});

export interface ProfilePageSidebarProps extends Omit<MosaicComponentProps<'aside'>, 'children'> {
  items: readonly ProfilePageItem[];
  navigationLabel: string;
  renderBranding?: boolean;
}

const ProfilePageSidebar = React.forwardRef<HTMLElement, ProfilePageSidebarProps>(function ProfilePageSidebar(
  { items, navigationLabel, renderBranding = true, render, className, style, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  return useRender({
    defaultTagName: 'aside',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-page-sidebar'),
        stylex.props(reset.base, styles.sidebar, dialog !== null && !dialog.inline && styles.sidebarInDialog),
        className,
        style,
      ),
      ...rest,
      children: (
        <>
          <nav aria-label={navigationLabel}>
            <Tabs.List
              {...mergeStyleProps(themeProps('profile-page-navigation'), stylex.props(reset.base, styles.navigation))}
            >
              {items.map(item => (
                <Tabs.Tab
                  key={item.value}
                  value={item.value}
                  {...mergeStyleProps(
                    themeProps('profile-page-navigation-item'),
                    stylex.props(reset.base, styles.navigationItem, focusOutline.visible),
                  )}
                >
                  <Icon
                    aria-hidden
                    name={item.icon}
                    size='sm'
                  />
                  <span {...themeProps('profile-page-navigation-label')}>{item.label}</span>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </nav>
          {renderBranding ? (
            <div {...mergeStyleProps(themeProps('profile-page-branding'), stylex.props(reset.base, styles.branding))}>
              <span>Secured by</span>
              <a
                aria-label='Clerk'
                href='https://go.clerk.com/components'
                rel='noopener noreferrer'
                target='_blank'
                {...mergeStyleProps(
                  themeProps('profile-page-branding-link'),
                  stylex.props(reset.base, styles.brandingLink, focusOutline.visible),
                )}
              >
                <ClerkLogo height={12} />
              </a>
            </div>
          ) : null}
        </>
      ),
    },
  });
});

export interface ProfilePageContentProps extends Omit<MosaicComponentProps<'main'>, 'children'> {
  children: React.ReactNode;
}

const ProfilePageContent = React.forwardRef<HTMLElement, ProfilePageContentProps>(function ProfilePageContent(
  { children, render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'main',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-page-main'),
        stylex.props(reset.base, styles.main, mainScroll),
        className,
        style,
      ),
      ...rest,
      children: (
        <div
          {...mergeStyleProps(
            themeProps('profile-page-content'),
            stylex.props(reset.base, styles.content, ...contentScroll),
          )}
        >
          {children}
        </div>
      ),
    },
  });
});

export interface ProfilePagePanelProps extends MosaicComponentProps<'div'> {
  value: string;
}

const ProfilePagePanel = React.forwardRef<HTMLDivElement, ProfilePagePanelProps>(function ProfilePagePanel(
  { value, className, style, ...rest },
  ref,
) {
  return (
    <Tabs.Panel
      ref={ref}
      value={value}
      {...mergeStyleProps(themeProps('profile-page-panel', { value }), className, style)}
      {...rest}
    />
  );
});

export const ProfilePage = {
  Root: ProfilePageRoot,
  Sidebar: ProfilePageSidebar,
  Content: ProfilePageContent,
  Panel: ProfilePagePanel,
};
