import React from 'react';

import { Button, Col, descriptors, Flex, Icon } from '../customizables';
import { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { usePopover, useSafeLayoutEffect } from '../hooks';
import { Menu, TickShield, User } from '../icons';
import { animations, mqu, PropsOfComponent } from '../styledSystem';
import { colors, createContextAndHook } from '../utils';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type NavbarContextValue = { isOpen: boolean; open: () => void; close: () => void };
export const [NavbarContext, useNavbarContext] = createContextAndHook<NavbarContextValue>('NavbarContext');
export const NavbarContextProvider = (props: React.PropsWithChildren<{}>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ value: { isOpen, open, close } }), [isOpen]);
  return <NavbarContext.Provider value={value}>{props.children}</NavbarContext.Provider>;
};

export const BaseRoutes = [
  { name: 'Account', id: 'account', icon: User, path: '/' } as const,
  { name: 'Security', id: 'security', icon: TickShield, path: '/security' } as const,
] as const;
type BaseRouteId = typeof BaseRoutes[number]['id'];

type NavBarProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

const getSectionId = (id: BaseRouteId) => `#cl-userProfile-section-${id}`;

export const NavBar = (props: NavBarProps) => {
  const { contentRef } = props;
  const [activeId, setActiveId] = React.useState<BaseRouteId>('account');
  const { close } = useNavbarContext();
  const { navigateToFlowStart } = useNavigateToFlowStart();

  const navigateAndScroll = async (id: BaseRouteId) => {
    if (contentRef.current) {
      setActiveId(id);
      close();
      await navigateToFlowStart();
      const el = contentRef.current.querySelector(getSectionId(id));
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useSafeLayoutEffect(() => {
    const mountObservers = () => {
      const ids = BaseRoutes.map(r => r.id);
      const sectionElements = ids
        .map(getSectionId)
        .map(id => contentRef.current?.querySelector(id))
        .filter(s => s);

      if (sectionElements.length === 0) {
        return false;
      }

      const callback: IntersectionObserverCallback = entries => {
        for (const entry of entries) {
          const id = entry.target?.id?.split('section-')[1];
          if (entry.isIntersecting && id) {
            return setActiveId(id as any);
          }
        }
      };

      const observer = new IntersectionObserver(callback, { root: contentRef.current, threshold: 1 });
      sectionElements.forEach(section => section && observer.observe(section));
      return true;
    };

    const intervalId = setInterval(() => {
      if (mountObservers()) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  const items = (
    <Col
      elementDescriptor={descriptors.navbar}
      gap={2}
    >
      {BaseRoutes.map(r => (
        <NavButton
          key={r.id}
          elementDescriptor={descriptors.navbarItem}
          elementId={descriptors.navbarItem.setId(r.id)}
          iconElementDescriptor={descriptors.navbarIcon}
          iconElementId={descriptors.navbarIcon.setId(r.id)}
          onClick={() => navigateAndScroll(r.id)}
          icon={r.icon}
          isActive={activeId === r.id}
        >
          {r.name}
        </NavButton>
      ))}
    </Col>
  );

  return (
    <>
      <NavbarContainer>{items}</NavbarContainer>
      <MobileNavbarContainer>{items}</MobileNavbarContainer>
    </>
  );
};

const NavbarContainer = (props: React.PropsWithChildren<{}>) => {
  return (
    <Col
      elementDescriptor={descriptors.navbarSection}
      sx={theme => ({
        flex: `0 0 ${theme.space.$60}`,
        borderRight: `${theme.borders.$normal} ${theme.colors.$blackAlpha300}`,
        padding: `${theme.space.$9x5} ${theme.space.$6}`,
        [mqu.md]: {
          display: 'none',
        },
      })}
    >
      {props.children}
    </Col>
  );
};

const MobileNavbarContainer = (props: React.PropsWithChildren<{}>) => {
  const navbarContext = useNavbarContext();
  const { floating, isOpen, open, close } = usePopover({ defaultOpen: false, autoUpdate: false });

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

  if (!isOpen) {
    return null;
  }

  return (
    <Col
      sx={t => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        zIndex: t.zIndices.$navbar,
        borderRadius: t.radii.$xl,
        overflow: 'hidden',
      })}
    >
      <Col
        ref={floating}
        elementDescriptor={descriptors.navbarSection}
        sx={t => ({
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
  );
};

type NavButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ComponentType;
  iconElementDescriptor: ElementDescriptor;
  iconElementId: ElementId;
  isActive?: boolean;
};

const NavButton = (props: NavButtonProps) => {
  const { icon, children, isActive, contentEditable, iconElementDescriptor, iconElementId, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      textVariant='buttonRegularMedium'
      isActive={isActive}
      {...rest}
      sx={theme => ({
        gap: theme.space.$4,
        justifyContent: 'flex-start',
        backgroundColor: isActive ? theme.colors.$blackAlpha50 : undefined,
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
  const { open } = useNavbarContext();
  return (
    <Flex
      sx={{
        display: 'none',
        [mqu.md]: {
          display: 'flex',
        },
      }}
    >
      <Button
        {...props}
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
          icon={Menu}
          size='sm'
        />
        Menu
      </Button>
    </Flex>
  );
};
