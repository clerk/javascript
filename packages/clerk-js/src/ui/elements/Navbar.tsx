import { createContextAndHook } from '@clerk/shared/react';
import React, { useEffect } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  localizationKeys,
  Text,
  useLocalizations,
} from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useNavigateToFlowStart, usePopover } from '../hooks';
import { Menu } from '../icons';
import { useRouter } from '../router';
import type { PropsOfComponent } from '../styledSystem';
import { animations, mqu } from '../styledSystem';
import { colors } from '../utils';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';
import { PoweredByClerkTag } from './PoweredByClerk';

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
  title: LocalizationKey;
  description: LocalizationKey;
  contentRef: React.RefObject<HTMLDivElement>;
  routes: NavbarRoute[];
  header?: React.ReactNode;
};

export const NavBar = (props: NavBarProps) => {
  const { contentRef, title, description, routes, header } = props;
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
      return () => navigateToInternalRoute(route);
    }
  };

  const navigateToInternalRoute = async (route: NavbarRoute) => {
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
    }
  };

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
    <Col
      elementDescriptor={descriptors.navbarButtons}
      sx={t => ({ gap: t.space.$0x5 })}
    >
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
          sx={t => ({
            padding: `${t.space.$1x5} ${t.space.$3}`,
          })}
        >
          {t(r.name)}
        </NavButton>
      ))}
    </Col>
  );

  return (
    <>
      <NavbarContainer
        title={title}
        description={description}
      >
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

const NavbarContainer = (
  props: React.PropsWithChildren<{ title: LocalizationKey | string; description: LocalizationKey | string }>,
) => {
  const { title, description } = props;
  return (
    <Col
      elementDescriptor={descriptors.navbar}
      sx={t => ({
        [mqu.md]: {
          display: 'none',
        },
        padding: `${t.space.$6} ${t.space.$3} ${t.space.$3}`,
        color: t.colors.$colorText,
        justifyContent: 'space-between',
      })}
    >
      <Col sx={t => ({ gap: t.space.$6, flex: `0 0 ${t.space.$60}` })}>
        <Col
          sx={t => ({
            gap: t.space.$0x5,
            padding: `${t.space.$none} ${t.space.$3}`,
          })}
        >
          <Heading
            as='h1'
            localizationKey={title}
          />

          <Text
            colorScheme='neutral'
            localizationKey={description}
          />
        </Col>
        {props.children}
      </Col>
      <PoweredByClerkTag sx={{ justifyContent: 'start' }} />
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
            padding: `${t.space.$10} ${t.space.$6}`,
            animation: `${animations.navbarSlideIn} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
            boxShadow: t.shadows.$cardContentShadow,
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
  const { icon, children, isActive, iconElementDescriptor, iconElementId, sx, ...rest } = props;
  return (
    <Button
      variant='ghost'
      textVariant='buttonLarge'
      size='md'
      isActive={isActive}
      {...rest}
      sx={[
        t => ({
          gap: t.space.$4,
          justifyContent: 'flex-start',
          backgroundColor: isActive ? t.colors.$blackAlpha100 : undefined,
          opacity: isActive ? 1 : 0.6,
        }),
        sx,
      ]}
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
