import { createContextAndHook, useSafeLayoutEffect } from '@clerk/shared';
import React, { useEffect } from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Icon, localizationKeys, useLocalizations } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useNavigateToFlowStart, usePopover } from '../hooks';
import { Menu } from '../icons';
import { useRouter } from '../router';
import type { PropsOfComponent } from '../styledSystem';
import { animations, mqu } from '../styledSystem';
import { colors, sleep } from '../utils';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';

type NavbarContextValue = { isOpen: boolean; open: () => void; close: () => void };
export const [NavbarContext, useNavbarContext, useUnsafeNavbarContext] =
  createContextAndHook<NavbarContextValue>('NavbarContext');

export const NavbarContextProvider = (props: React.PropsWithChildren<Record<never, never>>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ value: { isOpen, open, close } }), [isOpen]);
  return <NavbarContext.Provider value={value}>{props.children}</NavbarContext.Provider>;
};

export type NavbarRoute = {
  name: LocalizationKey | string;
  id: string;
  icon: React.ComponentType;
  path: string;
  external?: boolean;
};
type RouteId = NavbarRoute['id'];
type NavBarProps = {
  contentRef: React.RefObject<HTMLDivElement>;
  routes: NavbarRoute[];
  header?: React.ReactNode;
};

const getSectionId = (id: RouteId) => `#cl-section-${id}`;

export const NavBar = (props: NavBarProps) => {
  const { contentRef, routes, header } = props;
  const [activeId, setActiveId] = React.useState<RouteId>('');
  const { close } = useNavbarContext();
  const { navigate } = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { t } = useLocalizations();
  const router = useRouter();

  const handleNavigate = (route: NavbarRoute) => {
    if (route?.external) {
      return () => navigate(route.path);
    } else {
      return () => navigateAndScroll(route);
    }
  };

  const navigateAndScroll = async (route: NavbarRoute) => {
    if (contentRef.current) {
      setActiveId(route.id);
      close();
      if (route.path === '/') {
        // TODO: this is needed to correctly handle navigations
        // when the component is opened as a modal
        await navigateToFlowStart();
      } else {
        await navigate(route.path);
      }
      const el = contentRef.current?.querySelector(getSectionId(route.id));
      //sleep to avoid conflict with floating-ui close
      await sleep(10);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useSafeLayoutEffect(
    function selectNavItemBasedOnVisibleSection() {
      const callback: IntersectionObserverCallback = entries => {
        for (const entry of entries) {
          const id = entry.target?.id?.split('section-')[1];
          if (entry.isIntersecting && id) {
            return setActiveId(id);
          }
        }
      };
      const observer = new IntersectionObserver(callback, { root: contentRef.current, threshold: 1 });

      const mountObservers = () => {
        const ids = routes.map(r => r.id);
        const sectionElements = ids
          .map(getSectionId)
          .map(id => contentRef.current?.querySelector(id))
          .filter(s => s);

        if (sectionElements.length === 0) {
          return false;
        }

        sectionElements.forEach(section => section && observer.observe(section));
        return true;
      };

      const intervalId = setInterval(() => {
        if (mountObservers()) {
          clearInterval(intervalId);
        }
      }, 50);

      return () => {
        observer.disconnect();
      };
    },
    [router],
  );

  useEffect(() => {
    routes.every(route => {
      const isRoot = router.currentPath === router.fullPath && route.path === '/';
      const matchesPath = router.matches(route.path);
      if (isRoot || matchesPath) {
        setActiveId(route.id);
        return false;
      }
      return true;
    });
  }, [router.currentPath]);

  const items = (
    <Col elementDescriptor={descriptors.navbarButtons}>
      {routes.map(r => (
        <NavButton
          key={r.id}
          elementDescriptor={descriptors.navbarButton}
          elementId={descriptors.navbarButton.setId(r.id as any)}
          iconElementDescriptor={descriptors.navbarButtonIcon}
          iconElementId={descriptors.navbarButtonIcon.setId(r.id) as any}
          onClick={handleNavigate(r)}
          icon={r.icon}
          isActive={activeId === r.id}
        >
          {t(r.name)}
        </NavButton>
      ))}
    </Col>
  );

  return (
    <>
      <NavbarContainer>
        {header}
        {items}
      </NavbarContainer>
      <MobileNavbarContainer>
        {header}
        {items}
      </MobileNavbarContainer>
    </>
  );
};

const NavbarContainer = (props: React.PropsWithChildren<Record<never, never>>) => {
  return (
    <Col
      elementDescriptor={descriptors.navbar}
      sx={t => ({
        flex: `0 0 ${t.space.$60}`,
        maxWidth: t.space.$60,
        borderRight: `${t.borders.$normal} ${t.colors.$blackAlpha300}`,
        padding: `${t.space.$9x5} ${t.space.$6}`,
        [mqu.md]: {
          display: 'none',
        },
        color: t.colors.$colorText,
      })}
    >
      {props.children}
    </Col>
  );
};

const MobileNavbarContainer = withFloatingTree((props: React.PropsWithChildren<Record<never, never>>) => {
  const navbarContext = useNavbarContext();
  const { floating, isOpen, open, close, nodeId, context } = usePopover({ defaultOpen: false, autoUpdate: false });

  React.useEffect(() => {
    if (navbarContext.isOpen) {
      open();
    } else {
      close();
    }
  }, [navbarContext.isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      navbarContext.close();
    }
  }, [isOpen]);

  return (
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
      order={['floating', 'content']}
      portal={false}
    >
      <Col
        sx={t => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
          zIndex: t.zIndices.$navbar,
          borderRadius: t.radii.$xl,
          overflow: 'hidden',
          color: t.colors.$colorText,
        })}
      >
        <Col
          ref={floating}
          elementDescriptor={descriptors.navbar}
          tabIndex={0}
          sx={t => ({
            outline: 0,
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: t.space.$60,
            backgroundColor: colors.makeSolid(t.colors.$colorBackground),
            borderTopRightRadius: t.radii.$lg,
            borderBottomRightRadius: t.radii.$lg,
            borderRight: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
            padding: `${t.space.$9x5} ${t.space.$6}`,
            animation: `${animations.navbarSlideIn} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
            boxShadow: t.shadows.$cardDropShadow,
          })}
        >
          {props.children}
        </Col>
      </Col>
    </Popover>
  );
});

type NavButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ComponentType;
  iconElementDescriptor: ElementDescriptor;
  iconElementId: ElementId;
  isActive?: boolean;
};

const NavButton = (props: NavButtonProps) => {
  const { icon, children, isActive, iconElementDescriptor, iconElementId, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      textVariant='buttonRegularMedium'
      isActive={isActive}
      {...rest}
      sx={t => ({
        gap: t.space.$4,
        justifyContent: 'flex-start',
        backgroundColor: isActive ? t.colors.$blackAlpha50 : undefined,
        opacity: isActive ? 1 : 0.6,
      })}
    >
      <Icon
        elementDescriptor={iconElementDescriptor}
        elementId={iconElementId}
        icon={icon}
        sx={{ opacity: isActive ? 1 : 0.7 }}
      />
      {children}
    </Button>
  );
};

export const NavbarMenuButtonRow = (props: PropsOfComponent<typeof Button>) => {
  const { open } = useUnsafeNavbarContext();
  const { t } = useLocalizations();

  const navbarContextExistsInTree = !!open;
  if (!navbarContextExistsInTree) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.navbarMobileMenuRow}
      sx={{
        display: 'none',
        [mqu.md]: {
          display: 'flex',
        },
      }}
    >
      <Button
        elementDescriptor={descriptors.navbarMobileMenuButton}
        {...props}
        // @ts-ignore
        onClick={open}
        size='xs'
        variant='ghost'
        colorScheme='neutral'
        sx={t => ({
          color: t.colors.$colorText,
          gap: t.space.$1x5,
          width: 'fit-content',
          alignItems: 'center',
        })}
      >
        <Icon
          elementDescriptor={descriptors.navbarMobileMenuButtonIcon}
          icon={Menu}
          size='sm'
        />
        {t(localizationKeys('userProfile.mobileButton__menu'))}
      </Button>
    </Flex>
  );
};
