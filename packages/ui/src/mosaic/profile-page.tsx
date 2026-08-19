import type { TabsProps } from '@clerk/headless/tabs';
import { Tabs } from '@clerk/headless/tabs';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ClerkLogo } from './components/clerk-logo';
import { Icon } from './components/icon';
import { reset } from './components/reset.styles';
import type { IconName } from './icons/registry';
import { styles } from './profile-page.styles';
import type { MosaicComponentProps } from './props';
import { mergeStyleProps, themeProps } from './props';

export interface ProfilePageItem {
  value: string;
  label: string;
  icon: IconName;
}

export interface ProfilePageRootProps extends Omit<MosaicComponentProps<'div'>, 'children'> {
  value: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsProps['orientation'];
  activationMode?: TabsProps['activationMode'];
  children: React.ReactNode;
}

const ProfilePageRoot = React.forwardRef<HTMLDivElement, ProfilePageRootProps>(function ProfilePageRoot(
  { value, onValueChange, orientation = 'vertical', activationMode, children, render, className, style, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('profile-page'), stylex.props(styles.root), className, style),
      ...rest,
      children,
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
  return useRender({
    defaultTagName: 'aside',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('profile-page-sidebar'),
        stylex.props(reset.base, styles.sidebar),
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
                    stylex.props(reset.base, styles.navigationItem),
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
                  stylex.props(reset.base, styles.brandingLink),
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
      ...mergeStyleProps(themeProps('profile-page-main'), stylex.props(reset.base, styles.main), className, style),
      ...rest,
      children: (
        <div {...mergeStyleProps(themeProps('profile-page-content'), stylex.props(reset.base, styles.content))}>
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
